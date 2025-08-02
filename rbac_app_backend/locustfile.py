# locustfile.py
# UI:
#   locust -f locustfile.py -H http://127.0.0.1:8000
#   (choose which user class to run in the UI)
#
# Headless examples:
#   # Regular read-heavy workload with JWT reuse
#   locust -f locustfile.py --headless --classes EmployeeUser \
#     -u 200 -r 10 -t 10m -H http://127.0.0.1:8000 --html report-read.html
#
#   # 500-user login stress (bcrypt/CPU)
#   locust -f locustfile.py --headless --classes LoginOnlyUser \
#     -u 500 -r 25 -t 10m -H http://127.0.0.1:8000 --html report-login-500.html

import os
import random
from locust import HttpUser, task, between

# ---- API paths ----
LOGIN_PATH = os.getenv("LOGIN_PATH", "/login")
LIST_PATH  = os.getenv("LIST_PATH", "/users-with-permissions")

# ---- Seeded users pool (must match your seeding) ----
EMP_DOMAIN   = os.getenv("EMP_DOMAIN", "example.com")
EMP_PASSWORD = os.getenv("EMP_PASSWORD", "ChangeMe123!")
TOTAL_USERS  = int(os.getenv("TOTAL_USERS", "200"))

# ---- Think time defaults ----
READ_THINK_MIN = float(os.getenv("READ_THINK_MIN", "1"))
READ_THINK_MAX = float(os.getenv("READ_THINK_MAX", "3"))

LOGIN_THINK_MIN = float(os.getenv("LOGIN_THINK_MIN", "0.2"))
LOGIN_THINK_MAX = float(os.getenv("LOGIN_THINK_MAX", "0.5"))


def do_login_json(client, email: str, password: str) -> str | None:
    r = client.post(
        LOGIN_PATH,
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"},
        name="POST /login",
    )
    if r.status_code == 200:
        return r.json().get("access_token")
    # Log a small sample of failures to see why
    try:
        if random.random() < 0.02:
            print("[LOGIN ERROR]", r.status_code, r.text[:300])
    except Exception:
        pass
    return None


def pick_user_email() -> str:
    idx = random.randint(1, TOTAL_USERS)
    return f"user{idx:03d}@{EMP_DOMAIN}"


# -----------------------------
# 1) Read-heavy user (your original flow)
# -----------------------------
class EmployeeUser(HttpUser):
    """
    - Logs in once on start and reuses JWT.
    - 3:1 ratio of GET:/users-with-permissions to re-login.
    - Think time ~1-3s.
    """
    wait_time = between(READ_THINK_MIN, READ_THINK_MAX)

    def on_start(self):
        self.email = pick_user_email()
        self.password = EMP_PASSWORD
        self.token = do_login_json(self.client, self.email, self.password)

    def _auth_headers(self) -> dict:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def list_users_with_permissions(self):
        if not self.token:
            self.token = do_login_json(self.client, self.email, self.password)
            if not self.token:
                return  # avoid 401 spam

        r = self.client.get(
            LIST_PATH,
            headers=self._auth_headers(),
            name="GET /users-with-permissions",
        )
        if r.status_code == 401:
            # One retry after re-login
            self.token = do_login_json(self.client, self.email, self.password)
            if self.token:
                self.client.get(
                    LIST_PATH,
                    headers=self._auth_headers(),
                    name="GET /users-with-permissions (retry)",
                )

    @task(1)
    def occasional_relogin(self):
        self.token = do_login_json(self.client, self.email, self.password)


# -----------------------------
# 2) Login-stress user (500-user login test)
# -----------------------------
class LoginOnlyUser(HttpUser):
    """
    - EVERY iteration performs POST /login (no token reuse).
    - Creates sustained CPU-bound bcrypt + DB read load.
    - Use this class with -u 500 -r 25 for a 500-user stress.
    """
    wait_time = between(LOGIN_THINK_MIN, LOGIN_THINK_MAX)

    @task(1)
    def login_every_time(self):
        email = pick_user_email()
        _ = do_login_json(self.client, email, EMP_PASSWORD)

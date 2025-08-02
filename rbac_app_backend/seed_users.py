# seed_users.py
"""
Seeds N employee users using the superadmin account.

Run server first:
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
Then:
  python seed_users.py
Env overrides:
  EMP_DOMAIN=example.com TOTAL_USERS=200 BASE_URL=http://127.0.0.1:8000
"""

import os
import asyncio
import httpx

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

LOGIN_PATH = os.getenv("LOGIN_PATH", "/login")          # POST {email, password}
CREATE_USER_PATH = os.getenv("CREATE_USER_PATH", "/users/")   # POST {username, email, password}

# Superadmin credentials (adjust if different)
SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "shyam@example.com")
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "shyam28122003.S")

# Seed plan
EMP_DOMAIN = os.getenv("EMP_DOMAIN", "example.com")   # must be valid for EmailStr
EMP_PASSWORD = os.getenv("EMP_PASSWORD", "ChangeMe123!")
TOTAL_USERS = int(os.getenv("TOTAL_USERS", "200"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "50"))
TIMEOUT = float(os.getenv("TIMEOUT", "30.0"))


def new_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=TIMEOUT,
        trust_env=False,
        http2=False,
    )


async def get_superadmin_token() -> str:
    async with new_client() as client:
        r = await client.post(
            LOGIN_PATH,
            json={"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD},
            headers={"Content-Type": "application/json"},
        )
        if r.status_code != 200:
            raise RuntimeError(f"Superadmin login failed {r.status_code}: {r.text}")
        token = r.json().get("access_token")
        if not token:
            raise RuntimeError("No access_token in login response")
        return token


async def create_user(session: httpx.AsyncClient, headers: dict, idx: int) -> None:
    username = f"user{idx:03d}"
    email = f"{username}@{EMP_DOMAIN}"
    payload = {"username": username, "email": email, "password": EMP_PASSWORD}
    r = await session.post(CREATE_USER_PATH, headers=headers, json=payload)
    if r.status_code not in (200, 201):
        # Log validation errors if any
        print(f"[CREATE-USER] {email}: {r.status_code} {r.text}")


async def main():
    # Quick reachability check
    try:
        async with new_client() as c:
            _ = await c.get("/docs")
    except Exception as e:
        print("[FATAL] Cannot reach server at", BASE_URL, "->", e)
        return

    token = await get_superadmin_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with new_client() as session:
        for start in range(1, TOTAL_USERS + 1, BATCH_SIZE):
            end = min(start + BATCH_SIZE - 1, TOTAL_USERS)
            tasks = [create_user(session, headers, i) for i in range(start, end + 1)]
            await asyncio.gather(*tasks)
            print(f"Seeded users {start:03d}..{end:03d}")

    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(main())

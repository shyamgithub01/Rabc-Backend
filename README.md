# 🚀 RBAC Backend API - FastAPI + PostgreSQL

![badge](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![badge](https://img.shields.io/badge/Built%20With-FastAPI-blue)
![badge](https://img.shields.io/badge/License-MIT-informational)

> 🎯 **A secure, modular, and scalable Role-Based Access Control (RBAC) backend system built using FastAPI, SQLAlchemy, PostgreSQL, and Alembic.**

---

## 📌 Features

- 🔐 JWT-based Auth (Login, Signup)
- 🧑‍💼 Role-based access: `superadmin`, `admin`, `user`
- 📂 Module & permission mapping (add, edit, delete, view)
- 🧾 Admins can assign/deassign permissions to users (limited to their modules)
- 🧠 Superadmin has global access
- 🧩 Clean folder structure (API, Services, Schemas, Models)

---

## 🧠 Architecture Overview

```mermaid
graph TD
  CLIENT[👤 Client (Browser/Postman)] --> FASTAPI[🚀 FastAPI App (main.py)]
  FASTAPI --> ROUTERS[📂 API Routers (users/, auth/)]
  ROUTERS --> SERVICES[⚙️ Services]
  SERVICES --> MODELS[🗃️ SQLAlchemy Models]
  SERVICES --> DB[(🛢️ PostgreSQL DB)]
  FASTAPI --> SCHEMAS[📐 Pydantic Schemas]
  FASTAPI --> DEP[🧩 Dependencies & Auth]
  DB --> ALEMBIC[🔁 Alembic Migrations]

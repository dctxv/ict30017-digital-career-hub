# Digital Career Hub Security API

This folder contains the JWT-based authentication and access-control service for the Digital Career Hub website.

It uses:

- FastAPI
- SQLAlchemy
- SQLite for local development
- Argon2 password hashing using `pwdlib`
- JWT access tokens using `PyJWT`
- CORS support for the React frontend

## Folder location in the main GitHub repo

Place this folder at the root of the main project, at the same level as `client` and `server`:

```text
digital-career-hub
├── client
├── server
└── security-api
```

## Setup on Windows PowerShell

```powershell
cd security-api
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

If PowerShell blocks activation, run this once in the same terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\Activate.ps1
```

## Setup on macOS/Linux

```bash
cd security-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## Test URLs

After running the service, open:

```text
http://localhost:8000
```

Expected response:

```json
{
  "message": "Digital Career Hub Security API running"
}
```

Open the API documentation:

```text
http://localhost:8000/docs
```

## Main endpoints

| Endpoint | Purpose |
|---|---|
| `GET /` | Checks that the security API is running |
| `POST /register` | Creates a new user account |
| `POST /login` | Verifies email/password and returns a JWT token |
| `GET /me` | Returns the current logged-in user using the JWT token |
| `GET /protected` | Demonstrates a protected route that requires a valid JWT |

## Security notes

- Do not upload `.venv/` to GitHub.
- Do not upload local `.db` files to GitHub because they may contain test users and password hashes.
- Use `.env` for real deployment secrets.
- Change `JWT_SECRET_KEY` before production deployment.
- For production, use HTTPS and consider storing JWTs in secure HttpOnly cookies.

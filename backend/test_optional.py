import asyncio
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

app = FastAPI()
security_optional = HTTPBearer(auto_error=False)

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
):
    if credentials is None:
        return "None provided"
    return credentials.credentials

@app.get("/test")
def test_route(user=Depends(get_current_user_optional)):
    return {"user": user}

client = TestClient(app)

print("Guest:", client.get("/test").json())
print("Logged (Bearer):", client.get("/test", headers={"Authorization": "Bearer TEST_TOKEN"}).json())
print("Logged (Other):", client.get("/test", headers={"Authorization": "Token TEST_TOKEN"}).json())

import asyncio
from fastapi import FastAPI, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.testclient import TestClient

app = FastAPI()
security_optional = HTTPBearer(auto_error=False)

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional)
):
    if credentials is None:
        return "GUEST"
    return credentials.credentials

@app.get("/career")
def get_career_details(user=Depends(get_current_user_optional)):
    return {"user": user}

client = TestClient(app)

def test_it():
    res1 = client.get("/career")
    print("Guest:", res1.json())
    
    res2 = client.get("/career", headers={"Authorization": "Bearer TEST_TOKEN"})
    print("Logged in:", res2.json())

test_it()

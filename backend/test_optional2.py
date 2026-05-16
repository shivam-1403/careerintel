import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app, User
from database import get_db, SQLALCHEMY_DATABASE_URL
from auth import create_access_token
import json

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

db = TestingSessionLocal()
user = db.query(User).first()

if not user:
    print("No user found in DB! Creating one.")
    user = User(email="test@example.com", first_name="Test", last_name="User", password="hashed", target_role_id=1)
    db.add(user)
    db.commit()
    db.refresh(user)

print("User email:", user.email)
token = create_access_token({"sub": user.email})
print("Using token:", token)

# Test guest
res_guest = client.get("/career/1")
print("Guest Response:", res_guest.json().get('is_authenticated'))

# Test auth
res_auth = client.get("/career/1", headers={"Authorization": f"Bearer {token}"})
print("Auth Response:", res_auth.json().get('is_authenticated'))
print(res_auth.json())

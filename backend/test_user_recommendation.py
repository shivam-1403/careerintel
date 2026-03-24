from database import SessionLocal
from services.career_engine import recommend_roles_for_user

db = SessionLocal()

# Replace 1 with actual user id from DB
results = recommend_roles_for_user(1, db)

for r in results[:3]:
    print(r)

db.close()
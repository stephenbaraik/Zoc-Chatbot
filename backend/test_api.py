import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_chat():
    print("Testing Chat Flow...")
    
    # 1. Start new user
    user_id = int(time.time())
    print(f"User ID: {user_id}")
    
    # Greeting (User says Hi)
    payload = {"user_id": user_id, "message": "Hi"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: Hi\nBot: {res.json()['response']}\n")
    
    # Role
    payload = {"user_id": user_id, "message": "I am a CIO"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: I am a CIO\nBot: {res.json()['response']}\n")
    
    # Experience
    payload = {"user_id": user_id, "message": "20 years"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: 20 years\nBot: {res.json()['response']}\n")
    
    # Location
    payload = {"user_id": user_id, "message": "Dubai, UAE"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: Dubai\nBot: {res.json()['response']}\n")
    
    # Teams
    payload = {"user_id": user_id, "message": "Yes, I lead teams"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: Yes\nBot: {res.json()['response']}\n")
    
    # Interest -> Scoring
    payload = {"user_id": user_id, "message": "Consulting and detailed leadership"}
    res = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"User: Consulting\nBot: {res.json()['response']}\n")
    
    # Check Admin Lead Status
    print("Checking Admin Leads...")
    res = requests.get(f"{BASE_URL}/leads")
    leads = res.json()
    my_lead = next((l for l in leads if l["id"] == user_id), None)
    if my_lead:
        print(f"Lead Found: Score={my_lead['score']}, Status={my_lead['qualification_status']}")
    else:
        print("Lead not found in DB!")

if __name__ == "__main__":
    try:
        test_chat()
    except Exception as e:
        print(f"Test Failed: {e}")

from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from models import User, Conversation
from scoring import calculate_score, get_qualification_status
from rag import get_retriever, get_rag_chain

# State Definitions
STATE_GREETING = "GREETING"
STATE_DISCOVERY_ROLE = "DISCOVERY_ROLE"
STATE_DISCOVERY_EXP = "DISCOVERY_EXP"
STATE_DISCOVERY_LOCATION = "DISCOVERY_LOCATION"
STATE_DISCOVERY_TEAMS = "DISCOVERY_TEAMS"
STATE_DISCOVERY_INTEREST = "DISCOVERY_INTEREST"
STATE_SCORING = "SCORING"
STATE_QUALIFIED_FLOW = "QUALIFIED_FLOW"
STATE_POTENTIAL_FLOW = "POTENTIAL_FLOW" # Education
STATE_UNQUALIFIED_FLOW = "UNQUALIFIED_FLOW" # Polite rejection
STATE_BOOKING = "BOOKING"

async def process_message(user_id: int, message: str, db: Session):
    """
    Main entry point for processing a user message.
    """
    # 1. Retrieve User and Context
    user = db.get(User, user_id)
    if not user:
        user = User(id=user_id)
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Log User Message
    db.add(Conversation(user_id=user.id, role="user", content=message))
    db.commit()

    # 3. Determine Response based on State
    # Simple state machine stored in memory? No, we should persist state. 
    # For this MVP, we'll infer state from missing fields in User profile.
    
    response_text = ""
    next_state = ""
    
    # State Machine Logic
    if not user.role:
        # We need to ask for role.
        # But first, if this is the VERY first message (or close), handle greeting.
        # We'll assume the frontend sends an initial "init" or user says "Hi".
        if not user.conversations or len(user.conversations) <= 1:
             response_text = (
                 "Hello! I am the Ambassador Fellowship Program Assistant. "
                 "I help IT leaders understand if our global community is the right fit for their career goals. "
                 "To get started, could you share your current professional title or role?"
             )
        else:
             # User answered role (presumably)
             user.role = message
             response_text = "Thank you. And how many years of professional experience do you have?"
        
    elif not user.years_experience:
        # Parse experience
        try:
            # Simple extraction or fallback
            import re
            nums = re.findall(r'\d+', message)
            if nums:
                user.years_experience = int(nums[0])
                response_text = "Great. Which city and country are you currently based in?"
            else:
                response_text = "Could you please specify the number of years of experience you have (e.g., 15)?"
                # return early to avoid saving partial state? No, let user retry.
                # We need to not save this message as the "answer" if it failed? 
                # For simplicity, we just ask again.
        except:
             response_text = "Please enter a number for your years of experience."

    elif not user.country:
        user.country = message # We define the previous answer as country/city
        response_text = "Do you currently lead teams or influence high-level technology decisions? (Yes/No)"

    elif user.leads_teams is None:
        # Parse Yes/No
        msg_lower = message.lower()
        if "yes" in msg_lower or "yup" in msg_lower:
            user.leads_teams = True
        elif "no" in msg_lower or "nope" in msg_lower:
            user.leads_teams = False
        
        # If ambiguous, we might default to False or ask again. defaulting to False for now to keep flow moving.
        if user.leads_teams is None:
             user.leads_teams = False

        response_text = (
            "Understood. Finally, what are you primarily looking for? "
            "(e.g., Networking, Consulting, Leadership Brand, Career Security)"
        )

    elif not user.interest_level:
        user.interest_level = message
        
        # SCORING TRIGGER
        score = calculate_score(user)
        user.score = score
        user.qualification_status = get_qualification_status(score)
        
        # Decide path
        if user.qualification_status == "Qualified":
            response_text = (
                f"Thank you deeply for sharing. Based on your profile as a {user.role} with {user.years_experience} years of experience, "
                "you appear to be an excellent match for the Ambassador Fellowship Program.\n\n"
                "Our program lets you build a global personal brand and creates alternative income streams while you keep your current job. "
                "Would you like to know more about how it works?"
            )
        elif user.qualification_status == "Potential":
            response_text = (
                "Thank you for sharing. You have a strong profile, though typically our Ambassadors have slightly more seniority or specialized focus. "
                "However, we have a 'Rising Leaders' track. Would you be interested in resources to help you bridge that gap?"
            )
        else:
            response_text = (
                "Thank you for your interest. At this moment, the Ambassador Program is strictly reserved for senior C-level executives with 15+ years of experience. "
                "However, we have an open community newsletter ensuring you stay tailored to our updates. Would you like me to subscribe you?"
            )
            
    else:
        # Standard Chat / RAG Flow
        # If Qualified, and they say "Yes" to "more info", we answer or show booking.
        
        status = user.qualification_status
        
        if status == "Qualified":
             # check for booking intent
             if "book" in message.lower() or "schedule" in message.lower() or "call" in message.lower():
                 response_text = (
                     "Excellent. Given your background, I'd like to arrange a priority conversation with our Program Mentor. "
                     "This call will cover:\n"
                     "1. How to structure your 'Virtual CxO' portfolio.\n"
                     "2. Compensation models for Ambassadors.\n"
                     "3. Steps to secure your geography.\n\n"
                     "Please schedule your time here: [Book Mentor Call](https://calendly.com/zoc-ambassador/interview)"
                 )
             else:
                 # RAG
                 try:
                    retriever = get_retriever()
                    rag_chain = get_rag_chain(retriever)
                    response = rag_chain.invoke({"input": message})
                    response_text = response['answer']
                 except Exception as e:
                    response_text = f"I apologize, I'm connecting to our knowledge base but hit a snag. (Error: {str(e)})"

        elif status == "Potential":
             # RAG but tailored?
             retriever = get_retriever()
             rag_chain = get_rag_chain(retriever)
             response = rag_chain.invoke({"input": message})
             response_text = response['answer']
        
        else:
            # Unqualified - polite pushback
            response_text = "I appreciate your enthusiasm. For now, please check our website at zocgroup.com for general updates."

    # Save updates
    db.add(user)
    db.commit()
    
    # Log Bot Response
    db.add(Conversation(user_id=user.id, role="assistant", content=response_text))
    db.commit()
    
    return response_text

from models import User

def calculate_score(user: User) -> int:
    """
    Calculates the lead score based on user profile.
    
    Score Categories:
    0–4 → Not qualified
    5–8 → Potential future candidate
    9–12 → Qualified
    """
    score = 0
    
    # Role Scoring
    role = (user.role or "").lower()
    if any(title in role for title in ["cio", "cto", "ciso", "director", "head", "vp", "president", "chief"]):
        score += 3
    elif "manager" in role or "lead" in role or "architect" in role:
        score += 2
    
    # Experience Scoring
    if user.years_experience:
        if user.years_experience >= 15:
            score += 3
        elif user.years_experience >= 10:
            score += 2
        elif user.years_experience >= 5:
            score += 1
            
    # Responsibility Scoring
    if user.leads_teams:
        score += 2
        
    # Geographic Stability (Proxy: simplistic check or self-reported)
    # We assume if they mention a stable city/country in a positive context or explicit answer, they get points.
    # For now, we'll assign points if country is provided, assuming they passed the basic gate.
    if user.country:
        score += 2
        
    # Interest Level
    interest = (user.interest_level or "").lower()
    if any(k in interest for k in ["consulting", "mentorship", "community", "leadership"]):
        score += 2
        
    return score

def get_qualification_status(score: int) -> str:
    if score >= 9:
        return "Qualified"
    elif score >= 5:
        return "Potential"
    else:
        return "Not Qualified"

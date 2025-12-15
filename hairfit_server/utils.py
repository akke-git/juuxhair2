from sqlalchemy.orm import Session
import models

def get_user_salon(current_user: models.User, db: Session) -> models.Salon:
    salon = db.query(models.Salon).filter(models.Salon.owner_id == current_user.id).first()
    if not salon:
        # Auto-create salon if it doesn't exist
        salon_name = f"{current_user.username}'s Salon"
        salon = models.Salon(name=salon_name, owner_id=current_user.id)
        db.add(salon)
        db.commit()
        db.refresh(salon)
        print(f"Auto-created salon for user {current_user.email}")
    return salon

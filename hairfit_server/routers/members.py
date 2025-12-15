import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas, auth_utils as auth, database
from utils import get_user_salon

router = APIRouter()

@router.get("/", response_model=list[schemas.MemberResponse])
async def get_members(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)
    members = db.query(models.Member).filter(models.Member.salon_id == salon.id)\
        .order_by(models.Member.created_at.desc())\
        .offset(skip).limit(limit).all()
    return members

@router.get("/{member_id}", response_model=schemas.MemberResponse)
async def get_member(
    member_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)
    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return member

@router.post("/", response_model=schemas.MemberResponse)
async def create_member(
    member: schemas.MemberCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    new_member = models.Member(
        id=str(uuid.uuid4()),
        salon_id=salon.id,
        name=member.name,
        phone=member.phone,
        memo=member.memo,
        photo_path=member.photo_path,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member

@router.put("/{member_id}", response_model=schemas.MemberResponse)
async def update_member(
    member_id: str,
    member_update: schemas.MemberUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_data = member_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)

    member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(member)

    return member

@router.delete("/{member_id}")
async def delete_member(
    member_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()

    return {"message": "Member deleted successfully"}

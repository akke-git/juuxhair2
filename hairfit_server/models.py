from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    salons = relationship("Salon", back_populates="owner")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")

class Salon(Base):
    __tablename__ = "salons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="salons")
    members = relationship("Member", back_populates="salon", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True)
    salon_id = Column(Integer, ForeignKey("salons.id"))
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    memo = Column(String, nullable=True)
    photo_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    salon = relationship("Salon", back_populates="members")
    synthesis_history = relationship("SynthesisHistory", back_populates="member", cascade="all, delete-orphan")

class SynthesisHistory(Base):
    __tablename__ = "synthesis_history"

    id = Column(String, primary_key=True)
    member_id = Column(String, ForeignKey("members.id"), nullable=True)
    original_photo_path = Column(String, nullable=False)
    reference_style_id = Column(String, nullable=False)
    result_photo_path = Column(String, nullable=True)
    is_synced = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="synthesis_history")

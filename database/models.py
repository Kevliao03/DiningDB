from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .db_setup import Base

# Define Interaction table
class Interaction(Base):
    __tablename__ = 'interactions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    restaurant_id = Column(String, ForeignKey('restaurants.id'), nullable=False)
    rating = Column(Float, nullable=False)  # Rating between 1 and 5
    # Relationships for accessing related user and restaurant
    user = relationship("User", back_populates="interactions")
    restaurant = relationship("Restaurant", back_populates="interactions")

# Define User table
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    preferences = Column(String, nullable=True)  # Comma-separated preferences
    interactions = relationship("Interaction", back_populates="user")

# Define Restaurant table
class Restaurant(Base):
    __tablename__ = 'restaurants'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    cuisine = Column(String, nullable=False)
    location = Column(String, nullable=True)
    interactions = relationship("Interaction", back_populates="restaurant")

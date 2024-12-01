#Database connection and schema setup

from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Define User table
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    preferences = Column(String, nullable=True)  # Comma-separated preferences

# Define Restaurant table
class Restaurant(Base):
    __tablename__ = 'restaurants'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    cuisine = Column(String, nullable=False)
    location = Column(String, nullable=True)

# Define Interaction table
class Interaction(Base):
    __tablename__ = 'interactions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    restaurant_id = Column(Integer, nullable=False)
    rating = Column(Float, nullable=False)  # Rating between 1 and 5

# Set up SQLite database connection
def init_db():
    engine = create_engine('sqlite:///diningdb.db')
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)

Session = init_db()

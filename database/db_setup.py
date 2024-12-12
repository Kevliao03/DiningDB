from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Base class for model definitions
Base = declarative_base()

# PostgreSQL database connection URL
DATABASE_URL = "postgresql://admin:password@192.168.5.234:5432/diningdb"

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create a session factory
Session = sessionmaker(bind=engine)

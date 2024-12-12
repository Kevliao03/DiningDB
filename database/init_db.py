from .db_setup import engine, Base
from .models import User, Restaurant, Interaction

def initialize_database():
    """
    Initialize the database by creating all tables.
    """
    print("Initializing the database...")
    Base.metadata.create_all(engine)
    print("Database initialized.")

if __name__ == "__main__":
    initialize_database()

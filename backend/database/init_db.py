from db_setup import Base, init_db

def initialize_database():
    session = init_db()
    print("Database and tables created successfully!")

if __name__ == "__main__":
    initialize_database()

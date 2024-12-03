from db_setup import Session, User, Restaurant, Interaction

def populate_data():
    session = Session()

    # Add sample user
    user = session.query(User).filter_by(id=1).first()
    if not user:
        user = User(
            id=1,
            name="Sample User",
            preferences="Italian, Vegan, Chinese, Mexican, Bakery"  # Example preferences
        )
        session.add(user)
        session.commit()
        print(f"User with ID {user.id} added to the database.")
    else:
        print(f"User with ID {user.id} already exists in the database.")

    # Add sample users
    users = [
        User(name="John Doe", preferences="Italian,Vegan"),
        User(name="Alice Smith", preferences="Mexican,Gluten-Free"),
    ]

    # Add sample restaurants
    restaurants = [
        Restaurant(name="Veggie Delight", cuisine="Vegan", location="New York City, NY"),
        Restaurant(name="Taco Paradise", cuisine="Mexican", location="Los Angeles, CA"),
    ]

    # Add sample interactions
    interactions = [
        Interaction(user_id=1, restaurant_id=1, rating=5.0),
        Interaction(user_id=1, restaurant_id=2, rating=4.0),
        Interaction(user_id=2, restaurant_id=2, rating=3.5),
    ]

    # Commit data to the database
    session.add_all(users + restaurants + interactions)
    session.commit()
    print("Mock data added to the database!")

if __name__ == "__main__":
    populate_data()

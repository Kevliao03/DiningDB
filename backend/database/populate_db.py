from database.db_setup import Session, User, Restaurant, Interaction

def populate_data():
    session = Session()

    # Add sample users
    users = [
        User(name="John Doe", preferences="Italian,Vegan"),
        User(name="Alice Smith", preferences="Mexican,Gluten-Free"),
    ]

    # Add sample restaurants
    restaurants = [
        Restaurant(name="Veggie Delight", cuisine="Vegan", location="NYC"),
        Restaurant(name="Taco Paradise", cuisine="Mexican", location="LA"),
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

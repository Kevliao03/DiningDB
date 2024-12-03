import json
from models.recommender import fetch_restaurants_from_google, store_restaurants_in_db, generate_recommendations
from database.db_setup import Session, User, Interaction, Restaurant
from models.train_model import train_model

def main():
    # Initialize session
    session = Session()

    # Step 1: Create or reset User ID 1
    user_id = 1
    user = session.query(User).filter_by(id=user_id).first()
    if user:
        print("Deleting existing User ID 1 and resetting data...")
        session.query(Interaction).filter_by(user_id=user_id).delete()  # Remove existing interactions
        session.delete(user)  # Remove user
        session.commit()
    user = User(id=user_id, name="Test User", preferences="Italian, Vegan, Mexican")
    session.add(user)
    session.commit()

    # Step 2: Add sample interactions for User ID 1
    print("Adding sample interactions...")
    sample_interactions = [
        {"restaurant_id": "ChIJN1t_tDeuEmsRUsoyG83frY4", "rating": 5},  # Example Google Place IDs
        {"restaurant_id": "ChIJyw5j84lZwokRnUI_UknPSNA", "rating": 4},
        {"restaurant_id": "ChIJv4yVGknGwoARC_5zwy3zU5M", "rating": 3},
        {"restaurant_id": "ChIJ_yXhTrTHwoARU36hVDFInhg", "rating": 4},
        {"restaurant_id": "ChIJ22wiSIpZwokRUmlXovJnWDI", "rating": 2},
    ]
    for interaction in sample_interactions:
        session.add(Interaction(user_id=user_id, restaurant_id=interaction["restaurant_id"], rating=interaction["rating"]))
    session.commit()

    # Step 3: Train the model
    print("Training model...")
    train_model()  # No parameter passed here

    # Step 4: Fetch and store restaurants from Google API
    print("Fetching restaurants for Los Angeles, CA...")
    city = "Los Angeles"
    state = "CA"
    restaurants = fetch_restaurants_from_google(city=city, state=state)
    store_restaurants_in_db(city, state, restaurants)

    # Step 5: Generate recommendations
    print("Generating recommendations for User ID 1...")
    recommendations = generate_recommendations(user_id=user_id, city=city, state=state)
    print("Recommendations:")
    for rec in recommendations:
        print(f"{rec['name']} (Predicted Rating: {rec['predicted_rating']}, Actual Rating: {rec['rating']})")

    session.close()


if __name__ == "__main__":
    main()

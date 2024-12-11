from surprise import Dataset, Reader, SVD
from database.db_setup import Session, Interaction, User, Restaurant
import pandas as pd
import pickle
import requests
import os
import re

def fetch_restaurants_from_google(city, state, store_in_db=True):
    """
    Fetch restaurants from Google Places API and optionally store them in the database.
    """
    # Step 1: Fetch data from Google API
    location_query = f"{city}, {state}" if state else city
    endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"restaurants in {location_query}",
        "key": "AIzaSyD6HS-BkpR_vc5YKkjcOMSDoIcn_C1rErA", # FILL IN
    }
    response = requests.get(endpoint, params=params)
    if response.status_code != 200:
        raise RuntimeError(f"Failed to fetch restaurants: {response.json().get('error_message', 'Unknown error')}")
    data = response.json()
    results = data.get("results", [])

    # Step 2: Format restaurant data
    restaurants = []
    for result in results:
        restaurants.append({
            "id": result["place_id"],
            "name": result["name"],
            "location": result.get("formatted_address"),
            "types": result.get("types", []),
            "rating": result.get("rating", 0),
            "price_level": result.get("price_level", "Unknown"),
        })

    # Step 3: Optionally store in the database
    if store_in_db:
        store_restaurants_in_db(city, state, restaurants)

    return restaurants


def store_restaurants_in_db(city, state, restaurants):
    session = Session()
    for r in restaurants:
        # Extract city and state from formatted_address
        location = city + ", " + state
        
        # Check if the restaurant already exists in the database
        existing = session.query(Restaurant).filter_by(id=r["id"]).first()
        if not existing:
            print(f"Adding restaurant: {r['name']}")  # Debugging log
            new_restaurant = Restaurant(
                id=r["id"],
                name=r["name"],
                cuisine=", ".join(r.get("types", ["Restaurant"])),  # Join types as a string
                location=location  # Use parsed city, state
            )
            session.add(new_restaurant)
    session.commit()
    session.close()


def generate_recommendations(user_id, city, state):
    """
    Generate recommendations for a user by fetching restaurant data from Google,
    storing it, and using ML predictions.
    """
    session = Session()

    # Step 1: Fetch user preferences
    user = session.query(User).filter_by(id=user_id).first()
    if not user:
        session.close()
        raise ValueError(f"User with id {user_id} does not exist.")
    preferences = [pref.strip().lower() for pref in user.preferences.split(",") if pref]

    # Step 2: Fetch restaurants from Google API and store in the database
    restaurants = fetch_restaurants_from_google(city, state, store_in_db=False)

    # Optionally store in the database (if needed for later queries)
    store_restaurants_in_db(city, state, restaurants)

    if not restaurants:
        session.close()
        return []

    # Step 3: Load the trained ML model
    try:
        with open("trained_model.pkl", "rb") as f:
            algo = pickle.load(f)
    except FileNotFoundError:
        session.close()
        raise RuntimeError("Trained model file not found. Please train the model first.")

    # Step 4: Predict user ratings for restaurants
    recommendations = []
    for restaurant in restaurants:
        prediction = algo.predict(user_id, restaurant["id"]).est
        recommendations.append({
            "id": restaurant["id"],
            "name": restaurant["name"],
            "location": restaurant["location"],
            "types": restaurant.get("types", []),
            "rating": restaurant["rating"],
            "price_level": restaurant.get("price_level", "Unknown"),
            "predicted_rating": round(prediction, 2),
            "matches_preference": any(pref in " ".join(restaurant["types"]).lower() for pref in preferences),
        })

    session.close()

    # Step 5: Sort recommendations
    recommendations.sort(key=lambda x: (-x["matches_preference"], -x["predicted_rating"]))
    return recommendations

from database.db_setup import Session, Interaction, User, Restaurant
import pandas as pd
import requests
import os


def fetch_restaurants_from_google(city, state, store_in_db=True):
    """
    Fetch restaurants from Google Places API and optionally store them in the database.
    """
    # Step 1: Fetch data from Google API
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    if not GOOGLE_API_KEY:
        raise RuntimeError("Google API key not found. Set the GOOGLE_API_KEY environment variable.")

    location_query = f"{city}, {state}" if state else city
    endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"restaurants in {location_query}",
        "key": GOOGLE_API_KEY,
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
    """
    Store restaurant data in the database.
    """
    session = Session()
    for r in restaurants:
        location = city + ", " + state

        # Check if the restaurant already exists in the database
        existing = session.query(Restaurant).filter_by(id=r["id"]).first()
        if not existing:
            new_restaurant = Restaurant(
                id=r["id"],
                name=r["name"],
                cuisine=", ".join(r.get("types", ["Restaurant"])),
                location=location
            )
            session.add(new_restaurant)

    session.commit()
    session.close()


def fetch_ml_model_predictions(user_id, restaurant_id):
    """
    Fetch predictions from the ML service.
    """
    ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://192.168.5.247:5000")
    try:
        response = requests.post(f"{ML_SERVICE_URL}/predict", json={"user_id": user_id, "restaurant_id": restaurant_id})
        if response.status_code == 200:
            return response.json().get("predicted_rating", 0.0)
        else:
            raise RuntimeError(f"ML service error: {response.text}")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Error contacting ML service: {str(e)}")


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

    # Step 3: Predict user ratings for restaurants using the ML API
    recommendations = []
    for restaurant in restaurants:
        try:
            prediction = fetch_ml_model_predictions(user_id, restaurant["id"])
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
        except RuntimeError as e:
            print(f"Error fetching prediction for {restaurant['id']}: {e}")

    session.close()

    # Step 4: Sort recommendations
    recommendations.sort(key=lambda x: (-x["matches_preference"], -x["predicted_rating"]))
    return recommendations

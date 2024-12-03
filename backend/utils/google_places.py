import os
import requests
from database.db_setup import Session, Restaurant

# Fetch Google API Key from environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

import requests

def fetch_restaurants_from_google(city, api_key):
    BASE_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    # Query for restaurants in the city
    params = {
        "query": f"restaurants in {city}",
        "type": "restaurant",
        "key": GOOGLE_API_KEY,
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code != 200:
        raise RuntimeError(f"Google API Error: {response.status_code}, {response.text}")

    data = response.json()

    # Parse and format the restaurant data
    restaurants = []
    for result in data.get("results", []):
        restaurants.append({
            "id": result.get("place_id"),
            "name": result.get("name"),
            "cuisine": ", ".join(result.get("types", [])),  # Use `types` as cuisine
            "location": result.get("formatted_address"),
            "rating": result.get("rating"),
            "user_ratings_total": result.get("user_ratings_total"),
        })

    return restaurants

from flask import Flask, request, jsonify
from flask_cors import CORS
from database.db_setup import Session, User, Interaction, Restaurant
from models.recommender import generate_recommendations
import requests

# Initialize Flask application
app = Flask(__name__)
CORS(app)

# Home route
@app.route("/")
def home():
    return "Welcome to the DiningDB API!"

# Route to fetch all users
@app.route("/users", methods=["GET"])
def get_users():
    session = Session()
    try:
        users = session.query(User).all()
        user_list = [{"id": user.id, "name": user.name, "preferences": user.preferences} for user in users]
        return jsonify(user_list)
    finally:
        session.close()

# Route to add or update an interaction
@app.route("/interactions/add", methods=["POST"])
def add_or_update_interaction():
    session = Session()
    data = request.json

    user_id = data.get("user_id")
    restaurant_id = data.get("restaurant_id")
    rating = data.get("rating")

    if not all([user_id, restaurant_id, rating]):
        return jsonify({"error": "user_id, restaurant_id, and rating are required"}), 400

    try:
        # Check if interaction exists
        existing_interaction = session.query(Interaction).filter_by(
            user_id=user_id, restaurant_id=restaurant_id
        ).first()

        if existing_interaction:
            existing_interaction.rating = rating
            message = "Interaction updated successfully"
        else:
            # Add new interaction
            new_interaction = Interaction(
                user_id=user_id, restaurant_id=restaurant_id, rating=rating
            )
            session.add(new_interaction)
            message = "Interaction added successfully"

        session.commit()

        # Call the ML service to train the model
        ml_url = "http://192.168.5.247:5000/train"
        response = requests.post(ml_url)
        if response.status_code == 200:
            ml_status = "Model trained successfully"
        else:
            ml_status = "Model training failed"

        return jsonify({"message": message, "ml_status": ml_status})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error contacting ML service: {str(e)}"}), 500
    finally:
        session.close()

# Route to fetch recommendations
@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get("user_id", type=int)
    city = request.args.get("city", type=str)
    state = request.args.get("state", type=str)

    if not user_id or not city:
        return jsonify({"error": "Both user_id and city are required"}), 400

    try:
        recommendations = generate_recommendations(user_id, city, state)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to manage user preferences
@app.route("/preferences/<int:user_id>", methods=["GET", "POST"])
def manage_preferences(user_id):
    session = Session()

    if request.method == "GET":
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if user:
                return jsonify({"id": user.id, "preferences": user.preferences or ""})
            else:
                return jsonify({"error": "User not found"}), 404
        finally:
            session.close()

    if request.method == "POST":
        data = request.json
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                user = User(id=user_id, name=f"User {user_id}", preferences="")
                session.add(user)

            user.preferences = data.get("preferences", "")
            session.commit()
            return jsonify({"message": "Preferences updated successfully"})
        finally:
            session.close()

# Route to fetch rated restaurants by user ID
@app.route("/rated-restaurants", methods=["GET"])
def get_rated_restaurants():
    user_id = request.args.get("user_id", type=int)

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    session = Session()
    try:
        interactions = (
            session.query(Interaction)
            .filter_by(user_id=user_id)
            .join(Restaurant, Restaurant.id == Interaction.restaurant_id)
            .all()
        )
        rated_restaurants = [
            {
                "restaurant_id": interaction.restaurant.id,
                "name": interaction.restaurant.name,
                "location": interaction.restaurant.location,
                "rating": interaction.rating,
            }
            for interaction in interactions
        ]
        return jsonify(rated_restaurants)
    finally:
        session.close()

# Route to delete an interaction
@app.route("/interactions/delete", methods=["POST"])
def delete_interaction():
    data = request.json
    user_id = data.get("user_id")
    restaurant_id = data.get("restaurant_id")

    if not user_id or not restaurant_id:
        return jsonify({"error": "User ID and Restaurant ID are required"}), 400

    session = Session()
    try:
        interaction = (
            session.query(Interaction)
            .filter_by(user_id=user_id, restaurant_id=restaurant_id)
            .first()
        )
        if interaction:
            session.delete(interaction)
            session.commit()
            return jsonify({"message": "Interaction deleted successfully"})
        else:
            return jsonify({"error": "Interaction not found"}), 404
    finally:
        session.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

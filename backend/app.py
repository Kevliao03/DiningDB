from flask import Flask, request, jsonify
from flask_cors import CORS
from database.db_setup import Session, User, Interaction, Restaurant
from models.recommender import generate_recommendations
from models.train_model import train_model
from utils.google_places import fetch_restaurants_from_google
#from dotenv import load_dotenv
import os

# Load environment variables (e.g., GOOGLE_API_KEY)
#load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Home route
@app.route("/")
def home():
    return "Welcome to the DiningDB API!"

# Route to fetch all users
@app.route("/users", methods=["GET"])
def get_users():
    session = Session()
    users = session.query(User).all()
    user_list = [{"id": user.id, "name": user.name, "preferences": user.preferences} for user in users]
    session.close()
    return jsonify(user_list)

# Route to add or update an interaction
@app.route("/interactions/add", methods=["POST"])
def add_or_update_interaction():
    session = Session()
    data = request.json

    # Ensure required fields are provided
    user_id = data.get("user_id")
    restaurant_id = data.get("restaurant_id")
    rating = data.get("rating")
    if not all([user_id, restaurant_id, rating]):
        return jsonify({"error": "user_id, restaurant_id, and rating are required"}), 400

    # Check if the interaction already exists
    existing_interaction = session.query(Interaction).filter_by(
        user_id=user_id, restaurant_id=restaurant_id
    ).first()

    if existing_interaction:
        existing_interaction.rating = rating
        message = "Interaction updated successfully"
    else:
        # Add a new interaction
        new_interaction = Interaction(
            user_id=user_id, restaurant_id=restaurant_id, rating=rating
        )
        session.add(new_interaction)
        message = "Interaction added successfully"

    session.commit()
    session.close()

    # Train the model with the new interaction
    train_model()
    return jsonify({"message": message})



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
        user = session.query(User).filter_by(id=user_id).first()
        if user:
            session.close()
            return jsonify({"id": user.id, "preferences": user.preferences or ""})
        else:
            session.close()
            return jsonify({"error": "User not found"}), 404

    if request.method == "POST":
        data = request.json
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            # Create user if not exists
            user = User(id=user_id, name=f"User {user_id}", preferences="")
            session.add(user)

        user.preferences = data.get("preferences", "")
        session.commit()
        session.close()
        return jsonify({"message": "Preferences updated successfully"})



@app.route("/preferences/<int:user_id>", methods=["GET"])
def get_preferences(user_id):
    user = session.query(User).filter_by(id=user_id).first()
    if user:
        return jsonify({"id": user.id, "preferences": user.preferences})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route("/preferences/<int:user_id>", methods=["POST"])
def update_preferences(user_id):
    data = request.json
    user = session.query(User).filter_by(id=user_id).first()
    if user:
        user.preferences = data.get("preferences", "")
        session.commit()
        return jsonify({"message": "Preferences updated successfully"})
    else:
        return jsonify({"error": "User not found"}), 404

# Route to fetch rated restaurants by user ID
@app.route("/rated-restaurants", methods=["GET"])
def get_rated_restaurants():
    user_id = request.args.get("user_id", type=int)

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    session = Session()
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
    session.close()

    return jsonify(rated_restaurants)

# Route to delete an interaction
@app.route("/interactions/delete", methods=["POST"])
def delete_interaction():
    data = request.json
    user_id = data.get("user_id")
    restaurant_id = data.get("restaurant_id")

    if not user_id or not restaurant_id:
        return jsonify({"error": "User ID and Restaurant ID are required"}), 400

    session = Session()
    interaction = (
        session.query(Interaction)
        .filter_by(user_id=user_id, restaurant_id=restaurant_id)
        .first()
    )
    if interaction:
        session.delete(interaction)
        session.commit()
        session.close()
        return jsonify({"message": "Interaction deleted successfully"})
    else:
        session.close()
        return jsonify({"error": "Interaction not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)

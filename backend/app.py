from flask import Flask, request, jsonify
from database.db_setup import Session, User, Restaurant, Interaction
from models.recommender import generate_recommendations

app = Flask(__name__)

# Home route
@app.route("/")
def home():
    return "Welcome to the DiningDB API!"

# Route to fetch all users (already implemented)
@app.route("/users", methods=["GET"])
def get_users():
    session = Session()
    users = session.query(User).all()
    user_list = [{"id": user.id, "name": user.name, "preferences": user.preferences} for user in users]
    session.close()
    return jsonify(user_list)

# Route to fetch all restaurants
@app.route("/restaurants", methods=["GET"])
def get_restaurants():
    session = Session()
    restaurants = session.query(Restaurant).all()
    restaurant_list = [
        {"id": r.id, "name": r.name, "cuisine": r.cuisine, "location": r.location} for r in restaurants
    ]
    session.close()
    return jsonify(restaurant_list)

# Route to add an interaction
@app.route("/interactions/add", methods=["POST"])
def add_interaction():
    session = Session()
    data = request.json
    new_interaction = Interaction(
        user_id=data["user_id"], restaurant_id=data["restaurant_id"], rating=data["rating"]
    )
    session.add(new_interaction)
    session.commit()
    session.close()
    return jsonify({"message": "Interaction added successfully"})

# Route to fetch recommendations
@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get("user_id", type=int)
    recommendations = generate_recommendations(user_id)
    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True)

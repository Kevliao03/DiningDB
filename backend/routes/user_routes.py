#User-related routes
from flask import Blueprint, request, jsonify
from database.db_utils import add_user, get_user_by_id

user_bp = Blueprint("user", __name__)

@user_bp.route("/create", methods=["POST"])
def create_user_route():
    data = request.json
    user = add_user(data["name"], data["preferences"])
    return jsonify({"message": "User created successfully", "user_id": user.id})

@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_route(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "name": user.name, "preferences": user.preferences})

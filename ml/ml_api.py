from flask import Flask, jsonify
from train_model import train_model

app = Flask(__name__)

@app.route("/train", methods=["POST"])
def train():
    """
    API endpoint to trigger the model training process.
    """
    try:
        train_model()
        return jsonify({"message": "Model trained successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run the API on port 5000
    app.run(host="0.0.0.0", port=5000)

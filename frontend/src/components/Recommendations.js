import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
    const [userId, setUserId] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [ratings, setRatings] = useState({}); // Temporary ratings
    const [ratedRestaurants, setRatedRestaurants] = useState({}); // User's existing ratings
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getRecommendations = async () => {
        try {
            // Fetch rated restaurants for the user
            const ratedResponse = await fetch(
                `http://127.0.0.1:5000/rated-restaurants?user_id=${userId}`
            );
            if (!ratedResponse.ok) {
                throw new Error("Failed to fetch rated restaurants");
            }
            const ratedData = await ratedResponse.json();
            const ratedMap = {};
            ratedData.forEach((r) => {
                ratedMap[r.restaurant_id] = r.rating;
            });
            setRatedRestaurants(ratedMap);

            // Fetch recommendations based on the user and location
            const response = await fetch(
                `http://127.0.0.1:5000/recommendations?user_id=${userId}&city=${city}&state=${state}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch recommendations");
            }
            const data = await response.json();
            setRecommendations(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setRecommendations([]);
        }
    };

    const updateRating = (restaurantId, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [restaurantId]: rating, // Temporarily store the rating
        }));
    };

    const submitRating = async (restaurantId) => {
        if (!ratings[restaurantId]) {
            alert("Please enter a valid rating before submitting.");
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:5000/interactions/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    restaurant_id: restaurantId,
                    rating: parseFloat(ratings[restaurantId]), // Ensure rating is a number
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add rating");
            }

            setRatedRestaurants((prev) => ({
                ...prev,
                [restaurantId]: parseFloat(ratings[restaurantId]),
            }));

            alert("Rating added successfully!");
        } catch (err) {
            console.error("Error adding rating:", err);
            alert("Failed to add rating. Please try again.");
        }
    };

    return (
        <div>
            <h2>Get Restaurant Recommendations</h2>
            <div>
                <label>User ID: </label>
                <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="form-control mb-3"
                />
                <label>City: </label>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-control mb-3"
                />
                <label>State: </label>
                <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-control mb-3"
                />
                <button
                    onClick={getRecommendations}
                    className="btn btn-primary"
                >
                    Get Recommendations
                </button>
            </div>
            {error && <p className="text-danger mt-3">{error}</p>}
            <ul className="mt-3">
                {recommendations.map((rec) => (
                    <li key={rec.id} style={{ marginBottom: "20px" }}>
                        <strong>{rec.name}</strong> - {rec.location} <br />
                        <em>Types: {rec.types.join(", ")}</em> {/* Display the types */}
                        <p>
                            Online Rating:{" "}
                            <span style={{ color: "orange", fontWeight: "bold" }}>
                                {rec.rating || "Not Available"}
                            </span>
                        </p>
                        {ratedRestaurants[rec.id] !== undefined ? (
                            <p>
                                Your Rating:{" "}
                                <span style={{ color: "green", fontWeight: "bold" }}>
                                    {ratedRestaurants[rec.id]}
                                </span>
                            </p>
                        ) : (
                            <p>
                                Predicted Rating:{" "}
                                <span style={{ color: "blue", fontWeight: "bold" }}>
                                    {rec.predicted_rating}
                                </span>
                            </p>
                        )}
                        <div style={{ marginTop: "10px" }}>
                            <label htmlFor={`rating-${rec.id}`}>Rate this restaurant: </label>
                            <input
                                id={`rating-${rec.id}`}
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                placeholder="1-5"
                                value={ratings[rec.id] || ""}
                                onChange={(e) =>
                                    updateRating(rec.id, e.target.value)
                                }
                                style={{ marginLeft: "10px", marginRight: "10px", width: "50px" }}
                            />
                            <button
                                onClick={() => submitRating(rec.id)}
                                className="btn btn-success btn-sm"
                                style={{
                                    marginLeft: "10px",
                                    padding: "5px 10px",
                                }}
                            >
                                Submit Rating
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <button
                className="btn btn-secondary mt-3"
                onClick={() => navigate("/manage-preferences")}
            >
                Go to Manage Preferences
            </button>
            <button
                className="btn btn-success mt-3"
                onClick={() => navigate("/rated-restaurants")}
                style={{ marginLeft: "10px" }}
            >
                Go to Rated Restaurants
            </button>
        </div>
    );
};

export default Recommendations;

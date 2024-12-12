import React, { useState } from "react";
import "./Recommendations.css"; 

const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.5.43:8000";

const Recommendations = () => {
    const [userId, setUserId] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [ratings, setRatings] = useState({});
    const [ratedRestaurants, setRatedRestaurants] = useState({});
    const [error, setError] = useState(null);

    const getRecommendations = async () => {
        if (!userId || !city) {
            setError("User ID and City are required.");
            return;
        }

        try {
            setError(null);

            // Fetch rated restaurants
            const ratedResponse = await fetch(`${BASE_URL}/rated-restaurants?user_id=${userId}`);
            if (!ratedResponse.ok) {
                throw new Error("Failed to fetch rated restaurants.");
            }
            const ratedData = await ratedResponse.json();
            const ratedMap = {};
            ratedData.forEach((r) => {
                ratedMap[r.restaurant_id] = r.rating;
            });
            setRatedRestaurants(ratedMap);

            // Fetch recommendations
            const response = await fetch(
                `${BASE_URL}/recommendations?user_id=${userId}&city=${city}&state=${state}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch recommendations.");
            }
            const data = await response.json();
            setRecommendations(data);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError(err.message);
            setRecommendations([]);
        }
    };

    const updateRating = (restaurantId, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [restaurantId]: rating,
        }));
    };

    const submitRating = async (restaurantId) => {
        if (!ratings[restaurantId]) {
            alert("Please enter a valid rating before submitting.");
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/interactions/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    restaurant_id: restaurantId,
                    rating: parseFloat(ratings[restaurantId]),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add rating.");
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
        <div className="container py-5">
            <h2 className="text-center mb-4">🍽️ Restaurant Recommendations</h2>
            <div className="row justify-content-center mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <h5 className="text-primary mb-3">Enter Your Details</h5>
                        <div className="mb-3">
                            <label className="form-label">User ID</label>
                            <input
                                type="number"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="form-control"
                                placeholder="Enter User ID"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="form-control"
                                placeholder="Enter City"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">State (Optional)</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="form-control"
                                placeholder="Enter State"
                            />
                        </div>
                        <button onClick={getRecommendations} className="btn btn-primary w-100">
                            Get Recommendations
                        </button>
                    </div>
                </div>
            </div>
            {error && <p className="text-danger text-center">{error}</p>}
            <div className="row">
                {recommendations.map((rec) => (
                    <div className="col-md-6 col-lg-4 mb-4" key={rec.id}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{rec.name}</h5>
                                <p className="card-text">
                                    <strong>Location:</strong> {rec.location || "N/A"} <br />
                                    <strong>Types:</strong> {rec.types.join(", ")} <br />
                                    <strong>Price:</strong> {"$".repeat(rec.price_level || 0)} <br />
                                    <strong>Predicted Rating:</strong>{" "}
                                    <span className="text-info">
                                        {rec.predicted_rating || "N/A"}
                                    </span>
                                    <br />
                                    {ratedRestaurants[rec.id] !== undefined && (
                                        <strong>
                                            Your Rating:{" "}
                                            <span className="text-success">
                                                {ratedRestaurants[rec.id]}
                                            </span>
                                        </strong>
                                    )}
                                </p>
                                <div className="d-flex">
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        placeholder="Rate 1-5"
                                        value={ratings[rec.id] || ""}
                                        onChange={(e) => updateRating(rec.id, e.target.value)}
                                        className="form-control me-2"
                                    />
                                    <button
                                        onClick={() => submitRating(rec.id)}
                                        className="btn btn-success"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;

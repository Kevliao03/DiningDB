import React, { useState } from "react";
import "./RatedRestaurants.css"; 

const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.5.43:8000";

const RatedRestaurants = () => {
    const [userId, setUserId] = useState("");
    const [ratedRestaurants, setRatedRestaurants] = useState([]);
    const [error, setError] = useState(null);
    const [newRating, setNewRating] = useState({});

    const fetchRatedRestaurants = async () => {
        if (!userId) {
            setError("User ID is required");
            return;
        }

        try {
            setError(null);
            const response = await fetch(`${BASE_URL}/rated-restaurants?user_id=${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch rated restaurants");
            }
            const data = await response.json();
            setRatedRestaurants(data);
        } catch (err) {
            setError(err.message);
            setRatedRestaurants([]);
        }
    };

    const updateRating = async (restaurantId, newRatingValue) => {
        if (!newRatingValue || isNaN(newRatingValue)) {
            setError("Please enter a valid rating.");
            return;
        }

        try {
            setError(null);
            const response = await fetch(`${BASE_URL}/interactions/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    restaurant_id: restaurantId,
                    rating: newRatingValue,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to update rating");
            }
            setRatedRestaurants((prev) =>
                prev.map((r) =>
                    r.restaurant_id === restaurantId ? { ...r, rating: newRatingValue } : r
                )
            );
            setNewRating((prev) => ({ ...prev, [restaurantId]: "" })); // Clear input after update
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteRating = async (restaurantId) => {
        try {
            setError(null);
            const response = await fetch(`${BASE_URL}/interactions/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    restaurant_id: restaurantId,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to delete rating");
            }
            setRatedRestaurants((prev) =>
                prev.filter((r) => r.restaurant_id !== restaurantId)
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">🍴 Your Rated Restaurants</h2>
            <div className="row justify-content-center mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <h5 className="text-primary mb-3">Enter Your User ID</h5>
                        <div className="input-group">
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="form-control"
                                placeholder="Enter User ID"
                            />
                            <button
                                onClick={fetchRatedRestaurants}
                                className="btn btn-primary"
                            >
                                Fetch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {error && <p className="text-danger text-center">{error}</p>}
            <div className="row">
                {ratedRestaurants.length > 0 ? (
                    ratedRestaurants.map((restaurant) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={restaurant.restaurant_id}>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{restaurant.name}</h5>
                                    <p className="card-text">
                                        <strong>Location:</strong> {restaurant.location} <br />
                                        <strong>Your Rating:</strong> {restaurant.rating}
                                    </p>
                                    <div className="d-flex mb-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            step="1"
                                            value={newRating[restaurant.restaurant_id] || ""}
                                            onChange={(e) =>
                                                setNewRating((prev) => ({
                                                    ...prev,
                                                    [restaurant.restaurant_id]: e.target.value,
                                                }))
                                            }
                                            className="form-control me-2"
                                            placeholder="New Rating"
                                        />
                                        <button
                                            onClick={() =>
                                                updateRating(
                                                    restaurant.restaurant_id,
                                                    parseFloat(newRating[restaurant.restaurant_id])
                                                )
                                            }
                                            className="btn btn-success"
                                        >
                                            Update
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => deleteRating(restaurant.restaurant_id)}
                                        className="btn btn-danger w-100"
                                    >
                                        Delete Rating
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center">No rated restaurants found for this user.</p>
                )}
            </div>
        </div>
    );
};

export default RatedRestaurants;

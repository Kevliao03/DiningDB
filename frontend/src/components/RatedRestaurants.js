import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RatedRestaurants = () => {
    const [userId, setUserId] = useState("");
    const [ratedRestaurants, setRatedRestaurants] = useState([]);
    const [error, setError] = useState(null);
    const [newRating, setNewRating] = useState({});
    const navigate = useNavigate();

    const fetchRatedRestaurants = async () => {
        if (!userId) {
            setError("User ID is required");
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/rated-restaurants?user_id=${userId}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch rated restaurants");
            }
            const data = await response.json();
            setRatedRestaurants(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setRatedRestaurants([]);
        }
    };

    const updateRating = async (restaurantId, newRatingValue) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/interactions/add`, {
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
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteRating = async (restaurantId) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:5000/interactions/delete`, // Add this endpoint to your backend
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        restaurant_id: restaurantId,
                    }),
                }
            );
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
        <div>
            <h2>Rated Restaurants</h2>
            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="userId">Enter User ID:</label>
                <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px", borderRadius: "5px" }}
                />
                <button
                    onClick={fetchRatedRestaurants}
                    style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        backgroundColor: "blue",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Fetch Rated Restaurants
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            {ratedRestaurants.length > 0 ? (
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    {ratedRestaurants.map((restaurant) => (
                        <li key={restaurant.restaurant_id} style={{ marginBottom: "20px" }}>
                            <strong>{restaurant.name}</strong> - {restaurant.location} <br />
                            Your Rating: {restaurant.rating}
                            <br />
                            <input
                                type="number"
                                value={newRating[restaurant.restaurant_id] || ""}
                                onChange={(e) =>
                                    setNewRating((prev) => ({
                                        ...prev,
                                        [restaurant.restaurant_id]: e.target.value,
                                    }))
                                }
                                style={{
                                    marginTop: "10px",
                                    marginRight: "10px",
                                    padding: "5px",
                                    borderRadius: "5px",
                                }}
                                placeholder="New Rating"
                            />
                            <button
                                onClick={() =>
                                    updateRating(
                                        restaurant.restaurant_id,
                                        parseFloat(newRating[restaurant.restaurant_id])
                                    )
                                }
                                style={{
                                    backgroundColor: "green",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    marginRight: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                Update Rating
                            </button>
                            <button
                                onClick={() => deleteRating(restaurant.restaurant_id)}
                                style={{
                                    backgroundColor: "red",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                Delete Rating
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No rated restaurants found for this user.</p>
            )}
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => navigate("/recommendations")}
                    style={{
                        backgroundColor: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px",
                        marginRight: "10px",
                        cursor: "pointer",
                    }}
                >
                    Back to Recommendations
                </button>
                <button
                    onClick={() => navigate("/manage-preferences")}
                    style={{
                        backgroundColor: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px",
                        cursor: "pointer",
                    }}
                >
                    Manage Preferences
                </button>
            </div>
        </div>
    );
};

export default RatedRestaurants;

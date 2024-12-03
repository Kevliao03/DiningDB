import React, { useEffect, useState } from "react";
import axios from "axios";

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");

    // Fetch restaurants from the backend
    useEffect(() => {
        setLoading(true);
        axios
            .get("http://127.0.0.1:5000/restaurants")
            .then((response) => {
                setRestaurants(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching restaurants:", err);
                setError("Failed to fetch restaurants. Please try again later.");
                setLoading(false);
            });
    }, []);

    // Handle submitting ratings for a restaurant
    const handleRateRestaurant = (restaurantId, rating) => {
        setMessage(""); // Clear previous messages
        axios
            .post("http://127.0.0.1:5000/interactions/add", {
                user_id: 1, // Replace this with dynamic user ID when implementing user authentication
                restaurant_id: restaurantId,
                rating: rating,
            })
            .then((response) => {
                setMessage(`Rating submitted successfully for restaurant ID: ${restaurantId}`);
            })
            .catch((err) => {
                console.error("Error submitting rating:", err);
                setMessage("Failed to submit rating. Please try again.");
            });
    };

    // Show loading, error, or the table
    if (loading) return <p>Loading restaurants...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div>
            <h2 className="my-4">All Restaurants</h2>
            {message && <p className="text-success">{message}</p>}
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Cuisine</th>
                        <th>Location</th>
                        <th>Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {restaurants.map((restaurant) => (
                        <tr key={restaurant.id}>
                            <td>{restaurant.name}</td>
                            <td>{restaurant.cuisine}</td>
                            <td>{restaurant.location}</td>
                            <td>
                                {/* Buttons to rate the restaurant */}
                                <button
                                    className="btn btn-outline-primary btn-sm mx-1"
                                    onClick={() => handleRateRestaurant(restaurant.id, 5)}
                                >
                                    ⭐⭐⭐⭐⭐
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm mx-1"
                                    onClick={() => handleRateRestaurant(restaurant.id, 4)}
                                >
                                    ⭐⭐⭐⭐
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm mx-1"
                                    onClick={() => handleRateRestaurant(restaurant.id, 3)}
                                >
                                    ⭐⭐⭐
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Restaurants;

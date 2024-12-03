import React, { useState } from "react";
import { fetchRecommendationsByCity } from "../api";

const Home = () => {
    const [city, setCity] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);

    const handleFetchRecommendations = async () => {
        try {
            const data = await fetchRecommendationsByCity(city);
            setRecommendations(data);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError("Failed to load recommendations. Please try again.");
        }
    };

    return (
        <div className="home-container">
            <h2>Find Restaurants in Your City</h2>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your city (e.g., Nashville, TN)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleFetchRecommendations}
                >
                    Get Recommendations
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <ul>
                {recommendations.map((restaurant) => (
                    <li key={restaurant.id}>
                        <strong>{restaurant.name}</strong> - {restaurant.cuisine} ({restaurant.location})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;

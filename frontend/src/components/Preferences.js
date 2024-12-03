import React, { useState } from "react";
import axios from "axios";

const Preferences = ({ userId }) => {
    const [preferences, setPreferences] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");

    const handleUpdate = () => {
        setLoading(true);
        setError(null);

        axios
            .post("http://127.0.0.1:5000/preferences", {
                user_id: userId,
                preferences: preferences,
            })
            .then((response) => {
                setMessage(response.data.message);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error updating preferences:", err);
                setError("Failed to update preferences. Please try again.");
                setLoading(false);
            });
    };

    return (
        <div>
            <h2 className="my-4">Update Your Preferences</h2>
            <div className="form-group">
                <label htmlFor="preferences">Enter Your Preferences</label>
                <input
                    type="text"
                    className="form-control"
                    id="preferences"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g., Italian, Vegan"
                />
            </div>
            <button className="btn btn-primary mt-3" onClick={handleUpdate} disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
            </button>
            {error && <p className="text-danger mt-3">{error}</p>}
            {message && <p className="text-success mt-3">{message}</p>}
        </div>
    );
};

export default Preferences;

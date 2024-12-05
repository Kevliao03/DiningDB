import React, { useState } from "react";

const Preferences = ({ userId }) => {
    const [preferences, setPreferences] = useState("");

    const handleUpdate = () => {
        // Call backend API to update preferences
        console.log(`Updated preferences for user ${userId}: ${preferences}`);
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
            <button className="btn btn-primary mt-3" onClick={handleUpdate}>
                Save Preferences
            </button>
        </div>
    );
};

export default Preferences;

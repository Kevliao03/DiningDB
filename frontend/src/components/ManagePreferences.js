import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ManagePreferences = () => {
    const [userId, setUserId] = useState("");
    const [preferences, setPreferences] = useState([]);
    const [newPreference, setNewPreference] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchPreferences();
        }
    }, [userId]);

    const fetchPreferences = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/preferences/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPreferences(data.preferences.split(", ").filter((pref) => pref !== "") || []);
            } else if (response.status === 404) {
                await createUser(userId);
                setPreferences([]);
            } else {
                throw new Error("Failed to fetch preferences");
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
        }
    }, [userId]);

    const createUser = async (id) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, name: `User ${id}`, preferences: "" }),
            });
            if (!response.ok) {
                throw new Error("Failed to create user");
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    const addPreference = async () => {
        if (newPreference.trim() === "" || !userId) return;
        const updatedPreferences = [...preferences, newPreference];

        try {
            const response = await fetch(`http://127.0.0.1:5000/preferences/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ preferences: updatedPreferences.join(", ") }),
            });
            if (!response.ok) {
                throw new Error("Failed to update preferences");
            }
            setPreferences(updatedPreferences);
            setNewPreference("");
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    const removePreference = async (preferenceToRemove) => {
        if (!userId) return;
        const updatedPreferences = preferences.filter((pref) => pref !== preferenceToRemove);

        try {
            await fetch(`http://127.0.0.1:5000/preferences/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ preferences: updatedPreferences.join(", ") }),
            });
            setPreferences(updatedPreferences);
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    const clearPreferences = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/preferences/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ preferences: "" }),
            });
            if (!response.ok) {
                throw new Error("Failed to clear preferences");
            }
            setPreferences([]);
        } catch (error) {
            console.error("Error clearing preferences:", error);
        }
    };

    return (
        <div>
            <h1>Manage Preferences</h1>
            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="userId">Enter User ID:</label>
                <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px", borderRadius: "5px" }}
                />
            </div>
            <button
                onClick={() => navigate("/recommendations")}
                style={{
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px",
                    marginBottom: "20px",
                    marginRight: "10px",
                    cursor: "pointer",
                }}
            >
                Back to Recommendations
            </button>
            <button
                onClick={() => navigate("/rated-restaurants")}
                style={{
                    backgroundColor: "blue",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "10px",
                    cursor: "pointer",
                }}
            >
                Go to Rated Restaurants
            </button>
            {userId && (
                <>
                    <p>Current Preferences:</p>
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {preferences.map((pref, index) => (
                            <li key={index} style={{ marginBottom: "10px" }}>
                                {pref}
                                <button
                                    onClick={() => removePreference(pref)}
                                    style={{
                                        marginLeft: "10px",
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        padding: "5px 8px",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        placeholder="Add new preference"
                        value={newPreference}
                        onChange={(e) => setNewPreference(e.target.value)}
                        style={{ marginRight: "10px", padding: "5px", borderRadius: "5px" }}
                    />
                    <button
                        onClick={addPreference}
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
                        Add Preference
                    </button>
                    <button
                        onClick={clearPreferences}
                        style={{
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "10px",
                            cursor: "pointer",
                        }}
                    >
                        Clear Preferences
                    </button>
                </>
            )}
        </div>
    );
};

export default ManagePreferences;

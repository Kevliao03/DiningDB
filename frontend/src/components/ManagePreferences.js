import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ManagePreferences.css"; 

const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.5.43:8000";

const ManagePreferences = () => {
    const [userId, setUserId] = useState("");
    const [preferences, setPreferences] = useState([]);
    const [newPreference, setNewPreference] = useState("");
    const navigate = useNavigate();

    // Fetch preferences whenever the user ID changes
    useEffect(() => {
        if (userId) {
            fetchPreferences();
        }
    }, [userId]);

    // Fetch preferences from the backend
    const fetchPreferences = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${BASE_URL}/preferences/${userId}`);
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

    // Create a new user in the backend
    const createUser = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
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

    // Add a new preference
    const addPreference = async () => {
        if (newPreference.trim() === "" || !userId) return;
        const updatedPreferences = [...preferences, newPreference];

        try {
            const response = await fetch(`${BASE_URL}/preferences/${userId}`, {
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

    // Remove a preference
    const removePreference = async (preferenceToRemove) => {
        if (!userId) return;
        const updatedPreferences = preferences.filter((pref) => pref !== preferenceToRemove);

        try {
            const response = await fetch(`${BASE_URL}/preferences/${userId}`, {
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
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    // Clear all preferences
    const clearPreferences = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${BASE_URL}/preferences/${userId}`, {
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
        <div className="container py-5">
            <h2 className="text-center mb-4">🔧 Manage Your Preferences</h2>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <div className="mb-3">
                            <label className="form-label">User ID</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="form-control"
                                placeholder="Enter your User ID"
                            />
                        </div>
                        {userId && (
                            <>
                                <p className="mt-3">Current Preferences:</p>
                                <ul className="list-group mb-3">
                                    {preferences.map((pref, index) => (
                                        <li
                                            key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            {pref}
                                            <button
                                                onClick={() => removePreference(pref)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        placeholder="Add new preference"
                                        value={newPreference}
                                        onChange={(e) => setNewPreference(e.target.value)}
                                        className="form-control"
                                    />
                                    <button
                                        onClick={addPreference}
                                        className="btn btn-primary"
                                    >
                                        Add
                                    </button>
                                </div>
                                <button
                                    onClick={clearPreferences}
                                    className="btn btn-warning w-100"
                                >
                                    Clear Preferences
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePreferences;

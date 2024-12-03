const BASE_URL = "http://127.0.0.1:5000"; // Backend base URL

// Fetch all restaurants
export const fetchRestaurants = async () => {
    const response = await fetch(`${BASE_URL}/restaurants`);
    if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
    }
    return response.json();
};

// Fetch personalized recommendations for a specific user
export const fetchRecommendations = async (userId, city) => {
    // Ensure city is always included in the query
    if (!city) {
        throw new Error("City is required to fetch recommendations");
    }

    // Query the backend with both userId and city
    const query = `?user_id=${userId}&city=${encodeURIComponent(city)}`;
    const response = await fetch(`${BASE_URL}/recommendations${query}`);
    if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
    }
    return response.json();
};

// Fetch recommendations for a user based on city
export const fetchRecommendationsByCity = async (userId, city) => {
    const response = await fetch(`${BASE_URL}/recommendations?user_id=${userId}&city=${encodeURIComponent(city)}`);
    if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
    }
    return response.json();
};


// Add or update a user-restaurant interaction (e.g., rating)
export const addOrUpdateInteraction = async (userId, restaurantId, rating) => {
    const response = await fetch(`${BASE_URL}/interactions/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            restaurant_id: restaurantId,
            rating: rating,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to update interaction");
    }
    return response.json();
};

// Fetch user preferences
export const fetchPreferences = async (userId) => {
    const response = await fetch(`${BASE_URL}/preferences/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch preferences");
    }
    return response.json();
};

// Update user preferences
export const updatePreferences = async (userId, preferences) => {
    const response = await fetch(`${BASE_URL}/preferences/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
    });
    if (!response.ok) {
        throw new Error("Failed to update preferences");
    }
    return response.json();
};

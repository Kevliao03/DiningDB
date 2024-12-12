const BASE_URL = process.env.REACT_APP_API_URL;

// Utility function for handling fetch responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        console.error("API Error:", error);
        throw new Error(`Request failed: ${response.status} - ${error}`);
    }
    return response.json();
};

// Fetch all restaurants
export const fetchRestaurants = async () => {
    try {
        const response = await fetch(`${BASE_URL}/restaurants`);
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
    }
};

// Fetch personalized recommendations for a specific user
export const fetchRecommendations = async (userId, city) => {
    if (!city) {
        throw new Error("City is required to fetch recommendations");
    }

    try {
        const query = `?user_id=${userId}&city=${encodeURIComponent(city)}`;
        const response = await fetch(`${BASE_URL}/recommendations${query}`);
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
    }
};

// Add or update a user-restaurant interaction (e.g., rating)
export const addOrUpdateInteraction = async (userId, restaurantId, rating) => {
    try {
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
        return handleResponse(response);
    } catch (error) {
        console.error("Error adding or updating interaction:", error);
        throw error;
    }
};

// Fetch user preferences
export const fetchPreferences = async (userId) => {
    try {
        const response = await fetch(`${BASE_URL}/preferences/${userId}`);
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching preferences:", error);
        throw error;
    }
};

// Update user preferences
export const updatePreferences = async (userId, preferences) => {
    try {
        const response = await fetch(`${BASE_URL}/preferences/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ preferences }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
    }
};

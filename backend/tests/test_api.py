import pytest
from app import app

@pytest.fixture
def client():
    # Configure Flask app for testing
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_home_route(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome to the DiningDB API!" in response.data

def test_get_users(client):
    response = client.get("/users")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)  # Ensure the response is a list
    if data:  # If data exists, check the first user
        assert "id" in data[0]
        assert "name" in data[0]
        assert "preferences" in data[0]

def test_get_restaurants(client):
    response = client.get("/restaurants")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)  # Ensure the response is a list
    if data:  # If data exists, check the first restaurant
        assert "id" in data[0]
        assert "name" in data[0]
        assert "cuisine" in data[0]
        assert "location" in data[0]

def test_add_interaction(client):
    payload = {"user_id": 1, "restaurant_id": 1, "rating": 4.5}
    response = client.post("/interactions/add", json=payload)
    assert response.status_code == 200
    assert response.get_json() == {"message": "Interaction added successfully"}

def test_get_recommendations(client):
    response = client.get("/recommendations?user_id=1")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)  # Ensure the response is a list
    if data:  # If recommendations exist, check the first recommendation
        assert "restaurant_id" in data[0]
        assert "name" in data[0]
        assert "cuisine" in data[0]

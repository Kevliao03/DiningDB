import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from database.db_setup import Session, Interaction, Restaurant


def generate_recommendations(user_id):
    session = Session()

    # Fetch all interactions from the database
    interactions = session.query(Interaction).all()
    data = [{"user_id": i.user_id, "restaurant_id": i.restaurant_id, "rating": i.rating} for i in interactions]
    session.close()

    # Prepare data for the collaborative filtering model
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(
        pd.DataFrame(data)[["user_id", "restaurant_id", "rating"]], reader
    )

    # Train-test split
    trainset, testset = train_test_split(dataset, test_size=0.25)

    # Train SVD model
    model = SVD()
    model.fit(trainset)

    # Generate recommendations for the given user
    restaurant_ids = [i["restaurant_id"] for i in data]
    unique_restaurant_ids = list(set(restaurant_ids))
    predictions = []
    for rest_id in unique_restaurant_ids:
        pred = model.predict(user_id, rest_id)
        predictions.append({"restaurant_id": rest_id, "rating": pred.est})

    # Sort recommendations by predicted rating
    recommendations = sorted(predictions, key=lambda x: x["rating"], reverse=True)

    # Fetch restaurant details
    session = Session()
    detailed_recommendations = [
        {
            "restaurant_id": rec["restaurant_id"],
            "name": session.query(Restaurant).filter(Restaurant.id == rec["restaurant_id"]).first().name,
            "cuisine": session.query(Restaurant).filter(Restaurant.id == rec["restaurant_id"]).first().cuisine,
        }
        for rec in recommendations
    ]
    session.close()

    return detailed_recommendations

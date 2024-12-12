import pandas as pd
from surprise import Dataset, Reader, SVD
import pickle
from database.db_setup import Session, Interaction

def fetch_interactions(session):
    """
    Fetch interaction data from the database.
    """
    interactions = session.query(Interaction).all()
    if not interactions:
        raise ValueError("No interaction data available for training the model.")
    return [{"user_id": i.user_id, "restaurant_id": i.restaurant_id, "rating": i.rating} for i in interactions]

def train_model():
    """
    Train and save the recommendation model using interactions in the database.
    """
    # Create a session
    session = Session()

    try:
        # Fetch data
        data = fetch_interactions(session)

        # Prepare data for training
        df = pd.DataFrame(data)
        reader = Reader(rating_scale=(1, 5))
        dataset = Dataset.load_from_df(df[["user_id", "restaurant_id", "rating"]], reader)

        # Train the model
        algo = SVD()
        trainset = dataset.build_full_trainset()
        algo.fit(trainset)

        # Save the trained model
        MODEL_PATH = "trained_model.pkl"
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(algo, f)

        print("Model trained and saved as", MODEL_PATH)

    except Exception as e:
        print(f"Error during training: {e}")
        raise
    finally:
        # Close the session
        session.close()

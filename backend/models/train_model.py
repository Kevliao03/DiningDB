import pandas as pd
from surprise import Dataset, Reader, SVD
import pickle
from database.db_setup import Session, Interaction

def train_model():
    """
    Train and save the recommendation model using interactions in the database.
    """
    from surprise import Dataset, Reader, SVD
    import pandas as pd

    # Create a session
    session = Session()

    # Fetch all interactions
    interactions = session.query(Interaction).all()
    data = [{"user_id": i.user_id, "restaurant_id": i.restaurant_id, "rating": i.rating} for i in interactions]

    if not data:
        session.close()
        raise ValueError("No interaction data available for training the model.")

    # Prepare data for training
    df = pd.DataFrame(data)
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(df[["user_id", "restaurant_id", "rating"]], reader)

    # Train the model
    algo = SVD()
    trainset = dataset.build_full_trainset()
    algo.fit(trainset)

    # Save the trained model
    with open("trained_model.pkl", "wb") as f:
        pickle.dump(algo, f)

    print("Model trained and saved as trained_model.pkl.")

    # Close the session
    session.close()

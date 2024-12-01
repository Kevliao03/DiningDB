from database.db_setup import Session, User, Restaurant, Interaction

session = Session()

# Fetch all users
def get_all_users():
    return session.query(User).all()

# Fetch a specific user by ID
def get_user_by_id(user_id):
    return session.query(User).filter(User.id == user_id).first()

# Add a new user
def add_user(name, preferences):
    new_user = User(name=name, preferences=preferences)
    session.add(new_user)
    session.commit()
    return new_user

# Fetch all restaurants
def get_all_restaurants():
    return session.query(Restaurant).all()

# Fetch a specific restaurant by ID
def get_restaurant_by_id(restaurant_id):
    return session.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

# Add a new interaction (user rating a restaurant)
def add_interaction(user_id, restaurant_id, rating):
    new_interaction = Interaction(user_id=user_id, restaurant_id=restaurant_id, rating=rating)
    session.add(new_interaction)
    session.commit()
    return new_interaction

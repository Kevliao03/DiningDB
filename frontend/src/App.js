import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Recommendations from "./components/Recommendations";
import Restaurants from "./components/Restaurants";
import Preferences from "./components/Preferences";
import ManagePreferences from "./components/ManagePreferences";
import RatedRestaurants from "./components/RatedRestaurants"; // Import the new component

const App = () => {
    return (
        <Router>
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <Link className="navbar-brand" to="/">DiningDB</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/manage-preferences">Preferences</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/recommendations">Recommendations</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/rated-restaurants">Rated Restaurants</Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<h1>Welcome to DiningDB</h1>} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="/manage-preferences" element={<ManagePreferences />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/rated-restaurants" element={<RatedRestaurants />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Recommendations from "./components/Recommendations";
import Restaurants from "./components/Restaurants";
import ManagePreferences from "./components/ManagePreferences";
import RatedRestaurants from "./components/RatedRestaurants";

const App = () => {
    return (
        <Router>
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <NavLink className="navbar-brand" to="/">DiningDB</NavLink>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/" end>
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/manage-preferences">
                                    Preferences
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/recommendations">
                                    Recommendations
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/rated-restaurants">
                                    Rated Restaurants
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="mt-4">
                    <Routes>
                        <Route path="/" element={<h1>Welcome to DiningDB</h1>} />
                        <Route path="/restaurants" element={<Restaurants />} />
                        <Route path="/manage-preferences" element={<ManagePreferences />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                        <Route path="/rated-restaurants" element={<RatedRestaurants />} />
                        <Route path="*" element={<h1 className="text-danger">404: Page Not Found</h1>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

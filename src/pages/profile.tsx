
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore: Allow side-effect CSS import without type declarations
import "./profile.css";


interface User {
    name: string;
    email: string;
    createdAt: string;
}

export default function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User>({
        name: "",
        email: "",
        createdAt: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);


    const handleSave = () => {

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        setIsEditing(false);

        alert("Profile updated successfully!");
    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("Logged out successfully");

        navigate("/login");
    };


    return (
        <div className="profile-container">

            <div className="profile-card">

                <h1>
                    Welcome, {user.name}
                </h1>

                <p className="subtitle">
                    Manage your account information
                </p>


                <div className="profile-info">


                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        value={user.name}
                        disabled={!isEditing}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                name: e.target.value
                            })
                        }
                    />


                    <label>
                        Email Address
                    </label>

                    <input
                        type="email"
                        value={user.email}
                        disabled={!isEditing}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                email: e.target.value
                            })
                        }
                    />


                    <label>
                        Registration Date
                    </label>

                    <input
                        value={user.createdAt}
                        disabled
                    />


                </div>


                <div className="profile-buttons">

                    {
                        isEditing ? (

                            <button onClick={handleSave}>
                                Save Changes
                            </button>

                        ) : (

                            <button
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>

                        )
                    }

                    <button
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>

                    <button
                        className="logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>


                </div>


            </div>

        </div>
    );
}
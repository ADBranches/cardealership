import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

interface User {
  name?: string;
  email?: string;
  createdAt?: string;
}

interface RootState {
  auth: {
    user: User | null;
    loading: boolean;
  };
}

const Profile = () => {
  const dispatch = useDispatch();

  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    return true;
  };


  const handleUpdateProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        }
      );


      if (!response.ok) {
        throw new Error("Failed to update profile");
      }


      const data = await response.json();


      dispatch({
        type: "SET_USER",
        payload: data.user,
      });


      setSuccess(true);
      setIsEditMode(false);


    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString();
  };


  if (authLoading) {
    return (
      <div className="profile-settings-container">
        Loading profile...
      </div>
    );
  }


  if (!user) {
    return (
      <div className="profile-settings-container">
        Please login first.
      </div>
    );
  }


  return (
    <div className="profile-settings-container">

      <div className="profile-card">

        <h1>Profile Settings</h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            Profile updated successfully
          </div>
        )}


        {!isEditMode ? (

          <div>

            <p>
              <strong>Name:</strong> {formData.name}
            </p>

            <p>
              <strong>Email:</strong> {formData.email}
            </p>

            <p>
              <strong>Joined:</strong>{" "}
              {formatDate(user.createdAt)}
            </p>


            <button
              className="btn btn-primary"
              onClick={() => setIsEditMode(true)}
            >
              Edit Profile
            </button>

          </div>


        ) : (


          <form onSubmit={handleUpdateProfile}>

            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
            />


            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />


            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>


          </form>

        )}

      </div>

    </div>
  );
};


export default Profile;
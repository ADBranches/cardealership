import { useState, useEffect } from "react";


export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setName(user.name || "Guest User");
    setEmail(user.email || "No Email");
    setCreatedAt(user.createdAt || "Unknown");
  }, []);

  const handleSave = () => {
    const updatedUser = {
      name,
      email,
      createdAt,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Profile Updated Successfully!");
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h1>My Profile</h1>

      <p>
        <strong>Member Since:</strong> {createdAt}
      </p>

      <label>Name</label>

      <input
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Email</label>

      <input
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleSave}
        style={{
          padding: "10px 20px",
          background: "#0077ff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}
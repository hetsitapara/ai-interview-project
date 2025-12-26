import React from "react";

const UserProfile = () => {
  const user = {
    name: "John Doe",
    email: "johndoe@gmail.com",
    role: "Software Engineer",
    experience: "2 Years",
  };

  return (
    <div style={styles.container}>
      <h2>User Profile</h2>

      <div style={styles.card}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Experience:</strong> {user.experience}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "300px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
};

export default UserProfile;
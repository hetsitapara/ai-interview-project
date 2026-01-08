import "../styles/profile.css";

export default function Profile() {
  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Header */}
        <div className="profile-header">
          <div className="avatar"></div>
          <div>
            <h2>Alex Johnson</h2>
            <p>alex.johnson@email.com</p>
            <span>Role: Student</span>
          </div>
        </div>

        <hr />

        {/* Editable Details */}
        <div className="profile-section">
          <h3>Editable Details</h3>

          {/* Skills */}
          <label>Skills & Interests</label>
          <div className="skills">
            <span>Python</span>
            <span>Machine Learning</span>
            <span>Data Structures</span>
            <span>React</span>
            <span>Public Speaking</span>
          </div>

          {/* Career Goals */}
          <label>Career Goals</label>
          <textarea placeholder="E.g. Become a Software Engineer at a top tech company..."></textarea>

          {/* Links */}
          <div className="links">
            <input type="text" placeholder="LinkedIn Profile Link" />
            <input type="text" placeholder="GitHub Profile Link" />
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn">Save Changes</button>
            <button className="secondary-btn">Edit Profile</button>
          </div>

        </div>
      </div>
    </div>
  );
}

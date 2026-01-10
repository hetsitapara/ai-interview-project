import { useState, useEffect } from "react";
import "../styles/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    skills: [],
    careerGoals: "",
    socialLinks: { linkedin: "", github: "" },
    avatar: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           setError("No token found. Please login.");
           setLoading(false);
           return;
        }

        const res = await fetch('http://localhost:5001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        setProfile({
            ...data,
            skills: data.skills || [],
            careerGoals: data.careerGoals || "",
            socialLinks: data.socialLinks || { linkedin: "", github: "" }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
        const linkType = name.split('.')[1];
        setProfile(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [linkType]: value }
        }));
    } else {
        setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Skills Change (comma separated)
  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setProfile(prev => ({ ...prev, skills: skillsArray }));
  };

  // Save Profile
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const data = await res.json();
      setProfile(prev => ({ ...prev, ...data }));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="profile-page"><p style={{color: 'white'}}>Loading profile...</p></div>;
  if (error) return <div className="profile-page"><p style={{color: 'red'}}>Error: {error}</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Header */}
        <div className="profile-header">
          <div className="avatar" style={{backgroundImage: `url(${profile.avatar || 'https://via.placeholder.com/150'})`}}></div>
          <div>
            {isEditing ? (
                <input 
                    type="text" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange} 
                    className="edit-input"
                />
            ) : (
                <h2>{profile.name}</h2>
            )}
            <p>{profile.email}</p>
            <span>Role: {profile.role}</span>
          </div>
        </div>

        <hr />

        {/* Editable Details */}
        <div className="profile-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Details</h3>
            {!isEditing && <button className="secondary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>}
          </div>

          {/* Skills */}
          <label>Skills & Interests</label>
          {isEditing ? (
            <input 
                type="text" 
                value={profile.skills.join(', ')} 
                onChange={handleSkillsChange}
                placeholder="Comma separated skills (e.g. Python, React)" 
            />
          ) : (
            <div className="skills">
                {profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => <span key={index}>{skill}</span>)
                ) : (
                    <p style={{color: '#888'}}>No skills added yet.</p>
                )}
            </div>
          )}

          {/* Career Goals */}
          <label>Career Goals</label>
          {isEditing ? (
            <textarea 
                name="careerGoals" 
                value={profile.careerGoals} 
                onChange={handleChange} 
                placeholder="E.g. Become a Software Engineer..."
            ></textarea>
          ) : (
            <p className="bio-text">{profile.careerGoals || "No career goals set."}</p>
          )}

          {/* Links */}
          <div className="links">
            {isEditing ? (
                <>
                    <input 
                        type="text" 
                        name="socialLinks.linkedin" 
                        value={profile.socialLinks.linkedin} 
                        onChange={handleChange} 
                        placeholder="LinkedIn Profile Link" 
                    />
                    <input 
                        type="text" 
                        name="socialLinks.github" 
                        value={profile.socialLinks.github} 
                        onChange={handleChange} 
                        placeholder="GitHub Profile Link" 
                    />
                </>
            ) : (
                <>
                    {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="link-btn linkedin">LinkedIn</a>}
                    {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="link-btn github">GitHub</a>}
                </>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="profile-actions">
                <button className="btn" onClick={handleSave}>Save Changes</button>
                <button className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

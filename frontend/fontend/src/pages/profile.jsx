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
    avatar: "",
    stats: { streak: 0, activityLog: [], totalScore: 0, quizzesTaken: 0 }
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
            socialLinks: data.socialLinks || { linkedin: "", github: "" },
            stats: data.stats || { streak: 0, activityLog: [], totalScore: 0, quizzesTaken: 0 }
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

  if (loading) return <div className="profile-page"><div className="loader"></div></div>;
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

        {/* --- GAMIFICATION STATS --- */}
        <div className="stats-section" style={{display: 'flex', gap: '20px', margin: '20px 0', flexWrap: 'wrap'}}>
            <div className="stat-badge" style={{flex: 1, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '15px', borderRadius: '12px', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#818cf8'}}>🔥 {profile.stats?.streak || 0}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>Day Streak</div>
            </div>
            <div className="stat-badge" style={{flex: 1, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '15px', borderRadius: '12px', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4ade80'}}>⚡ {profile.stats?.totalScore || 0}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>Total XP</div>
            </div>
             <div className="stat-badge" style={{flex: 1, background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '15px', borderRadius: '12px', textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#facc15'}}>📝 {profile.stats?.quizzesTaken || 0}</div>
                <div style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px'}}>Quizzes Taken</div>
            </div>
        </div>

        {/* --- ACTIVITY HEATMAP --- */}
        <div className="heatmap-section" style={{marginBottom: '30px', padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
             <h3 style={{fontSize: '1rem', color: '#94a3b8', marginBottom: '15px'}}>Activity Log (Last 60 Days)</h3>
             <div className="heatmap-grid" style={{
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(auto-fit, minmax(12px, 1fr))', 
                 gap: '4px',
                 maxWidth: '100%'
             }}>
                {Array.from({length: 60}).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (59 - i)); // Past 60 days
                    const dateStr = date.toISOString().split('T')[0];
                    const activity = profile.stats?.activityLog?.find(l => l.date === dateStr);
                    const count = activity ? activity.count : 0;
                    
                    // Color intensity
                    let bgColor = 'rgba(255,255,255,0.05)';
                    if (count >= 1) bgColor = '#0e4429'; // Low
                    if (count >= 3) bgColor = '#006d32'; // Med
                    if (count >= 5) bgColor = '#26a641'; // High
                    if (count >= 8) bgColor = '#39d353'; // Max

                    return (
                        <div key={i} title={`${dateStr}: ${count} activities`} style={{
                            width: '100%', aspectRatio: '1/1', borderRadius: '2px', background: bgColor
                        }}></div>
                    )
                })}
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

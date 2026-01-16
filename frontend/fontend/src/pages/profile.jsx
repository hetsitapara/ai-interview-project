import { useState, useEffect, useCallback } from "react";
import "../styles/profile.css";
import Cropper from "react-easy-crop";
import { User, Mail, MapPin, Briefcase, Globe, Github, Linkedin, Camera, Check, X, Plus, Edit2, Link as LinkIcon, Star, Target } from "lucide-react";

// Helper to create the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    resolve(canvas.toDataURL("image/jpeg"));
  });
}

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

  // Image Crop State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleShowCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfile(prev => ({ ...prev, avatar: croppedImage }));
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setProfile(prev => ({ ...prev, skills: skillsArray }));
  };

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

  if (loading) return <div className="profile-page"><div className="loader">Loading...</div></div>;
  if (error) return <div className="profile-page"><p style={{ color: '#f87171' }}>Error: {error}</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Banner Hero */}
        <div className="profile-hero"></div>

        {/* Header Profile Info */}
        <div className="profile-header">
          <div className="avatar-wrapper">
            <div
              className="avatar"
              style={{ backgroundImage: profile.avatar ? `url(${profile.avatar})` : 'none' }}
            >
              {!profile.avatar && <User size={80} color="#64748b" />}
            </div>
            {isEditing && (
              <label className="avatar-edit-badge" htmlFor="avatar-upload">
                <Camera size={20} />
                <input
                  type="file"
                  id="avatar-upload"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="profile-main-info">
            {isEditing ? (
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  style={{ fontSize: '28px', fontWeight: '800', width: 'auto' }}
                />
              </div>
            ) : (
              <h2>{profile.name}</h2>
            )}
            <p><Mail size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />{profile.email}</p>
            <span className="role-badge">{profile.role}</span>
          </div>

          {!isEditing && (
            <button className="secondary-btn" style={{ marginLeft: 'auto', marginBottom: '20px' }} onClick={() => setIsEditing(true)}>
              <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Profile
            </button>
          )}
        </div>

        {/* Main Content Sections */}
        <div className="profile-content">

          <div className="content-left">
            {!isEditing ? (
              <>
                {/* VIEW MODE */}
                <div className="section-group">
                  <h3><Star size={20} /> Skills & Interests</h3>
                  <div className="skills-container">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))
                    ) : (
                      <p className="bio-text">No skills added yet.</p>
                    )}
                  </div>
                </div>

                <div className="section-group">
                  <h3><Target size={20} /> Career Goals</h3>
                  <p className="bio-text">{profile.careerGoals || "No career goals specified yet. Edit your profile to add them!"}</p>
                </div>
              </>
            ) : (
              /* EDIT MODE */
              <div className="edit-form">
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Current Role</label>
                    <input type="text" name="role" value={profile.role} onChange={handleChange} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={profile.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="React, Node.js, Python..."
                  />
                </div>

                <div className="form-group">
                  <label>Career Goals</label>
                  <textarea
                    name="careerGoals"
                    value={profile.careerGoals}
                    onChange={handleChange}
                    placeholder="Tell us about your professional aspirations..."
                    style={{ minHeight: '150px' }}
                  />
                </div>

                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input type="text" name="socialLinks.linkedin" value={profile.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input type="text" name="socialLinks.github" value={profile.socialLinks.github} onChange={handleChange} placeholder="https://github.com/..." />
                  </div>
                </div>

                <div className="profile-actions-bottom">
                  <button className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="btn" onClick={handleSave}>
                    <Check size={18} style={{ marginRight: '8px' }} /> Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="content-right">
            <div className="section-group">
              <h3><LinkIcon size={20} /> Connections</h3>
              <div className="social-links">
                <a href={profile.socialLinks.linkedin || "#"} target="_blank" rel="noreferrer" className="social-card linkedin">
                  <div className="social-icon"><Linkedin size={20} /></div>
                  <div className="social-info">
                    <div>LinkedIn</div>
                    <div>{profile.socialLinks.linkedin ? 'Connected' : 'Not setup'}</div>
                  </div>
                </a>
                <a href={profile.socialLinks.github || "#"} target="_blank" rel="noreferrer" className="social-card github">
                  <div className="social-icon"><Github size={20} /></div>
                  <div className="social-info">
                    <div>GitHub</div>
                    <div>{profile.socialLinks.github ? 'Connected' : 'Not setup'}</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="section-group" style={{ marginTop: '40px' }}>
              <div style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', color: '#a5b4fc', marginBottom: '10px' }}>Profile Strength</p>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>75%</div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CROP MODAL */}
      {showCropModal && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Customize Avatar</h3>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="controls-row">
              <div className="slider-group">
                <label>Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowCropModal(false)}>Cancel</button>
              <button className="btn" style={{ flex: 1 }} onClick={handleShowCroppedImage}>
                Save Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

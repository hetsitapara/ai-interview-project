import { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { User, Mail, Camera, Check, Github, Linkedin, Edit2, Star, Target, Link as LinkIcon, Flame, Zap, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const createImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener("load", () => resolve(image));
  image.addEventListener("error", reject);
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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => resolve(canvas.toDataURL("image/jpeg")));
}

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "", email: "", role: "", skills: [], careerGoals: "",
    socialLinks: { linkedin: "", github: "" }, avatar: "",
    stats: { streak: 0, activityLog: [], totalScore: 0, quizzesTaken: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError("No token found. Please login."); setLoading(false); return; }
        const res = await fetch('http://127.0.0.1:5001/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile({ ...data, skills: data.skills || [], careerGoals: data.careerGoals || "", socialLinks: data.socialLinks || { linkedin: "", github: "" }, stats: data.stats || { streak: 0, activityLog: [], totalScore: 0, quizzesTaken: 0 } });
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels), []);

  const handleFileChange = async (e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => { setImageSrc(reader.result); setShowCropModal(true); });
      reader.readAsDataURL(file);
    }
  };

  const handleShowCroppedImage = async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfile(prev => ({ ...prev, avatar: cropped }));
      setShowCropModal(false);
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const linkType = name.split('.')[1];
      setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [linkType]: value } }));
    } else setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => setProfile(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }));

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5001/api/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setProfile(prev => ({ ...prev, ...data }));
      updateUser(data); setIsEditing(false); setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { alert(err.message); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Star size={14} /> },
    { id: 'activity', label: 'Activity', icon: <Flame size={14} /> },
    { id: 'edit', label: 'Edit Profile', icon: <Edit2 size={14} /> },
  ];

  const statItems = [
    { label: 'Day Streak', value: profile.stats?.streak || 0, icon: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
    { label: 'Total XP', value: (profile.stats?.totalScore || 0).toFixed(0), icon: '⚡', color: '#facc15', bg: 'rgba(250,204,21,0.08)' },
    { label: 'Quizzes', value: profile.stats?.quizzesTaken || 0, icon: '📝', color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-gradient)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#475569', fontFamily: 'Outfit, sans-serif' }}>Loading profile...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-gradient)' }}>
      <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px' }}>
        <p style={{ color: '#fca5a5', fontFamily: 'Outfit, sans-serif' }}>Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        .profile-tab { cursor:pointer; transition:all 0.25s ease; padding:10px 20px; border-radius:50px; border:1px solid transparent; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; }
        .profile-tab.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 4px 15px rgba(139,92,246,0.4); }
        .profile-tab:not(.active) { color:#64748b; background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.06); }
        .profile-tab:not(.active):hover { color:#e2e8f0; border-color:rgba(255,255,255,0.15); }
        .skill-tag { display:inline-flex; align-items:center; padding:6px 14px; borderRadius:50px; background:rgba(139,92,246,0.12); color:#c4b5fd; border:1px solid rgba(139,92,246,0.2); font-size:13px; font-weight:600; transition:all 0.2s ease; }
        .skill-tag:hover { background:rgba(139,92,246,0.25); transform:scale(1.05); }
        .social-card { display:flex; align-items:center; gap:16px; padding:18px 22px; border-radius:18px; border:1px solid; text-decoration:none; transition:all 0.3s ease; }
        .social-card:hover { transform:translateY(-3px); }
        .edit-input:focus { border-color:rgba(139,92,246,0.5)!important; box-shadow:0 0 0 4px rgba(139,92,246,0.12)!important; outline:none; }
        .crop-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(20px); z-index:1000; display:flex; align-items:center; justify-content:center; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px', animation: 'fadeUp 0.5s ease' }}>

        {/* Profile banner + identity */}
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          {/* Banner */}
          <div style={{ height: '200px', borderRadius: '28px 28px 0 0', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 50%, rgba(236,72,153,0.1) 100%)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
          </div>

          {/* Identity row */}
          <div style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 28px 28px', padding: '0 40px 32px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', marginTop: '-48px' }}>
                  <div style={{ width: '96px', height: '96px', borderRadius: '28px', background: profile.avatar ? 'none' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(15,23,42,0.95)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                    {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#fff" />}
                  </div>
                  {isEditing && (
                    <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid rgba(15,23,42,0.95)', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}>
                      <Camera size={14} color="#fff" />
                      <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <div style={{ paddingBottom: '8px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' }}>{profile.name || 'Anonymous User'}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} />{profile.email}</span>
                    {profile.role && <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(139,92,246,0.2)' }}>{profile.role}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
                {!isEditing ? (
                  <button onClick={() => { setActiveTab('edit'); setIsEditing(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <Edit2 size={16} />Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={() => { setIsEditing(false); setActiveTab('overview'); }} style={{ padding: '12px 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleSave}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}
                    >
                      <Check size={16} />Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save success toast */}
        {saveSuccess && (
          <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'fadeUp 0.3s ease' }}>
            <Check size={18} color="#34d399" /><span style={{ color: '#34d399', fontWeight: '700' }}>Profile updated successfully!</span>
          </div>
        )}

        {/* Stats bento row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statItems.map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}25`, borderRadius: '20px', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: s.color, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          {tabs.map(tab => (
            <button key={tab.id} className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); if (tab.id === 'edit') setIsEditing(true); else setIsEditing(false); }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div key={activeTab} style={{ animation: 'fadeUp 0.4s ease' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Skills */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(139,92,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={18} color="#a78bfa" /></div>
                  <span style={{ color: '#a78bfa', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {profile.skills.length > 0 ? profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>) : <p style={{ color: '#374151', fontSize: '14px' }}>No skills added yet.</p>}
                </div>
              </div>

              {/* Career Goals */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={18} color="#34d399" /></div>
                  <span style={{ color: '#34d399', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Career Goals</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  {profile.careerGoals || 'No career goals specified yet. Edit your profile to add them!'}
                </p>
              </div>

              {/* Connections */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(56,189,248,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={18} color="#38bdf8" /></div>
                  <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Connections</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <a href={profile.socialLinks.linkedin || '#'} target="_blank" rel="noreferrer" className="social-card"
                    style={{ background: 'rgba(10,102,194,0.08)', borderColor: 'rgba(10,102,194,0.25)', color: '#60a5fa' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,102,194,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,102,194,0.08)'}
                  >
                    <div style={{ width: '44px', height: '44px', background: 'rgba(10,102,194,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Linkedin size={22} color="#60a5fa" /></div>
                    <div><div style={{ fontWeight: '800', color: '#e2e8f0', fontSize: '15px' }}>LinkedIn</div><div style={{ fontSize: '12px', color: profile.socialLinks.linkedin ? '#34d399' : '#475569' }}>{profile.socialLinks.linkedin ? '● Connected' : '○ Not connected'}</div></div>
                  </a>
                  <a href={profile.socialLinks.github || '#'} target="_blank" rel="noreferrer" className="social-card"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Github size={22} color="#e2e8f0" /></div>
                    <div><div style={{ fontWeight: '800', color: '#e2e8f0', fontSize: '15px' }}>GitHub</div><div style={{ fontSize: '12px', color: profile.socialLinks.github ? '#34d399' : '#475569' }}>{profile.socialLinks.github ? '● Connected' : '○ Not connected'}</div></div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(249,115,22,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flame size={22} color="#f97316" /></div>
                <div>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>Activity Log</div>
                  <div style={{ color: '#475569', fontSize: '13px' }}>Last 60 days of practice</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14px, 1fr))', gap: '5px' }}>
                {Array.from({ length: 60 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (59 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const activity = profile.stats?.activityLog?.find(l => l.date === dateStr);
                  const count = activity ? activity.count : 0;
                  let bgColor = 'rgba(255,255,255,0.04)';
                  if (count >= 1) bgColor = '#0e4429';
                  if (count >= 3) bgColor = '#006d32';
                  if (count >= 5) bgColor = '#26a641';
                  if (count >= 8) bgColor = '#39d353';
                  return <div key={i} title={`${dateStr}: ${count} activities`} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '3px', background: bgColor, transition: 'all 0.2s ease', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#475569' }}>Less</span>
                {['rgba(255,255,255,0.04)', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, i) => (
                  <div key={i} style={{ width: '12px', height: '12px', borderRadius: '3px', background: c }} />
                ))}
                <span style={{ fontSize: '12px', color: '#475569' }}>More</span>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '40px' }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '32px', letterSpacing: '-0.3px' }}>Edit Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {[
                  { label: 'Full Name', name: 'name', value: profile.name, placeholder: 'Your full name', type: 'text' },
                  { label: 'Current Role', name: 'role', value: profile.role, placeholder: 'e.g. Software Engineer', type: 'text', disabled: true },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{field.label}</label>
                    <input type={field.type} name={field.name} value={field.value} onChange={handleChange} placeholder={field.placeholder} disabled={field.disabled}
                      className="edit-input"
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: field.disabled ? '#374151' : 'white', fontSize: '15px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Skills (comma separated)</label>
                <input type="text" value={profile.skills.join(', ')} onChange={handleSkillsChange} placeholder="React, Node.js, Python..."
                  className="edit-input"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Career Goals</label>
                <textarea name="careerGoals" value={profile.careerGoals} onChange={handleChange} placeholder="Tell us about your professional aspirations..."
                  className="edit-input"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', minHeight: '140px', resize: 'vertical', transition: 'all 0.3s ease', boxSizing: 'border-box', lineHeight: '1.7', fontFamily: 'Outfit, sans-serif' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                {[
                  { label: 'LinkedIn URL', name: 'socialLinks.linkedin', value: profile.socialLinks.linkedin, placeholder: 'https://linkedin.com/in/...' },
                  { label: 'GitHub URL', name: 'socialLinks.github', value: profile.socialLinks.github, placeholder: 'https://github.com/...' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{field.label}</label>
                    <input type="text" name={field.name} value={field.value} onChange={handleChange} placeholder={field.placeholder}
                      className="edit-input"
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '36px' }}>
                <button onClick={() => { setIsEditing(false); setActiveTab('overview'); }} style={{ flex: 1, padding: '16px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                <button onClick={handleSave}
                  style={{ flex: 2, padding: '16px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(99,102,241,0.4)', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                >
                  <Check size={18} style={{ display: 'inline', marginRight: '8px' }} />Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="crop-overlay">
          <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '40px', width: '500px', maxWidth: '90vw' }}>
            <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '22px', marginBottom: '24px' }}>Customize Avatar</h3>
            <div style={{ position: 'relative', height: '300px', background: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>Zoom</label>
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={e => setZoom(e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowCropModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleShowCroppedImage} style={{ flex: 1, padding: '14px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer' }}>Save Picture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

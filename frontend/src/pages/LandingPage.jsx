import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ───── Utility: clamp ─────
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [typed, setTyped] = useState('');
  const [typeIdx, setTypeIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  const words = ['Tech Interviews', 'Coding Challenges', 'System Design', 'Behavioral Rounds', 'DSA Problems'];

  // ── Mouse parallax ──
  useEffect(() => {
    const move = (e) => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // ── Scroll ──
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Typing effect ──
  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (typeIdx < word.length) {
          setTyped(word.slice(0, typeIdx + 1));
          setTypeIdx(t => t + 1);
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (typeIdx > 0) {
          setTyped(word.slice(0, typeIdx - 1));
          setTypeIdx(t => t - 1);
        } else {
          setDeleting(false);
          setWordIdx(i => (i + 1) % words.length);
        }
      }
    }, deleting ? 50 : 90);
    return () => clearTimeout(timeout);
  }, [typeIdx, deleting, wordIdx]);

  // ── Particle canvas ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 60;
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particlesRef.current;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);

  // ── Intersection observer for section reveals ──
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(p => ({ ...p, [e.target.dataset.section]: true }));
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-section]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const features = [
    { icon: '🧠', color: '#a78bfa', title: 'AI Mock Interviews', desc: 'Neural engine adapts to your responses in real-time. Voice-to-text powered, with deep feedback on accuracy and delivery.', tag: 'NEURAL', wide: true },
    { icon: '📊', color: '#60a5fa', title: 'Deep Analytics', desc: 'Micro-feedback on pace, sentiment, vocabulary richness, and technical accuracy.', tag: 'INSIGHTS' },
    { icon: '🚀', color: '#f472b6', title: 'Question Bank', desc: '5,000+ domain-specific real interview questions, curated from FAANG and top startups.', tag: 'CURATED' },
    { icon: '✨', color: '#4ade80', title: 'Resume AI Scanner', desc: 'ATS scoring, keyword gap analysis, and actionable optimization tips to triple your shortlist rate.', tag: 'ATS-PRO', wide: true },
    { icon: '💻', color: '#fbbf24', title: 'Coding Tests & MCQ', desc: 'Multi-language execution with real-time test validation and AI code review.', tag: 'MULTI-LANG' },
    { icon: '🗺️', color: '#38bdf8', title: 'Roadmap Generator', desc: 'Personalized learning paths — from your current skill level to your dream role.', tag: 'ADAPTIVE' },
    { icon: '👥', color: '#f87171', title: 'Community & Blogs', desc: 'Real interview experiences, expert blogs, and a thriving community of top talent.', tag: 'LIVE' },
  ];

  const stats = [
    { num: '5K+', label: 'Interview Questions', icon: '❓' },
    { num: '10K+', label: 'Mock Sessions', icon: '🎯' },
    { num: '95%', label: 'Success Rate', icon: '📈' },
    { num: '24/7', label: 'AI Availability', icon: '⚡' },
  ];

  const steps = [
    { n: '01', icon: '🎯', title: 'Sign Up & Plan', desc: 'Create your profile, set career goals, get your personalized roadmap.' },
    { n: '02', icon: '🔥', title: 'Practice Hard', desc: 'Take AI-powered mock interviews, coding tests, and master MCQs.' },
    { n: '03', icon: '📊', title: 'Analyze & Refine', desc: 'Instant feedback, ATS resume scores, and deep performance insights.' },
    { n: '04', icon: '🏆', title: 'Ace the Interview', desc: 'Walk in with total confidence and a much higher chance of success.' },
  ];

  const testimonials = [
    { q: 'The AI mock interviews are incredibly realistic. The feedback helped me crack my dream job at Amazon!', name: 'Sarah Jenkins', role: 'Software Engineer @ Amazon', init: 'S', col: '#a78bfa' },
    { q: 'Roadmap Generator + coding practice structured my prep brilliantly. Absolutely worth every minute.', name: 'David Chen', role: 'Frontend Dev @ Google', init: 'D', col: '#60a5fa' },
    { q: 'Resume Scanner found keywords I was missing. Got shortlisted by top-tier companies instantly after fixing.', name: 'Priya Patel', role: 'Data Scientist @ Meta', init: 'P', col: '#f472b6' },
  ];

  const navScrolled = scrollY > 60;

  return (
    <div style={{ minHeight: '100vh', background: '#030308', color: '#fff', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(139,92,246,0.4); color: #fff; }
        :root { --p: #7c3aed; --p2: #a78bfa; --q: #ec4899; }
        
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-18px);} }
        @keyframes floatB { 0%,100%{transform:translateY(-8px) rotate(0deg);} 50%{transform:translateY(8px) rotate(3deg);} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1);} 50%{opacity:1;transform:scale(1.04);} }
        @keyframes rotateSlow { to{transform:rotate(360deg);} }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes gridFade { from{opacity:0;} to{opacity:1;} }
        @keyframes revealUp { from{opacity:0;transform:translateY(60px) scale(0.96);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes gradientMove { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
        @keyframes scanLine { 0%{transform:translateY(-100%);} 100%{transform:translateY(200vh);} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(60px,-40px) scale(1.1);} 66%{transform:translate(-30px,60px) scale(0.9);} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-50px,40px) scale(1.15);} 66%{transform:translate(40px,-50px) scale(0.95);} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-60px) scale(1.05);} }
        @keyframes neonPulse { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3),0 0 60px rgba(124,58,237,0.1);} 50%{box-shadow:0 0 40px rgba(124,58,237,0.6),0 0 100px rgba(124,58,237,0.2);} }
        @keyframes countUp { from{opacity:0;transform:scale(0.5);} to{opacity:1;transform:scale(1);} }
        @keyframes marquee { from{transform:translateX(0);} to{transform:translateX(-50%);} }
        @keyframes stepLine { from{width:0;} to{width:100%;} }
        @keyframes tiltIn { from{opacity:0;transform:perspective(1000px) rotateY(-20deg) translateX(-40px);} to{opacity:1;transform:perspective(1000px) rotateY(0deg) translateX(0);} }

        .cursor { animation: blink 1s step-end infinite; font-weight:300; color: #a78bfa; }
        .section-reveal { opacity:0; transform:translateY(60px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1); }
        .section-reveal.visible { opacity:1; transform:translateY(0); }
        .feature-3d { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); transform-style: preserve-3d; }
        .feature-3d:hover { transform: translateY(-12px) scale(1.02); }
        .glow-btn { position:relative; overflow:hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .glow-btn::before { content:''; position:absolute; inset:-2px; background:linear-gradient(135deg,#7c3aed,#ec4899,#7c3aed); background-size:300%; animation:gradientMove 4s ease infinite; border-radius:inherit; z-index:-1; opacity:0; transition:opacity 0.3s; }
        .glow-btn:hover::before { opacity:1; }
        .glow-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 20px 60px rgba(124,58,237,0.5); }
        .magnetic-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); cursor: default; }
        .magnetic-card:hover { border-color: rgba(139,92,246,0.5) !important; }
        .nav-link-item { position:relative; color:rgba(255,255,255,0.6); text-decoration:none; font-weight:600; font-size:14px; transition:color 0.2s; }
        .nav-link-item::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:linear-gradient(90deg,#7c3aed,#ec4899); transition:width 0.3s ease; }
        .nav-link-item:hover { color:#fff; }
        .nav-link-item:hover::after { width:100%; }
        .shimmer-text { background: linear-gradient(90deg, #fff 0%, #a78bfa 25%, #fff 50%, #f472b6 75%, #fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite; }
        .grid-bg { background-image: linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px); background-size: 60px 60px; }
        .step-connector { position:absolute; top:28px; left:calc(50% + 60px); width:calc(100% - 120px); height:1px; background:linear-gradient(90deg, rgba(124,58,237,0.5), rgba(236,72,153,0.3)); transition:all 1.2s ease; }
        .stat-card:hover .stat-num { animation: pulse 0.6s ease; }
        .testi-card { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .testi-card:hover { transform: translateY(-8px) scale(1.02); }
        .tag-pill { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; padding:3px 10px; border-radius:20px; }
        .logo-glow { text-shadow: 0 0 40px rgba(124,58,237,0.4); }

        @media (max-width: 768px) {
          .hero-title-main { font-size: 2.8rem !important; }
          .features-bento { grid-template-columns: 1fr !important; }
          .steps-row { grid-template-columns: 1fr 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
          .stat-bar { flex-wrap: wrap !important; }
          .nav-links { display: none !important; }
          .hero-actions { flex-direction: column !important; }
        }
      `}</style>

      {/* ── PARTICLE CANVAS ── */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── AMBIENT ORBS ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'orb1 20s ease-in-out infinite', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)', animation: 'orb2 25s ease-in-out infinite', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)', animation: 'orb3 18s ease-in-out infinite', filter: 'blur(50px)' }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '20px 6%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navScrolled ? 'rgba(3,3,8,0.85)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(24px)' : 'none',
        borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <div className="logo-glow" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
          Prep<span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
          {['Features', 'How It Works', 'Testimonials'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="nav-link-item">{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >Log In</Link>
          <Link to="/register">
            <button className="glow-btn" style={{ padding: '10px 24px', borderRadius: '50px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: '1px solid rgba(139,92,246,0.5)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', letterSpacing: '0.3px' }}>
              Get Started →
            </button>
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <main className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 6% 120px', position: 'relative', zIndex: 1 }}>
        
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '50px', padding: '8px 20px', marginBottom: '40px', animation: 'fadeUp 0.6s ease both' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', animation: 'pulse 2s ease infinite' }} />
          <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>✦ Rated #1 AI Interview Prep Platform</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title-main" style={{ fontSize: 'clamp(3.2rem, 7vw, 6.5rem)', fontWeight: '900', lineHeight: 1.05, letterSpacing: '-3px', marginBottom: '32px', animation: 'fadeUp 0.7s 0.1s ease both' }}>
          Master Every<br />
          <span className="shimmer-text">{typed}</span>
          <span className="cursor">|</span>
        </h1>

        {/* Subhead */}
        <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: 'rgba(255,255,255,0.55)', maxWidth: '680px', lineHeight: '1.7', marginBottom: '52px', fontWeight: '400', animation: 'fadeUp 0.7s 0.2s ease both' }}>
          The most advanced AI-driven platform for personalized mock interviews,
          coding tests, smart roadmaps, and career preparation that actually works.
        </p>

        {/* CTA Buttons */}
        <div className="hero-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.3s ease both' }}>
          <Link to="/register">
            <button className="glow-btn" style={{ padding: '18px 44px', borderRadius: '60px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', border: 'none', color: '#fff', fontSize: '17px', fontWeight: '800', cursor: 'pointer', letterSpacing: '-0.3px', boxShadow: '0 8px 30px rgba(124,58,237,0.5)' }}>
              🚀 Start For Free
            </button>
          </Link>
          <Link to="/login">
            <button style={{ padding: '18px 44px', borderRadius: '60px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '17px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              View Demo →
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '32px', marginTop: '60px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.4s ease both' }}>
          {['No credit card required', '100% free to start', '10K+ happy users'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600' }}>
              <span style={{ color: '#4ade80' }}>✓</span> {t}
            </div>
          ))}
        </div>

        {/* Hero visual: floating cards */}
        <div style={{ position: 'absolute', right: '3%', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.7, pointerEvents: 'none' }}>
          {[
            { icon: '🧠', label: 'AI Interview', score: '9.2/10', col: '#a78bfa' },
            { icon: '📊', label: 'Analytics', score: '+34%', col: '#60a5fa' },
            { icon: '🏆', label: 'Hired!', score: '✓', col: '#4ade80' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', animation: `float ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`, transform: `translateX(${i % 2 === 0 ? '0' : '20px'})`, minWidth: '180px' }}>
              <span style={{ fontSize: '24px' }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{c.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: c.col }}>{c.score}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ═══════════════════════════════ STATS TICKER ═══════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', animation: 'marquee 20s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {['5K+ Questions', '🔥', '10K+ Mock Sessions', '⚡', '95% Success Rate', '🎯', '24/7 AI Coach', '✨', 'Voice-to-Text', '🧠', 'ATS Scanner', '🏆'].map((t, i) => (
                <span key={i} style={{ padding: '16px 32px', color: typeof t === 'string' && /[^\x00-\x7F]/.test(t) ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════ STATS ═══════════════════════════════ */}
      <section id="features" style={{ padding: '100px 6%', position: 'relative', zIndex: 2 }}>
        <div className="stat-bar section-reveal" data-section="stats" style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap', maxWidth: '1100px', margin: '0 auto 100px', ...(visibleSections.stats ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card magnetic-card" style={{ flex: '1', minWidth: '200px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: i === 0 ? '24px 6px 6px 24px' : i === 3 ? '6px 24px 24px 6px' : '6px', padding: '40px 32px', textAlign: 'center', cursor: 'default', transition: 'all 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
              <div className="stat-num" style={{ fontSize: '3.5rem', fontWeight: '900', background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px', lineHeight: 1 }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '600', marginTop: '10px', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── BENTO GRID FEATURES ── */}
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div className="section-reveal" data-section="featHeader" style={{ textAlign: 'center', marginBottom: '64px', ...(visibleSections.featHeader ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', color: '#a78bfa', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>⚙ Platform Features</div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1.1 }}>
              An Arsenal to <span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Excel</span>
            </h2>
          </div>

          <div id="features" className="features-bento section-reveal" data-section="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', ...(visibleSections.features ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-3d"
                style={{ gridColumn: f.wide ? 'span 7' : 'span 5', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', padding: '40px', position: 'relative', overflow: 'hidden', cursor: 'default', animationDelay: `${i * 0.07}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.background = `${f.color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', background: `radial-gradient(circle, ${f.color}20, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ width: '60px', height: '60px', background: `${f.color}18`, border: `1px solid ${f.color}30`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{f.icon}</div>
                  <span className="tag-pill" style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', fontSize: '15px' }}>{f.desc}</p>
                <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: '700', color: f.color, display: 'flex', alignItems: 'center', gap: '6px' }}>Explore →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '120px 6%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 2, overflow: 'hidden' }}>
        {/* BG accent */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-reveal" data-section="steps" style={{ textAlign: 'center', marginBottom: '80px', ...(visibleSections.steps ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-block', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', color: '#f472b6', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>◈ The Process</div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1.1 }}>
              Your Path to <span style={{ background: 'linear-gradient(135deg,#f472b6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Success</span>
            </h2>
          </div>

          <div className="steps-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', top: '44px', left: '12%', right: '12%', height: '1px', background: 'linear-gradient(90deg, rgba(124,58,237,0.5), rgba(236,72,153,0.4), rgba(124,58,237,0.5))', zIndex: 0 }} />

            {steps.map((s, i) => (
              <div key={i} className="section-reveal magnetic-card" data-section={`step${i}`}
                style={{ textAlign: 'center', padding: '40px 28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', position: 'relative', zIndex: 1, ...(visibleSections[`step${i}`] ? { opacity: 1, transform: 'none' } : {}), transition: `all 0.8s ${0.1 * i}s ease` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.15))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>{s.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '3px', marginBottom: '12px', textTransform: 'uppercase' }}>{s.n}</div>
                <h4 style={{ fontSize: '19px', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.3px' }}>{s.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.7' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
      <section id="testimonials" style={{ padding: '120px 6%', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-reveal" data-section="testiHead" style={{ textAlign: 'center', marginBottom: '80px', ...(visibleSections.testiHead ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-block', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '50px', padding: '6px 18px', marginBottom: '20px', color: '#93c5fd', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>★ User Stories</div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1.1 }}>
              Loved by <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thousands</span>
            </h2>
          </div>

          <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card section-reveal" data-section={`testi${i}`}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '28px', padding: '40px 32px', position: 'relative', overflow: 'hidden', ...(visibleSections[`testi${i}`] ? { opacity: 1, transform: 'none' } : {}), transition: `all 0.8s ${0.15 * i}s ease` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.col}40`; e.currentTarget.style.background = `${t.col}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '48px', opacity: 0.07, fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
                  {[...Array(5)].map((_, si) => <span key={si} style={{ color: '#facc15', fontSize: '14px' }}>★</span>)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontSize: '15px', marginBottom: '32px', fontStyle: 'italic' }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.col}, ${t.col}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{t.init}</div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ CTA BANNER ═══════════════════════════════ */}
      <section style={{ padding: '80px 6%', position: 'relative', zIndex: 2 }}>
        <div className="section-reveal" data-section="cta" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.10))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '40px', padding: '80px 60px', position: 'relative', overflow: 'hidden', animation: 'neonPulse 4s ease-in-out infinite', ...(visibleSections.cta ? { opacity: 1, transform: 'none' } : {}), transition: 'all 0.8s ease' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(124,58,237,0.2),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(236,72,153,0.15),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '52px', marginBottom: '24px' }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Ready to <span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ace Your Next Interview?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '18px', marginBottom: '44px', maxWidth: '500px', margin: '0 auto 44px' }}>Join thousands of engineers who transformed their interview performance with PrepAI.</p>
          <Link to="/register">
            <button className="glow-btn" style={{ padding: '20px 56px', borderRadius: '60px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', border: 'none', color: '#fff', fontSize: '18px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 40px rgba(124,58,237,0.5)', letterSpacing: '-0.3px' }}>
              Get Started — It's Free ✨
            </button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer style={{ padding: '60px 6% 40px', background: '#020207', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div className="logo-glow" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>
              Prep<span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '300px', lineHeight: '1.7', fontSize: '14px' }}>Empowering engineers to master technical interviews through AI and personalized learning.</p>
          </div>
          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            {[
              { title: 'Platform', links: ['Mock Interviews', 'Question Bank', 'Coding Tests', 'Roadmaps'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                    >{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>© 2026 PrepAI Technologies. All rights reserved.</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>Built with ❤️ for engineering excellence</div>
        </div>
      </footer>
    </div>
  );
}

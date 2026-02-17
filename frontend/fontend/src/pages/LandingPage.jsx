import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaBrain, FaChartLine, FaArrowRight, FaMagic } from 'react-icons/fa';
import '../styles/landing.css';
import '../index.css';

const SplineScene = lazy(() => import('../components/SplineScene'));

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* 3D Dynamic Background */}
      <Suspense fallback={<div style={{ background: '#02010a', width: '100%', height: '100vh' }} />}>
        <SplineScene />
      </Suspense>

      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="logo-text">
          Prep<span>AI</span>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="btn-login">Log In</Link>
          <Link to="/register" className="btn-started">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="hero-badge">
            <FaMagic style={{ marginRight: '8px', color: '#a78bfa' }} /> AI-Powered Mock Interviews
          </div>

          <h1 className="hero-title">
            The Future of <br />
            <span className="gradient-text">Interview Mastery</span>
          </h1>

          <p className="hero-desc">
            Experience the most advanced AI-driven platform for personalized mock interviews, real-time analytics, and expert-level career preparation.
          </p>

          <div className="hero-actions">
            <Link to="/register">
              <button className="btn-hero-primary">
                Get Started Free <FaArrowRight />
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-hero-secondary">
                View Live Demo
              </button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Features Bento Grid */}
      <section className="features-section">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-title">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
        </div>

        <div className="features-grid">
          <FeatureCard
            icon={<FaBrain style={{ color: '#a78bfa' }} />}
            title="AI Mock Interviews"
            description="Our advanced neural engines simulate real-world technical and HR interviews, adapting in real-time to your responses with pinpoint precision."
            delay={0.1}
            className="bento-large"
          />
          <FeatureCard
            icon={<FaChartLine style={{ color: '#60a5fa' }} />}
            title="Deep Analytics"
            description="Get micro-feedback on your pace, sentiment, and technical accuracy with our comprehensive dashboard."
            delay={0.2}
            className="bento-small"
          />
          <FeatureCard
            icon={<FaRocket style={{ color: '#f472b6' }} />}
            title="Question Bank"
            description="Access 5,000+ domain-specific questions curated from top tech company interviews."
            delay={0.3}
            className="bento-small"
          />
          <FeatureCard
            icon={<FaMagic style={{ color: '#4ade80' }} />}
            title="Resume AI Scanner"
            description="Instantly score your resume against JD-specific ATS systems and get actionable optimization tips to boost your shortlist probability."
            delay={0.4}
            className="bento-large"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-title">
            Your Path to <span className="gradient-text">Success</span>
          </h2>
        </div>

        <div className="steps-grid">
          <StepCard number="01" title="Sign Up" desc="Create your profile and set your career goals." />
          <StepCard number="02" title="Practice" desc="Take AI-driven mock interviews anytime." />
          <StepCard number="03" title="Analyze" desc="Get instant feedback and deep insights." />
          <StepCard number="04" title="Succeed" desc="Ace your real interview with total confidence." />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="logo-text" style={{ marginBottom: '1.5rem' }}>
          Prep<span>AI</span>
        </div>
        <p style={{ color: '#94a3b8' }}>© 2026 PrepAI Technologies. Redefining Career Preparation.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`feature-card ${className}`}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

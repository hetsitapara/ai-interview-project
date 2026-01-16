import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaBrain, FaChartLine, FaArrowRight } from 'react-icons/fa';
import '../styles/landing.css';
//import HeroImage from '/Users/hetsitapara/.gemini/antigravity/brain/71c524c8-ee07-4cdb-bcaf-8a50029a14ab/hero_ai_visual_1768040287036.png'; // Please copy this to src/assets usually, but sticking to absolute path for now as per agentic mode

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Background Ambience */}
      <div className="landing-blob blob-1" />
      <div className="landing-blob blob-2" />
      
      {/* Cursor Spotlight */}
      <div 
        className="cursor-spotlight"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(129, 140, 248, 0.15), transparent 40%)`
        }}
      />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo-text">
          Prep<span>AI</span>
        </div>
        <div className="nav-buttons">
          <Link to="/login">
            <button className="btn-login">Log In</button>
          </Link>
          <Link to="/register">
            <button className="btn-started">Get Started</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text-content"
          >
            {/* <div className="hero-badge">
              🚀 The Future of Interview Prep is Here
            </div> */}
            <h1 className="hero-title">
              Master Your Interviews with <br />
              <span className="gradient-text">
                AI-Powered Precision
              </span>
            </h1>
            <p className="hero-desc">
              Experience personalized mock interviews, real-time feedback, and comprehensive analytics to land your dream job.
            </p>
            
            <div className="hero-actions">
               <Link to="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hero-primary"
                >
                  Start For Free <FaArrowRight />
                </motion.button>
              </Link>
              <Link to="/login">
                 <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hero-secondary"
                >
                  View Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-image-container"
          >
             <img src={HeroImage} alt="AI Brain Visualization" className="hero-visual" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title" style={{marginBottom: '3rem', textAlign: 'center'}}>
          Everything You Need to <span className="gradient-text">Excel</span>
        </h2>
        <div className="features-grid">
          <FeatureCard 
            icon={<FaBrain style={{ color: '#c084fc' }} />}
            title="AI Mock Interviews"
            description="Practice with an intelligent AI that adapts to your responses and provides constructive feedback."
            delay={0.2}
            className="bento-large"
          />
           <FeatureCard 
            icon={<FaChartLine style={{ color: '#f472b6' }} />}
            title="Deep Analytics"
            description="Track your progress with detailed reports on your communication skills."
            delay={0.4}
            className="bento-small"
          />
           <FeatureCard 
            icon={<FaRocket style={{ color: '#818cf8' }} />}
            title="Curated Question Bank"
            description="Access thousands of questions across various domains and difficulties."
            delay={0.6}
            className="bento-small"
          />
          <FeatureCard 
            icon={<FaArrowRight style={{ color: '#4ade80' }} />} 
            title="Resume AI Scanner"
            description="Get your resume scored by our AI against industry standards to ensure you pass the ATS."
            delay={0.8}
            className="bento-large"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <h2 className="section-title">
          Your Path to <span style={{ color: '#818cf8' }}>Success</span>
        </h2>
        
        <div className="steps-grid">
          <Step number="01" title="Sign Up" desc="Create your profile and set your goals." />
          <Step number="02" title="Practice" desc="Take AI-driven mock interviews." />
          <Step number="03" title="Analyze" desc="Get instant feedback and insights." />
          <Step number="04" title="Succeed" desc="Ace your real interview with confidence." />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 PrepAI. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
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
      whileHover={{ y: -5 }}
      className={`feature-card ${className}`}
    >
      <div className="feature-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-number">
        {number}
      </div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

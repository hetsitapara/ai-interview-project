import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaRocket, FaBrain, FaChartLine, FaArrowRight, FaMagic, 
  FaCode, FaUsers, FaMapSigns, FaQuoteLeft, FaStar, FaTrophy 
} from 'react-icons/fa';
import '../styles/landing.css';
import '../index.css';

import '../index.css';

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
      {/* Abstract Background Elements */}
      <div className="blob blob-1" style={{ position: 'absolute', width: '50vw', height: '50vw', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
      <div className="blob blob-2" style={{ position: 'absolute', width: '40vw', height: '40vw', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />

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
            <FaStar style={{ marginRight: '8px', color: '#f59e0b' }} /> Rated #1 AI Interview Prep Platform
          </div>

          <h1 className="hero-title">
            Master Every <br />
            <span className="gradient-text">Tech Interview</span>
          </h1>

          <p className="hero-desc">
            Experience the most advanced AI-driven platform for personalized mock interviews, real-world coding tests, smart roadmaps, and expert-level career preparation.
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

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">5K+</div>
          <div className="stat-label">Interview Questions</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10K+</div>
          <div className="stat-label">Mock Interviews</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">95%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">AI Coach Availability</div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="features-section">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-title">
            An Arsenal to <span className="gradient-text">Excel</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to crack top tech interviews, unified in one intelligent platform.
          </p>
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
          <FeatureCard
            icon={<FaCode style={{ color: '#fbbf24' }} />}
            title="Coding Tests & MCQ"
            description="Sharpen your syntax with timed coding exams and detailed MCQ practices tailored to your tech stack."
            delay={0.5}
            className="bento-small"
          />
          <FeatureCard
            icon={<FaMapSigns style={{ color: '#38bdf8' }} />}
            title="Roadmap Generator"
            description="Generate customized, step-by-step learning roadmaps based on your target role and current skill level."
            delay={0.6}
            className="bento-small"
          />
          <FeatureCard
            icon={<FaUsers style={{ color: '#f87171' }} />}
            title="Community & Blogs"
            description="Learn from real interview experiences, read expert blogs, and engage with a community of top talent."
            delay={0.7}
            className="bento-small"
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
          <StepCard number="01" title="Sign Up & Plan" desc="Create your profile, set your career goals, and generate a customized roadmap." />
          <StepCard number="02" title="Practice Hard" desc="Take AI-driven mock interviews, solve coding tests, and master MCQs." />
          <StepCard number="03" title="Analyze & Refine" desc="Get instant feedback, ATS resume scores, and deep performance insights." />
          <StepCard number="04" title="Ace the Interview" desc="Walk into your real interview with total confidence and higher chance of success." />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-title">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
        </div>
        
        <div className="testimonials-grid">
          <TestimonialCard 
            quote="The AI mock interviews are incredibly realistic. The feedback on my tone and technical accuracy helped me crack my dream job at Amazon!"
            author="Sarah Jenkins"
            role="Software Engineer"
          />
          <TestimonialCard 
            quote="I used the Roadmap Generator and the coding practice tests. This platform structures your prep brilliantly. Absolutely worth it."
            author="David Chen"
            role="Frontend Developer"
          />
          <TestimonialCard 
            quote="The Resume Scanner found crucial keywords I was missing. Got shortlists from top tier companies instantly after fixing it."
            author="Priya Patel"
            role="Data Scientist"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="logo-text" style={{ marginBottom: '1.5rem' }}>
          Prep<span>AI</span>
        </div>
        <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '2rem' }}>
          Empowering engineers to master their technical interviews through artificial intelligence and personalized learning paths.
        </p>
        <div className="footer-links" style={{ paddingBottom: '2rem' }}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Careers</a>
          <a href="#">Contact Us</a>
        </div>
        <div style={{ paddingBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
          © 2026 PrepAI Technologies. Redefining Career Preparation.
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

function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="testimonial-card"
    >
      <FaQuoteLeft className="quote-icon" />
      <p className="testimonial-text">"{quote}"</p>
      <div className="testimonial-author">
        <div className="author-avatar">{author.charAt(0)}</div>
        <div className="author-info">
          <h5>{author}</h5>
          <p style={{ color: '#94a3b8' }}>{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from '../components/Layout/LanguageToggle';
import { motion } from 'framer-motion';
import './LandingPage.css';

const floatingShapes = [
  { id: 1, size: 120, top: '10%', left: '6%', delay: 0 },
  { id: 2, size: 80, top: '70%', left: '15%', delay: 1.5 },
  { id: 3, size: 140, top: '30%', left: '75%', delay: 0.8 },
  { id: 4, size: 100, top: '60%', left: '60%', delay: 2.2 },
];

// Floating shapes for hero
const FloatingShapes = () => (
  <div className="floating-shapes">
    {floatingShapes.map((shape) => (
      <motion.span
        key={shape.id}
        className="floating-shape"
        style={{ width: shape.size, height: shape.size, top: shape.top, left: shape.left }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, -6, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: shape.delay,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// Floating shapes for "How it Works" section
const FloatingShapesHow = () => (
  <div className="floating-shapes how-floating">
    {floatingShapes.map((shape) => (
      <motion.span
        key={shape.id + '-how'}
        className="floating-shape"
        style={{ width: shape.size, height: shape.size, top: shape.top, left: shape.left }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, -6, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: shape.delay,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-page page">
      <FloatingShapes />

      {/* Header */}
      <header className="landing-header">
        <div className="logo-section">
          <h1 className="app-logo">{t('common.appName')}</h1>
        </div>
        <div className="header-actions">
          <LanguageToggle />
          <Link to="/login" className="btn-secondary">
            {t('auth.login')}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">{t('landing.heroTitle')}</h2>
          <p className="hero-subtitle">{t('landing.heroSubtitle')}</p>
          <Link to="/signup" className="btn-primary btn-large">
            {t('landing.getStarted')}
          </Link>
        </div>

        {/* Video */}
        <div className="hero-video">
          <div className="video-container">
            <video autoPlay loop muted playsInline className="demo-video">
              <source src="/demo-video.mp4" type="video/mp4" />
              <source src="/demo-video.webm" type="video/webm" />
              <div className="hero-illustration">🎤💳</div>
            </video>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2 className="section-title">{t('landing.aboutTitle')}</h2>
        <div className="about-content">
          <div className="about-text">
            <p>{t('landing.aboutDescription')}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>{t('landing.feature1Title')}</h3>
              <p>{t('landing.feature1Desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎙️</div>
              <h3>{t('landing.feature2Title')}</h3>
              <p>{t('landing.feature2Desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>{t('landing.feature3Title')}</h3>
              <p>{t('landing.feature3Desc')}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>{t('landing.feature4Title')}</h3>
              <p>{t('landing.feature4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION WITH FLOATING BACKGROUND */}
      <section className="how-it-works-section">
        <FloatingShapesHow />

        <h2 className="section-title">{t('landing.howItWorks')}</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>{t('landing.step1Title')}</h3>
            <p>{t('landing.step1Desc')}</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>{t('landing.step2Title')}</h3>
            <p>{t('landing.step2Desc')}</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>{t('landing.step3Title')}</h3>
            <p>{t('landing.step3Desc')}</p>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <h3>{t('landing.step4Title')}</h3>
            <p>{t('landing.step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>{t('landing.ctaTitle')}</h2>
        <p>{t('landing.ctaSubtitle')}</p>
        <Link to="/signup" className="btn-primary btn-large">
          {t('landing.getStarted')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;

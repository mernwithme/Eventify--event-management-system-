import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaEnvelope,
  FaMusic,
  FaCalendarAlt,
  FaTicketAlt,
  FaShieldAlt,
  FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-modern">
      <div className="footer-gradient-line"></div>

      <Container fluid className="footer-container">
        <div className="footer-content">
          <Row className="g-4 pb-5">
            <Col xs={12} md={3} className="footer-section">
              <div className="brand-section">
                <h4 className="footer-brand">
                  <span className="brand-icon">✨</span> Eventify
                </h4>
                <p className="footer-tagline">Create. Manage. Experience Events.</p>
                <p className="footer-description">
                  Eventify is a modern platform for organizing personal gatherings and discovering live concert events.
                </p>
              </div>
            </Col>

            <Col xs={12} sm={6} md={2} className="footer-section">
              <h5 className="footer-section-title">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/personal-events">Personal Events</Link></li>
                <li><Link to="/concert-events">Concert Events</Link></li>
              </ul>
            </Col>

            <Col xs={12} sm={6} md={3} className="footer-section">
              <h5 className="footer-section-title">Platform Features</h5>
              <ul className="footer-features">
                <li><FaCalendarAlt /> Private Event Hosting</li>
                <li><FaMusic /> Concert Ticket Booking</li>
                <li><FaTicketAlt /> Real-time RSVP Tracking</li>
                <li><FaShieldAlt /> Secure Payments</li>
              </ul>
            </Col>

            <Col xs={12} md={4} className="footer-section">
              <h5 className="footer-section-title">Developer</h5>
              <p className="developer-text">
                <strong>Developed by:</strong> Nithish Kumar
              </p>
              
              <div className="social-links">
                <a 
                  href="https://github.com/mernwithme" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon github"
                  title="GitHub"
                >
                  <FaGithub />
                </a>
                <a 
                  href="https://www.linkedin.com/in/nithish-kumar-518099301/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon linkedin"
                  title="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a 
                  href="mailto:nithishkumar6442@gmail.com" 
                  className="social-icon email"
                  title="Email"
                >
                  <FaEnvelope />
                </a>
              </div>

              <div className="newsletter-section mt-4">
                <p className="newsletter-label">Subscribe for updates</p>
                <div className="newsletter-input-group">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="newsletter-input"
                    aria-label="Email for newsletter"
                  />
                  <button className="newsletter-btn" title="Subscribe">→</button>
                </div>
              </div>
            </Col>
          </Row>

          <div className="footer-divider"></div>

          <Row className="footer-bottom align-items-center py-4">
            <Col xs={12} md={8} className="text-center text-md-start mb-3 mb-md-0">
              <p className="footer-copyright">
                © {currentYear} Eventify — Built with passion by <strong>Nithish Kumar</strong>
              </p>
            </Col>
            <Col xs={12} md={4} className="text-center text-md-end">
              <button 
                className="back-to-top-btn"
                onClick={scrollToTop}
                title="Back to Top"
              >
                <FaArrowUp /> Back to Top
              </button>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

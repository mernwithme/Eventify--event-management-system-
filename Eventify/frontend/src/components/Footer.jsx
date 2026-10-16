import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaArrowUp, 
  FaCalendarAlt, 
  FaMusic, 
  FaCompass, 
  FaShieldAlt 
} from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-editorial" role="contentinfo">
      <Container className="content-container">
        <Row className="g-4">
          {/* Brand & Purpose */}
          <Col xs={12} md={4}>
            <div className="mb-3">
              <h4 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Eventify
              </h4>
              <p className="text-white-50 small mb-3" style={{ lineHeight: '1.6' }}>
                A modern platform for organizing personal gatherings, discovering live concerts, and matching opportunities using multi-signal recommendation intelligence.
              </p>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-25" style={{ fontSize: '0.75rem' }}>
                  Test Mode Simulation Active
                </span>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={6} md={2}>
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/opportunities">Opportunities</Link></li>
              <li><Link to="/personal-events">Personal Events</Link></li>
              <li><Link to="/concert-events">Concert Events</Link></li>
            </ul>
          </Col>

          {/* Legal Documentation */}
          <Col xs={6} md={3}>
            <h5>Legal and Policies</h5>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms and Conditions</Link></li>
              <li>
                <span className="text-muted small d-block mt-2">
                  All payment and ticketing workflows are simulated demonstrations.
                </span>
              </li>
            </ul>
          </Col>

          {/* Developer Attribution & Links */}
          <Col xs={12} md={3}>
            <h5>Maintainer</h5>
            <p className="small mb-3">
              Developed by <strong className="text-white">Nithish Kumar</strong>
            </p>
            <div className="d-flex gap-3 align-items-center mb-3">
              <a
                href="https://github.com/mernwithme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50"
                style={{ fontSize: '1.25rem' }}
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/nithish-kumar-518099301/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50"
                style={{ fontSize: '1.25rem' }}
                aria-label="LinkedIn Profile"
                title="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="mailto:nithishkumar6442@gmail.com"
                className="text-white-50"
                style={{ fontSize: '1.25rem' }}
                aria-label="Contact Email"
                title="Email"
              >
                <FaEnvelope />
              </a>
            </div>
            <p className="small text-muted mb-0">
              Inquiries: <a href="mailto:nithishkumar6442@gmail.com" className="text-muted">nithishkumar6442@gmail.com</a>
            </p>
          </Col>
        </Row>

        <div className="footer-bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-muted mb-0">
            &copy; {currentYear} Eventify. Built by Nithish Kumar. All rights reserved.
          </p>
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={scrollToTop}
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <FaArrowUp size={12} /> Back to top
          </button>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

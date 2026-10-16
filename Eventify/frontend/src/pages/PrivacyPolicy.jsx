import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper py-5">
      <Container className="content-container">
        <div className="mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 text-muted mb-3">
            <FaArrowLeft size={14} /> Back to Home
          </Link>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary px-3 py-2">Legal Documentation</span>
            <span className="badge bg-light text-muted border">Effective: October 2026</span>
          </div>
          <h1 className="display-5 fw-bold mb-3">Privacy Policy</h1>
          <p className="lead text-muted">
            This Privacy Policy describes how Eventify collects, uses, stores, and protects personal data when you use the Eventify web application and associated services.
          </p>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="border p-4 mb-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">1. Information We Collect</h2>
              <p>
                Eventify collects information directly provided by users to facilitate event organization, RSVP tracking, concert reservations, and personalized event discovery:
              </p>
              <ul>
                <li><strong>Account Credentials:</strong> Full name, email address, and encrypted passwords. Passwords are cryptographically salted and hashed using bcryptjs before storage.</li>
                <li><strong>Authentication Tokens:</strong> Stateless JSON Web Tokens (JWT) issued upon valid login, stored client-side in browser storage to maintain session state.</li>
                <li><strong>Event Creation & RSVPs:</strong> Event titles, descriptions, venue locations, event dates, pricing tiers, and attendee RSVP identifiers.</li>
                <li><strong>Simulated Booking Records:</strong> When testing concert ticket reservations, attendee names, simulated addresses, chosen ticket tiers, and transaction reference logs are saved to demonstrate ticketing workflows.</li>
                <li><strong>User Preferences:</strong> Optional interest keywords, skill tags, format preferences (in-person vs. online), and budget ranges used strictly by the client-initiated Opportunity Intelligence matching algorithm.</li>
              </ul>
            </Card>

            <Card className="border p-4 mb-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">2. How We Use Collected Data</h2>
              <p>Collected information is processed solely for the following explicit operational purposes:</p>
              <ul>
                <li>Authenticating authorized user sessions and verifying access to protected routes.</li>
                <li>Displaying private events to designated organizers and maintaining real-time attendee counts.</li>
                <li>Computing deterministic recommendation match scores via the local recommendation service.</li>
                <li>Facilitating simulated ticket reservation demonstrations and receipt generation.</li>
                <li>Ensuring security, debugging server errors, and preventing unauthorized API abuse.</li>
              </ul>
              <p className="mb-0">
                <strong>No Commercial Sale of Data:</strong> Eventify does not sell, lease, or monetize personal information. We do not integrate third-party ad networks or tracking pixels.
              </p>
            </Card>

            <Card className="border p-4 mb-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">3. Data Storage and Security Practices</h2>
              <p>
                User data is stored securely in MongoDB Atlas databases using encrypted network connections (TLS/SSL). We implement standard software engineering safeguards including:
              </p>
              <ul>
                <li>JWT expiration and validation on all non-public API endpoints.</li>
                <li>Environment variable isolation for database connection strings and cryptographic signing secrets.</li>
                <li>Input sanitization and parameterized MongoDB queries to protect against injection attacks.</li>
                <li>CORS domain whitelisting restricted to verified development ports and production domains.</li>
              </ul>
            </Card>

            <Card className="border p-4 mb-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">4. Simulated Transactions Disclaimer</h2>
              <p className="mb-0">
                All concert ticket booking and payment flows within Eventify are strictly simulated demonstration environments designed for software testing. No real banking networks or credit card processors are connected, and no financial charges are levied against any user account.
              </p>
            </Card>

            <Card className="border p-4 mb-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">5. User Rights and Data Deletion</h2>
              <p>
                Users maintain full control over their platform data. At any time, you may:
              </p>
              <ul>
                <li>Request an export of your personal event and reservation records.</li>
                <li>Delete events or cancel RSVPs directly within the dashboard.</li>
                <li>Request permanent account deletion and associated data erasure by contacting the administrator.</li>
              </ul>
            </Card>

            <Card className="border p-4 shadow-sm bg-white">
              <h2 className="h4 fw-bold mb-3">6. Contact Information</h2>
              <p>
                For privacy inquiries, security reports, or data deletion requests, contact the project maintainer:
              </p>
              <p className="mb-1"><strong>Entity:</strong> [Eventify Project Organization]</p>
              <p className="mb-1"><strong>Lead Developer:</strong> Nithish Kumar</p>
              <p className="mb-0"><strong>Email:</strong> <a href="mailto:nithishkumar6442@gmail.com">nithishkumar6442@gmail.com</a></p>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border p-4 shadow-sm bg-light mb-4 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                <FaShieldAlt size={22} />
                <h3 className="h5 fw-bold mb-0">Privacy Overview</h3>
              </div>
              <p className="small text-muted mb-3">
                Key guarantees regarding your interaction with Eventify:
              </p>
              <ul className="small text-muted ps-3 mb-4">
                <li className="mb-2">Encrypted password storage using industry-standard hashing.</li>
                <li className="mb-2">Zero third-party advertising cookies or trackers.</li>
                <li className="mb-2">Ticket reservations operate in simulated test mode.</li>
                <li className="mb-2">Complete user control over events and attendance status.</li>
              </ul>
              <div className="border-top pt-3">
                <Link to="/terms" className="btn btn-outline-dark btn-sm w-100">
                  Read Terms and Conditions
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;

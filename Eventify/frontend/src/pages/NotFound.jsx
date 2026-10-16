import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaCompass, FaMusic } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="page-wrapper py-5 d-flex align-items-center" style={{ minHeight: '65vh' }}>
      <Container className="content-container text-center py-5">
        <div className="mb-4">
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 fw-semibold">
            Error 404
          </span>
        </div>
        <h1 className="display-4 fw-bold mb-3">Page Not Found</h1>
        <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '600px' }}>
          The page you requested could not be found. It may have been moved, deleted, or the address entered may be incorrect.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/">
            <Button variant="primary" className="px-4 py-2 d-flex align-items-center gap-2">
              <FaHome /> Return to Home
            </Button>
          </Link>
          <Link to="/opportunities">
            <Button variant="outline-primary" className="px-4 py-2 d-flex align-items-center gap-2">
              <FaCompass /> Explore Opportunities
            </Button>
          </Link>
          <Link to="/concert-events">
            <Button variant="outline-secondary" className="px-4 py-2 d-flex align-items-center gap-2">
              <FaMusic /> Browse Concerts
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;

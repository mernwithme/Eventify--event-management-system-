import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMusic, FaUsers, FaCompass, FaArrowRight, FaShieldAlt, FaListUl, FaCalendarCheck } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="page-wrapper">
            {/* Hero Section */}
            <section className="bg-white border-bottom py-5" aria-labelledby="hero-heading">
                <Container className="content-container py-5 text-center">
                    <div className="d-inline-flex align-items-center gap-2 mb-3">
                        <span className="badge bg-primary px-3 py-2">
                            Event Management & Discovery
                        </span>
                        <span className="badge bg-light text-muted border">
                            MERN Production Stack
                        </span>
                    </div>

                    <h1 id="hero-heading" className="display-4 fw-bold text-dark mb-4" style={{ letterSpacing: '-0.03em' }}>
                        Organize Gatherings. Discover Live Events.
                    </h1>

                    <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '780px', lineHeight: '1.7' }}>
                        Eventify provides clear, reliable tools for coordinating private gatherings, browsing ticketed concert events in simulated test mode, and finding matched opportunities with multi-signal intelligence.
                    </p>

                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Link to="/opportunities">
                            <Button variant="primary" size="lg" className="px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm">
                                <FaCompass /> Explore Matched Opportunities <FaArrowRight size={14} />
                            </Button>
                        </Link>
                        <Link to="/concert-events">
                            <Button variant="outline-dark" size="lg" className="px-4 py-2 fw-semibold d-flex align-items-center gap-2">
                                <FaMusic /> Browse Concerts
                            </Button>
                        </Link>
                        <Link to="/personal-events">
                            <Button variant="outline-secondary" size="lg" className="px-4 py-2 fw-semibold d-flex align-items-center gap-2">
                                <FaUsers /> Personal Events
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Core Capabilities */}
            <section className="py-5" aria-labelledby="features-heading">
                <Container className="content-container py-4">
                    <div className="text-center mb-5">
                        <h2 id="features-heading" className="h3 fw-bold text-dark mb-2">
                            Core Platform Capabilities
                        </h2>
                        <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
                            Designed for clear organization and verifiable event workflows without clutter.
                        </p>
                    </div>

                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm bg-white">
                                <div className="d-flex align-items-center gap-3 mb-3 text-primary">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                                        <FaCalendarCheck size={24} />
                                    </div>
                                    <h3 className="h5 fw-bold mb-0 text-dark">Real-Time RSVPs</h3>
                                </div>
                                <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                                    Create private events, send invitations, and track attendee confirmations instantly with authenticated user status.
                                </p>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm bg-white">
                                <div className="d-flex align-items-center gap-3 mb-3 text-primary">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                                        <FaCompass size={24} />
                                    </div>
                                    <h3 className="h5 fw-bold mb-0 text-dark">Opportunity Intelligence</h3>
                                </div>
                                <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                                    Deterministic multi-signal recommendation engine that pairs attendees with events using category, interests, format, and budget filters.
                                </p>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm bg-white">
                                <div className="d-flex align-items-center gap-3 mb-3 text-primary">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                                        <FaShieldAlt size={24} />
                                    </div>
                                    <h3 className="h5 fw-bold mb-0 text-dark">Transparent Simulation</h3>
                                </div>
                                <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                                    Concert ticketing and receipt generation operate in an explicit test environment without unauthorized payment deductions.
                                </p>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Platform Sections Breakdown */}
            <section className="py-5 bg-white border-top border-bottom" aria-labelledby="sections-heading">
                <Container className="content-container py-4">
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 id="sections-heading" className="h3 fw-bold text-dark mb-2">
                                Event Modules
                            </h2>
                            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
                                Select the event workflow that matches your organizational or discovery goals.
                            </p>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm">
                                <Card.Body className="d-flex flex-column p-0">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="p-2 bg-light rounded text-primary me-3">
                                            <FaUsers size={24} />
                                        </div>
                                        <div>
                                            <Card.Title as="h3" className="h5 fw-bold mb-0 text-dark">Personal Events</Card.Title>
                                            <small className="text-muted">Private & Group Gatherings</small>
                                        </div>
                                    </div>
                                    <Card.Text className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                                        Ideal for private gatherings, team meetups, and celebrations. Maintain a verified guest list, monitor confirmations, and share direct event links.
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <Link to="/personal-events">
                                            <Button variant="outline-dark" className="w-100 fw-semibold">
                                                Manage Personal Events
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm">
                                <Card.Body className="d-flex flex-column p-0">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="p-2 bg-light rounded text-primary me-3">
                                            <FaMusic size={24} />
                                        </div>
                                        <div>
                                            <Card.Title as="h3" className="h5 fw-bold mb-0 text-dark">Concert Events</Card.Title>
                                            <small className="text-muted">Public & Tiered Ticketing</small>
                                        </div>
                                    </div>
                                    <Card.Text className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                                        Browse live concert listings with tiered seating (Gold, Platinum, Diamond) and execute simulated reservations with instant receipt downloads.
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <Link to="/concert-events">
                                            <Button variant="outline-dark" className="w-100 fw-semibold">
                                                Browse Concert Events
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="h-100 border p-4 shadow-sm border-primary">
                                <Card.Body className="d-flex flex-column p-0">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="p-2 bg-primary bg-opacity-10 rounded text-primary me-3">
                                            <FaCompass size={24} />
                                        </div>
                                        <div>
                                            <Card.Title as="h3" className="h5 fw-bold mb-0 text-dark">Opportunity Intelligence</Card.Title>
                                            <small className="text-primary fw-semibold">Personalized Discovery</small>
                                        </div>
                                    </div>
                                    <Card.Text className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                                        Configure your profile signals to uncover high-affinity events. View scoring breakdowns explaining exactly why each event matches your interests.
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <Link to="/opportunities">
                                            <Button variant="primary" className="w-100 fw-semibold">
                                                Explore Opportunities
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Home;

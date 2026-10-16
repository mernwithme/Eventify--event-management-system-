import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaMapMarkerAlt, 
    FaTicketAlt, 
    FaCheckCircle, 
    FaDownload, 
    FaInfoCircle, 
    FaShieldAlt 
} from 'react-icons/fa';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ConcertEvents = () => {
    const { user } = useContext(AuthContext);
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        pricing: { gold: '', platinum: '', diamond: '' }
    });
    const [bookingDetails, setBookingDetails] = useState({
        ticketCategory: 'gold',
        name: '',
        address: ''
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastPayment, setLastPayment] = useState(null);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const fetchConcerts = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API_URL}/api/concert-events`);
            setConcerts(data);
        } catch (err) {
            console.error('Error fetching concert events:', err);
            setError('Unable to load concert events. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConcerts();
    }, []);

    const openBooking = (concert) => {
        setSelectedConcert(concert);
        setBookingDetails({
            ticketCategory: 'gold',
            name: user?.name || '',
            address: ''
        });
        setShowBookingModal(true);
    };

    const openEdit = (concert) => {
        setFormData({
            name: concert.name,
            location: concert.location,
            description: concert.description,
            pricing: {
                gold: concert.pricing?.gold || '',
                platinum: concert.pricing?.platinum || '',
                diamond: concert.pricing?.diamond || ''
            }
        });
        setEditingId(concert._id);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                ...formData,
                pricing: {
                    gold: Number(formData.pricing.gold),
                    platinum: Number(formData.pricing.platinum),
                    diamond: Number(formData.pricing.diamond)
                }
            };
            if (editingId) {
                await axios.put(`${API_URL}/api/concert-events/${editingId}`, payload, config);
            } else {
                await axios.post(`${API_URL}/api/concert-events`, payload, config);
            }
            setShowModal(false);
            setFormData({ name: '', location: '', description: '', pricing: { gold: '', platinum: '', diamond: '' } });
            setEditingId(null);
            fetchConcerts();
        } catch (err) {
            console.error('Error saving concert:', err);
            alert(err.response?.data?.message || 'Error saving concert event');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this concert event?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/api/concert-events/${id}`, config);
                fetchConcerts();
            } catch (err) {
                console.error('Error deleting concert:', err);
                alert(err.response?.data?.message || 'Error deleting concert event');
            }
        }
    };

    const handlePayment = async () => {
        if (!bookingDetails.name.trim() || !bookingDetails.address.trim()) {
            alert('Please provide your name and address before continuing.');
            return;
        }

        try {
            setSubmittingPayment(true);
            const amount = selectedConcert.pricing[bookingDetails.ticketCategory];
            const payload = {
                concertEventId: selectedConcert._id,
                ticketCategory: bookingDetails.ticketCategory,
                amount,
                customerDetails: {
                    name: bookingDetails.name,
                    address: bookingDetails.address
                }
            };
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/api/payments`, payload, config);

            setLastPayment({ ...payload, eventName: selectedConcert.name, date: new Date().toLocaleDateString() });
            setShowBookingModal(false);
            setShowSuccessModal(true);
            setBookingDetails({ ticketCategory: 'gold', name: '', address: '' });
        } catch (err) {
            console.error('Payment simulation failed:', err);
            alert(err.response?.data?.message || 'Payment simulation failed. Please try again.');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const downloadReceipt = () => {
        if (!lastPayment) return;
        const receiptContent = `================================================
EVENTIFY TICKET RESERVATION RECEIPT
(Test Mode Simulation)
================================================
Event: ${lastPayment.eventName}
Date: ${lastPayment.date}
Attendee: ${lastPayment.customerDetails.name}
Delivery Address: ${lastPayment.customerDetails.address}
Tier: ${lastPayment.ticketCategory.toUpperCase()}
Amount Recorded: INR ${lastPayment.amount}
Transaction Status: Completed (Simulated)
------------------------------------------------
Notice: This receipt is issued in demonstration mode.
Present this confirmation upon arrival at the venue.
================================================`;

        const element = document.createElement('a');
        const file = new Blob([receiptContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Receipt_${lastPayment.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="page-wrapper">
            {/* Header Section */}
            <section className="bg-white border-bottom py-5" aria-labelledby="concerts-heading">
                <Container className="content-container">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <div className="d-inline-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                    Simulated Ticket Desk
                                </span>
                            </div>
                            <h1 id="concerts-heading" className="h2 fw-bold text-dark mb-2">
                                Concert Events
                            </h1>
                            <p className="text-muted mb-0" style={{ maxWidth: '640px' }}>
                                Browse ticketed live events with verified tier pricing. Book test passes with instant receipt generation.
                            </p>
                        </div>
                        {user && (
                            <Button 
                                variant="primary" 
                                className="px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => { 
                                    setEditingId(null); 
                                    setFormData({ name: '', location: '', description: '', pricing: { gold: '', platinum: '', diamond: '' } }); 
                                    setShowModal(true); 
                                }}
                            >
                                <FaPlus /> Create Concert Listing
                            </Button>
                        )}
                    </div>
                </Container>
            </section>

            {/* Concert Listing Grid */}
            <section className="py-5">
                <Container className="content-container">
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Loading concert listings...</p>
                        </div>
                    ) : concerts.length === 0 ? (
                        <Card className="text-center py-5 border-dashed">
                            <Card.Body>
                                <p className="text-muted mb-3">No concert events are currently listed.</p>
                                {user && (
                                    <Button 
                                        variant="outline-primary"
                                        onClick={() => { 
                                            setEditingId(null); 
                                            setFormData({ name: '', location: '', description: '', pricing: { gold: '', platinum: '', diamond: '' } }); 
                                            setShowModal(true); 
                                        }}
                                    >
                                        Create the First Concert Listing
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <Row className="g-4">
                            {concerts.map(concert => (
                                <Col xs={12} md={6} lg={4} key={concert._id}>
                                    <Card className="h-100 border shadow-sm d-flex flex-column">
                                        {/* Card Header with Solid Restrained Slate Palette */}
                                        <div 
                                            className="p-4 border-bottom position-relative" 
                                            style={{ backgroundColor: 'var(--color-surface-muted)' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Badge bg="dark" className="text-uppercase" style={{ letterSpacing: '0.04em' }}>
                                                    Live Event
                                                </Badge>
                                                {user && concert.user && user._id === concert.user._id && (
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            className="p-1 px-2"
                                                            onClick={() => openEdit(concert)}
                                                            title="Edit Concert"
                                                            aria-label="Edit Concert"
                                                        >
                                                            <FaEdit size={13} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="p-1 px-2"
                                                            onClick={() => handleDelete(concert._id)}
                                                            title="Delete Concert"
                                                            aria-label="Delete Concert"
                                                        >
                                                            <FaTrash size={13} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <h2 className="h4 fw-bold text-dark mb-2">
                                                {concert.name}
                                            </h2>
                                            <div className="d-flex align-items-center text-muted small">
                                                <FaMapMarkerAlt className="me-2 text-secondary" size={13} />
                                                <span>{concert.location}</span>
                                            </div>
                                        </div>

                                        <Card.Body className="d-flex flex-column p-4 flex-grow-1">
                                            {/* Description */}
                                            <div className="mb-4">
                                                <h3 className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                                                    Event Overview
                                                </h3>
                                                <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
                                                    {concert.description}
                                                </p>
                                            </div>

                                            {/* Pricing Tiers Table */}
                                            <div className="mb-4">
                                                <h3 className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                                                    Admission Tiers
                                                </h3>
                                                <div className="border rounded bg-light p-2 d-flex flex-column gap-1">
                                                    <div className="d-flex justify-content-between align-items-center px-2 py-1 small">
                                                        <span className="fw-semibold text-muted">Gold</span>
                                                        <span className="fw-bold text-dark">₹{concert.pricing?.gold ?? 0}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center px-2 py-1 small border-top">
                                                        <span className="fw-semibold text-muted">Platinum</span>
                                                        <span className="fw-bold text-dark">₹{concert.pricing?.platinum ?? 0}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center px-2 py-1 small border-top">
                                                        <span className="fw-semibold text-muted">Diamond</span>
                                                        <span className="fw-bold text-dark">₹{concert.pricing?.diamond ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Organizer Info */}
                                            <div className="p-2 px-3 rounded bg-light mb-4 d-flex align-items-center gap-2 border">
                                                <span className="small text-muted">Organizer:</span>
                                                <span className="small fw-semibold text-dark">{concert.user?.name || 'Verified Host'}</span>
                                            </div>

                                            {/* Booking Action */}
                                            <div className="mt-auto">
                                                <Button
                                                    variant="primary"
                                                    className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                                    onClick={() => openBooking(concert)}
                                                >
                                                    <FaTicketAlt /> Book Tickets
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </section>

            {/* Create/Edit Concert Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5 fw-bold">
                            {editingId ? 'Edit Concert Event' : 'Create Concert Listing'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Event Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                required
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="e.g., Annual City Symphony Gala" 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Location / Venue</Form.Label>
                            <Form.Control 
                                type="text" 
                                required
                                value={formData.location} 
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                                placeholder="e.g., Civic Auditorium, Hall 3" 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Event Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                required
                                value={formData.description} 
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                placeholder="Details regarding artist lineup, timing, venue rules, and schedule." 
                            />
                        </Form.Group>
                        <h6 className="fw-bold text-dark mt-4 mb-2">Admission Pricing Tiers (INR)</h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">Gold Tier</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="0"
                                        required
                                        value={formData.pricing.gold} 
                                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, gold: e.target.value } })} 
                                        placeholder="500" 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">Platinum Tier</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="0"
                                        required
                                        value={formData.pricing.platinum} 
                                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, platinum: e.target.value } })} 
                                        placeholder="1200" 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">Diamond Tier</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="0"
                                        required
                                        value={formData.pricing.diamond} 
                                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, diamond: e.target.value } })} 
                                        placeholder="2500" 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingId ? 'Update Listing' : 'Publish Listing'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Booking Modal */}
            <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="h5 fw-bold">
                        Ticket Booking: {selectedConcert?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Alert variant="info" className="d-flex align-items-center gap-2 mb-4 py-2 small">
                        <FaInfoCircle />
                        <span>
                            Test Mode Simulation: Payment gateway integration is configured in simulation mode. No real monetary transactions will occur.
                        </span>
                    </Alert>
                    <Row className="g-4">
                        <Col md={7}>
                            <h6 className="fw-bold mb-3 text-dark">Attendee Details</h6>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold">Admission Tier</Form.Label>
                                    <Form.Select
                                        value={bookingDetails.ticketCategory}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, ticketCategory: e.target.value })}
                                    >
                                        <option value="gold">Gold (₹{selectedConcert?.pricing?.gold})</option>
                                        <option value="platinum">Platinum (₹{selectedConcert?.pricing?.platinum})</option>
                                        <option value="diamond">Diamond (₹{selectedConcert?.pricing?.diamond})</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold">Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Full name for ticket issuance"
                                        value={bookingDetails.name}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold">Billing / Confirmation Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Street, City, Postal Code"
                                        value={bookingDetails.address}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, address: e.target.value })}
                                    />
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col md={5} className="border-start">
                            <h6 className="fw-bold mb-3 text-dark text-center">Simulated Checkout</h6>
                            <div className="bg-light p-3 rounded mb-3 text-center border">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=eventify@upi&pn=Eventify&am=100" 
                                    alt="Test payment simulation QR code" 
                                    className="img-fluid border" 
                                    style={{ width: '130px', height: '130px' }}
                                />
                                <p className="small text-muted mt-2 mb-0">Simulated UPI QR for Sandbox Verification</p>
                            </div>
                            <div className="d-grid gap-2">
                                <div className="text-center mb-2">
                                    <span className="small text-muted d-block">Total Payable (INR)</span>
                                    <span className="h4 fw-bold text-dark">
                                        ₹{selectedConcert && selectedConcert.pricing?.[bookingDetails.ticketCategory]}
                                    </span>
                                </div>
                                <Button 
                                    variant="success" 
                                    size="lg" 
                                    disabled={submittingPayment}
                                    onClick={handlePayment}
                                    className="fw-semibold d-flex align-items-center justify-content-center gap-2"
                                >
                                    <FaCheckCircle /> {submittingPayment ? 'Processing...' : 'Confirm Payment (Simulation)'}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Body className="text-center p-5">
                    <div className="mb-3">
                        <FaCheckCircle className="text-success" size={54} />
                    </div>
                    <h2 className="h4 fw-bold mb-2">Reservation Confirmed</h2>
                    <p className="text-muted small mb-4">
                        Your booking for <strong>{lastPayment?.eventName}</strong> has been registered in the test database.
                    </p>
                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary" 
                            onClick={downloadReceipt}
                            className="d-flex align-items-center justify-content-center gap-2"
                        >
                            <FaDownload /> Download Receipt
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ConcertEvents;

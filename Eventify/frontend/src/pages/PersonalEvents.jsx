import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaEdit, 
    FaTrash, 
    FaWhatsapp, 
    FaInstagram, 
    FaPlus, 
    FaCheck, 
    FaUsers, 
    FaUserCheck 
} from 'react-icons/fa';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PersonalEvents = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        time: '',
        description: ''
    });

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API_URL}/api/personal-events`);
            setEvents(data);
        } catch (err) {
            console.error('Error fetching personal events:', err);
            setError('Unable to load private events. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editingId) {
                await axios.put(`${API_URL}/api/personal-events/${editingId}`, formData, config);
            } else {
                await axios.post(`${API_URL}/api/personal-events`, formData, config);
            }
            setShowModal(false);
            setFormData({ name: '', location: '', time: '', description: '' });
            setEditingId(null);
            fetchEvents();
        } catch (err) {
            console.error('Error saving personal event:', err);
            alert(err.response?.data?.message || 'Error saving personal event');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/api/personal-events/${id}`, config);
                fetchEvents();
            } catch (err) {
                console.error('Error deleting event:', err);
                alert(err.response?.data?.message || 'Error deleting event');
            }
        }
    };

    const handleRSVP = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_URL}/api/personal-events/${id}/rsvp`, {}, config);
            setEvents(events.map(event => event._id === id ? data : event));
        } catch (err) {
            console.error('Error updating RSVP:', err);
            alert(err.response?.data?.message || 'Error updating RSVP');
        }
    };

    const shareEvent = (platform, event) => {
        const text = `Check out this private gathering on Eventify: ${event.name} at ${event.location} on ${event.time}.`;
        let url = '';
        if (platform === 'whatsapp') {
            url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        } else if (platform === 'instagram') {
            url = 'https://instagram.com';
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openEdit = (event) => {
        setFormData({ 
            name: event.name, 
            location: event.location, 
            time: event.time, 
            description: event.description 
        });
        setEditingId(event._id);
        setShowModal(true);
    };

    return (
        <div className="page-wrapper">
            {/* Header Section */}
            <section className="bg-white border-bottom py-5" aria-labelledby="personal-events-heading">
                <Container className="content-container">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <div className="d-inline-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                    Private Gathering Coordination
                                </span>
                            </div>
                            <h1 id="personal-events-heading" className="h2 fw-bold text-dark mb-2">
                                Personal Events
                            </h1>
                            <p className="text-muted mb-0" style={{ maxWidth: '640px' }}>
                                Coordinate private celebrations, team offsites, and meetups with direct RSVP tracking and guest list management.
                            </p>
                        </div>
                        {user && (
                            <Button 
                                variant="primary" 
                                className="px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => { 
                                    setEditingId(null); 
                                    setFormData({ name: '', location: '', time: '', description: '' }); 
                                    setShowModal(true); 
                                }}
                            >
                                <FaPlus /> Create Event
                            </Button>
                        )}
                    </div>
                </Container>
            </section>

            {/* Events Grid */}
            <section className="py-5">
                <Container className="content-container">
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Loading personal events...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <Card className="text-center py-5 border-dashed">
                            <Card.Body>
                                <p className="text-muted mb-3">No personal events have been organized yet.</p>
                                {user && (
                                    <Button 
                                        variant="outline-primary"
                                        onClick={() => { 
                                            setEditingId(null); 
                                            setFormData({ name: '', location: '', time: '', description: '' }); 
                                            setShowModal(true); 
                                        }}
                                    >
                                        Create Your First Private Gathering
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    ) : (
                        <Row className="g-4">
                            {events.map(event => {
                                const isUserGoing = user && event.rsvpUsers && event.rsvpUsers.includes(user._id);
                                const isHost = user && event.user && user._id === event.user._id;

                                return (
                                    <Col xs={12} md={6} lg={4} key={event._id}>
                                        <Card className="h-100 border shadow-sm d-flex flex-column">
                                            {/* Header with Restrained Slate Theme (No Purple Gradients) */}
                                            <div 
                                                className="p-4 border-bottom position-relative" 
                                                style={{ backgroundColor: 'var(--color-surface-muted)' }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <Badge bg="secondary" className="text-uppercase" style={{ letterSpacing: '0.04em' }}>
                                                        Private Gathering
                                                    </Badge>
                                                    {isHost && (
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="p-1 px-2"
                                                                onClick={() => openEdit(event)}
                                                                title="Edit Event"
                                                                aria-label="Edit Event"
                                                            >
                                                                <FaEdit size={13} />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="p-1 px-2"
                                                                onClick={() => handleDelete(event._id)}
                                                                title="Delete Event"
                                                                aria-label="Delete Event"
                                                            >
                                                                <FaTrash size={13} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className="h4 fw-bold text-dark mb-2">
                                                    {event.name}
                                                </h2>

                                                <div className="d-flex flex-column gap-1 text-muted small">
                                                    <div className="d-flex align-items-center">
                                                        <FaCalendarAlt className="me-2 text-secondary" size={13} />
                                                        <span>{event.time}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <FaMapMarkerAlt className="me-2 text-secondary" size={13} />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Card.Body className="d-flex flex-column p-4 flex-grow-1">
                                                {/* Description */}
                                                <div className="mb-4">
                                                    <h3 className="small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                                                        About Gathering
                                                    </h3>
                                                    <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
                                                        {event.description}
                                                    </p>
                                                </div>

                                                {/* Host Info */}
                                                <div className="p-2 px-3 rounded bg-light mb-4 d-flex align-items-center gap-2 border">
                                                    <span className="small text-muted">Host:</span>
                                                    <span className="small fw-semibold text-dark">{event.user?.name || 'Verified Member'}</span>
                                                </div>

                                                {/* RSVP Status and Action */}
                                                <div className="mt-auto pt-3 border-top">
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaUsers className="text-muted" size={14} />
                                                            <span className="small text-muted fw-semibold">
                                                                {event.rsvpUsers ? event.rsvpUsers.length : 0} {event.rsvpUsers?.length === 1 ? 'attendee confirmed' : 'attendees confirmed'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-grid mb-3">
                                                        <Button
                                                            variant={isUserGoing ? 'success' : 'outline-primary'}
                                                            className="fw-semibold d-flex align-items-center justify-content-center gap-2"
                                                            onClick={() => handleRSVP(event._id)}
                                                        >
                                                            {isUserGoing ? (
                                                                <>
                                                                    <FaCheck /> Attending Confirmed
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaUserCheck /> Confirm Attendance (RSVP)
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* Share Utilities */}
                                                    <div className="d-flex align-items-center justify-content-between pt-2">
                                                        <span className="small text-muted">Share invite:</span>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="px-2 py-1 small d-flex align-items-center gap-1"
                                                                onClick={() => shareEvent('whatsapp', event)}
                                                                title="Share via WhatsApp"
                                                            >
                                                                <FaWhatsapp className="text-success" /> WhatsApp
                                                            </Button>
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="px-2 py-1 small d-flex align-items-center gap-1"
                                                                onClick={() => shareEvent('instagram', event)}
                                                                title="Share via Instagram"
                                                            >
                                                                <FaInstagram className="text-danger" /> Instagram
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Container>
            </section>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5 fw-bold">
                            {editingId ? 'Edit Event Details' : 'Create Private Gathering'}
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
                                placeholder="e.g., Annual Design Team Retrospective" 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Location / Address</Form.Label>
                            <Form.Control 
                                type="text" 
                                required
                                value={formData.location} 
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                                placeholder="e.g., Downtown Innovation Hub, Floor 4" 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Date and Time</Form.Label>
                            <Form.Control 
                                type="text" 
                                required
                                value={formData.time} 
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                                placeholder="e.g., October 24, 2026 at 6:30 PM" 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Description & Logistics</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                required
                                value={formData.description} 
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                placeholder="Details regarding agenda, access instructions, and host contact." 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingId ? 'Update Event' : 'Create Event'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default PersonalEvents;

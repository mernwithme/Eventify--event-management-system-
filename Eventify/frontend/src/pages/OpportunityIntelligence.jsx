import { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import { 
    FaSlidersH, 
    FaFilter, 
    FaRedo, 
    FaGlobe, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaArrowRight, 
    FaCheck, 
    FaCompass 
} from 'react-icons/fa';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import PreferenceModal from '../components/PreferenceModal';
import ExplanationModal from '../components/ExplanationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All', 'Music', 'Technology', 'Art', 'Business', 'Workshop', 'Conference', 'Social'];

const OpportunityIntelligence = () => {
    const { user } = useContext(AuthContext);

    const [opportunities, setOpportunities] = useState([]);
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [formatFilter, setFormatFilter] = useState('all'); // 'all', 'online', 'in-person'
    const [budgetFilter, setBudgetFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Modals
    const [showPrefModal, setShowPrefModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [showExplainModal, setShowExplainModal] = useState(false);

    // Fetch user preferences
    const fetchPreferences = useCallback(async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/api/auth/preferences`, config);
            if (data.success) {
                setPreferences(data.preferences);
            }
        } catch (err) {
            console.error('Failed to load preferences:', err);
        }
    }, [user?.token]);

    // Fetch recommendations
    const fetchRecommendations = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        setError('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const params = new URLSearchParams();
            if (selectedCategory !== 'All') params.append('category', selectedCategory);
            if (formatFilter === 'online') params.append('isOnline', 'true');
            if (formatFilter === 'in-person') params.append('isOnline', 'false');
            if (budgetFilter && !isNaN(Number(budgetFilter))) params.append('maxBudget', budgetFilter);
            params.append('page', currentPage);
            params.append('limit', 9);

            const { data } = await axios.get(`${API_URL}/api/opportunities/recommended?${params.toString()}`, config);
            if (data.success) {
                setOpportunities(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotalResults(data.total || 0);
            }
        } catch (err) {
            console.error('Failed to load recommendations:', err);
            setError(err.response?.data?.message || 'Could not load recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user?.token, selectedCategory, formatFilter, budgetFilter, currentPage]);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Save preferences from modal
    const handleSavePreferences = async (updatedPrefs) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.patch(`${API_URL}/api/auth/preferences`, updatedPrefs, config);
        if (data.success) {
            setPreferences(data.preferences);
            setCurrentPage(1);
            fetchRecommendations();
        }
    };

    const handleExplain = (opp) => {
        setSelectedOpportunity(opp);
        setShowExplainModal(true);
    };

    const handleResetFilters = () => {
        setSelectedCategory('All');
        setFormatFilter('all');
        setBudgetFilter('');
        setCurrentPage(1);
    };

    return (
        <div className="page-wrapper">
            {/* Hero Header Section */}
            <section className="bg-white border-bottom py-5" aria-labelledby="opp-heading">
                <Container className="content-container">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <div className="d-inline-flex align-items-center gap-2 mb-2">
                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                                    Multi-Signal Matching Engine
                                </span>
                            </div>
                            <h1 id="opp-heading" className="h2 fw-bold text-dark mb-2">
                                Opportunity Intelligence
                            </h1>
                            <p className="text-muted mb-0" style={{ maxWidth: '680px' }}>
                                Transparent, deterministic event matching based on explicit user interests, verified skills, preferred location, and budget constraints.
                            </p>
                        </div>
                        <Button
                            variant="outline-primary"
                            className="px-4 py-2 d-flex align-items-center gap-2 fw-semibold"
                            onClick={() => setShowPrefModal(true)}
                        >
                            <FaSlidersH /> Configure Signals
                        </Button>
                    </div>
                </Container>
            </section>

            <section className="py-5">
                <Container className="content-container">
                    {/* Active User Preference Signals Summary */}
                    <Card className="border shadow-sm mb-4">
                        <Card.Body className="p-3 px-4">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                <div>
                                    <div className="small text-secondary text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.04em' }}>
                                        Active Profile Constraints
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        {preferences?.interests && preferences.interests.length > 0 ? (
                                            preferences.interests.slice(0, 5).map(item => (
                                                <Badge key={item} bg="light" text="dark" className="border fw-semibold">
                                                    #{item}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="small text-muted">No custom interest tags set</span>
                                        )}

                                        {preferences?.preferredLocation && (
                                            <Badge bg="light" text="secondary" className="border d-flex align-items-center gap-1">
                                                <FaMapMarkerAlt size={10} /> {preferences.preferredLocation}
                                            </Badge>
                                        )}

                                        {preferences?.maxBudget !== null && preferences?.maxBudget !== undefined && (
                                            <Badge bg="light" text="success" className="border d-flex align-items-center gap-1">
                                                <FaMoneyBillWave size={10} /> Max ₹{preferences.maxBudget}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setShowPrefModal(true)}
                                >
                                    Edit Signals
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Filter Controls Toolbar */}
                    <Card className="border shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <Row className="g-3 align-items-end">
                                <Col md={4}>
                                    <Form.Label className="small text-muted fw-bold mb-1">Event Category</Form.Label>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col md={3}>
                                    <Form.Label className="small text-muted fw-bold mb-1">Attendance Format</Form.Label>
                                    <Form.Select
                                        value={formatFilter}
                                        onChange={(e) => { setFormatFilter(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="all">All Formats</option>
                                        <option value="in-person">In-Person Only</option>
                                        <option value="online">Online / Virtual Only</option>
                                    </Form.Select>
                                </Col>

                                <Col md={3}>
                                    <Form.Label className="small text-muted fw-bold mb-1">Max Budget (INR)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Optional max fee"
                                        value={budgetFilter}
                                        onChange={(e) => { setBudgetFilter(e.target.value); setCurrentPage(1); }}
                                    />
                                </Col>

                                <Col md={2}>
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleResetFilters}
                                    >
                                        <FaRedo size={12} /> Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Results Overview */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <h2 className="h5 fw-bold text-dark mb-0">
                            Ranked Opportunities ({totalResults})
                        </h2>
                        <span className="small text-muted">
                            Ordered deterministically by transparent match score
                        </span>
                    </div>

                    {/* Grid of Results */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
                            <p className="text-muted mt-3 small">Computing recommendation weights...</p>
                        </div>
                    ) : error ? (
                        <Card className="text-center p-5 border">
                            <Alert variant="danger" className="mb-4">{error}</Alert>
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" onClick={fetchRecommendations}>
                                    <FaRedo className="me-2" /> Retry
                                </Button>
                            </div>
                        </Card>
                    ) : opportunities.length === 0 ? (
                        <Card className="text-center p-5 border">
                            <Card.Body>
                                <h3 className="h5 fw-bold text-dark mb-2">No Matching Opportunities Found</h3>
                                <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '540px' }}>
                                    No active events match the selected category and filter constraints. Adjust your filter values or update your profile signals.
                                </p>
                                <div className="d-flex justify-content-center gap-2">
                                    <Button variant="outline-secondary" onClick={handleResetFilters}>
                                        Reset Filters
                                    </Button>
                                    <Button variant="primary" onClick={() => setShowPrefModal(true)}>
                                        Update Preferences
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <Row className="g-4 mb-5">
                                {opportunities.map(item => (
                                    <Col xs={12} md={6} lg={4} key={item.event._id}>
                                        <OpportunityCard
                                            opportunity={item}
                                            onExplain={handleExplain}
                                        />
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-3 py-1 small text-muted align-self-center">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>

            {/* Preferences Modal */}
            <PreferenceModal
                show={showPrefModal}
                onHide={() => setShowPrefModal(false)}
                preferences={preferences}
                onSave={handleSavePreferences}
            />

            {/* Explanation Modal */}
            <ExplanationModal
                show={showExplainModal}
                onHide={() => setShowExplainModal(false)}
                opportunity={selectedOpportunity}
            />
        </div>
    );
};

export default OpportunityIntelligence;

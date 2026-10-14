import { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Alert, Badge, Pagination } from 'react-bootstrap';
import { FaSlidersH, FaFilter, FaRedo, FaGlobe, FaMapMarkerAlt, FaHeart, FaTools, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';
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
            <div className="full-width-section" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
                <div className="content-container">

                    {/* Hero Header */}
                    <div className="text-center mb-5">
                        <span className="badge border border-info text-info bg-transparent rounded-pill px-3 py-2 mb-3 fw-bold shadow-sm">
                            🎯 Opportunity Intelligence
                        </span>
                        <h1 className="display-4 fw-bold text-white mb-3">
                            Personalized Discovery Tailored to You
                        </h1>
                        <p className="text-light-custom fs-5 mx-auto" style={{ maxWidth: '750px', opacity: 0.9 }}>
                            Our transparent, multi-signal recommendation algorithm analyzes your interests, skills, location, and budget to connect you with events where you'll thrive.
                        </p>
                    </div>

                    {/* User Preferences Summary Bar */}
                    <div className="glass-card p-4 mb-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <div>
                                    <div className="small text-muted text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Active Profile Signals</div>
                                    <div className="d-flex flex-wrap gap-2 align-items-center mt-1">
                                        {preferences?.interests && preferences.interests.length > 0 ? (
                                            preferences.interests.slice(0, 4).map(item => (
                                                <Badge key={item} bg="primary" className="fw-normal rounded-pill">#{item}</Badge>
                                            ))
                                        ) : (
                                            <span className="small text-light-custom">No interests configured yet</span>
                                        )}

                                        {preferences?.preferredLocation && (
                                            <Badge bg="success" className="fw-normal rounded-pill d-flex align-items-center gap-1">
                                                <FaMapMarkerAlt size={10} /> {preferences.preferredLocation}
                                            </Badge>
                                        )}

                                        {preferences?.maxBudget !== null && preferences?.maxBudget !== undefined && (
                                            <Badge bg="danger" className="fw-normal rounded-pill d-flex align-items-center gap-1">
                                                <FaMoneyBillWave size={10} /> ≤ ₹{preferences.maxBudget}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline-light"
                                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                                onClick={() => setShowPrefModal(true)}
                            >
                                <FaSlidersH /> Customize Preferences
                            </Button>
                        </div>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="glass-card p-4 mb-5">
                        <Row className="g-3 align-items-center">
                            <Col md={4}>
                                <Form.Label className="small text-muted fw-bold mb-1">Category</Form.Label>
                                <Form.Select
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                                    className="bg-dark text-white border-secondary"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="small text-muted fw-bold mb-1">Format</Form.Label>
                                <Form.Select
                                    value={formatFilter}
                                    onChange={(e) => { setFormatFilter(e.target.value); setCurrentPage(1); }}
                                    className="bg-dark text-white border-secondary"
                                >
                                    <option value="all">All Formats</option>
                                    <option value="in-person">In-Person Only</option>
                                    <option value="online">Online / Virtual Only</option>
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="small text-muted fw-bold mb-1">Max Budget (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Filter by price..."
                                    value={budgetFilter}
                                    onChange={(e) => { setBudgetFilter(e.target.value); setCurrentPage(1); }}
                                    className="bg-dark text-white border-secondary"
                                />
                            </Col>

                            <Col md={2} className="d-flex align-items-end">
                                <Button
                                    variant="outline-secondary"
                                    className="w-100 rounded-pill text-white border-secondary d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleResetFilters}
                                >
                                    <FaRedo size={12} /> Reset
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* Content Section: Loading, Error, Empty, or Cards */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="text-light-custom mt-3">Evaluating personalized opportunities...</p>
                        </div>
                    ) : error ? (
                        <div className="glass-card p-5 text-center">
                            <Alert variant="danger" className="mb-4">{error}</Alert>
                            <Button variant="primary" className="rounded-pill px-4" onClick={fetchRecommendations}>
                                <FaRedo className="me-2" /> Retry
                            </Button>
                        </div>
                    ) : opportunities.length === 0 ? (
                        <div className="glass-card p-5 text-center">
                            <h3 className="fw-bold text-white mb-3">No Matching Opportunities Found</h3>
                            <p className="text-light-custom mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                                No upcoming public events match your active filter criteria. Try expanding your search filters or refining your preferences.
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button variant="outline-light" className="rounded-pill px-4" onClick={handleResetFilters}>
                                    Reset Filters
                                </Button>
                                <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowPrefModal(true)}>
                                    Edit Preferences
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-white mb-0">
                                    Recommended For You ({totalResults})
                                </h4>
                                <span className="small text-muted">
                                    Ranked deterministically by multi-factor score
                                </span>
                            </div>

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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination className="glass-pagination">
                                        <Pagination.Prev
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        />
                                        {[...Array(totalPages).keys()].map(idx => (
                                            <Pagination.Item
                                                key={idx + 1}
                                                active={idx + 1 === currentPage}
                                                onClick={() => setCurrentPage(idx + 1)}
                                            >
                                                {idx + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Modals */}
            <PreferenceModal
                show={showPrefModal}
                onHide={() => setShowPrefModal(false)}
                preferences={preferences}
                onSave={handleSavePreferences}
            />

            <ExplanationModal
                show={showExplainModal}
                onHide={() => setShowExplainModal(false)}
                opportunity={selectedOpportunity}
            />
        </div>
    );
};

export default OpportunityIntelligence;

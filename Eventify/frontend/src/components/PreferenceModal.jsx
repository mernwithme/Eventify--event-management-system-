import { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaHeart, FaTools, FaMapMarkerAlt, FaMoneyBillWave, FaLaptop, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const SUGGESTED_INTERESTS = ['Rock', 'Jazz', 'EDM', 'Pop', 'Indie', 'Coding', 'AI', 'Startups', 'Design', 'Photography', 'Gaming'];
const SUGGESTED_SKILLS = ['JavaScript', 'React', 'Python', 'Guitar', 'Singing', 'Public Speaking', 'Marketing', 'Networking'];
const CATEGORY_OPTIONS = ['Music', 'Technology', 'Art', 'Business', 'Workshop', 'Conference', 'Social', 'Other'];

const PreferenceModal = ({ show, onHide, preferences, onSave }) => {
    const [interests, setInterests] = useState(preferences?.interests || []);
    const [skills, setSkills] = useState(preferences?.skills || []);
    const [preferredCategories, setPreferredCategories] = useState(preferences?.preferredCategories || []);
    const [preferredLocation, setPreferredLocation] = useState(preferences?.preferredLocation || '');
    const [maxBudget, setMaxBudget] = useState(preferences?.maxBudget !== null && preferences?.maxBudget !== undefined ? preferences.maxBudget : '');
    const [allowOnline, setAllowOnline] = useState(preferences?.allowOnline !== false);

    const [interestInput, setInterestInput] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleAddInterest = (item) => {
        const val = (item || interestInput).trim().toLowerCase();
        if (val && !interests.includes(val) && interests.length < 30) {
            setInterests([...interests, val]);
            setInterestInput('');
        }
    };

    const handleRemoveInterest = (item) => {
        setInterests(interests.filter(i => i !== item));
    };

    const handleAddSkill = (item) => {
        const val = (item || skillInput).trim().toLowerCase();
        if (val && !skills.includes(val) && skills.length < 30) {
            setSkills([...skills, val]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (item) => {
        setSkills(skills.filter(s => s !== item));
    };

    const toggleCategory = (cat) => {
        if (preferredCategories.includes(cat)) {
            setPreferredCategories(preferredCategories.filter(c => c !== cat));
        } else {
            if (preferredCategories.length < 20) {
                setPreferredCategories([...preferredCategories, cat]);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            interests,
            skills,
            preferredCategories,
            preferredLocation: preferredLocation.trim(),
            maxBudget: maxBudget !== '' ? Number(maxBudget) : null,
            allowOnline
        };

        try {
            await onSave(payload);
            onHide();
        } catch (err) {
            setError(err.message || 'Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className="h5 fw-bold text-dark">
                        Configure Match Preferences
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Interests Section */}
                    <div className="mb-4">
                        <Form.Label className="fw-semibold text-dark mb-1">
                            Interests and Passion Tags
                        </Form.Label>
                        <p className="small text-muted mb-2">
                            Events matching your tags receive higher relevance weighting in recommendations.
                        </p>
                        <div className="d-flex gap-2 mb-2">
                            <Form.Control
                                type="text"
                                placeholder="e.g. Rock, Coding, Indie, Startups"
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                            />
                            <Button 
                                variant="outline-primary" 
                                type="button" 
                                onClick={() => handleAddInterest()}
                                className="d-flex align-items-center gap-1"
                            >
                                <FaPlus size={11} /> Add
                            </Button>
                        </div>
                        {interests.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-2">
                                {interests.map(item => (
                                    <Badge 
                                        key={item} 
                                        bg="primary" 
                                        className="p-2 d-inline-flex align-items-center gap-2"
                                    >
                                        #{item}
                                        <FaTimes 
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => handleRemoveInterest(item)} 
                                            title="Remove tag" 
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="d-flex flex-wrap gap-1 align-items-center mt-2">
                            <span className="small text-muted me-1">Suggestions:</span>
                            {SUGGESTED_INTERESTS.filter(s => !interests.includes(s.toLowerCase())).map(item => (
                                <Button
                                    key={item}
                                    variant="outline-secondary"
                                    size="sm"
                                    className="py-0 px-2"
                                    style={{ fontSize: '0.8rem' }}
                                    onClick={() => handleAddInterest(item)}
                                >
                                    +{item}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Skills Section */}
                    <div className="mb-4">
                        <Form.Label className="fw-semibold text-dark mb-1">
                            Skills & Capabilities
                        </Form.Label>
                        <p className="small text-muted mb-2">
                            Add technical or creative skills to match relevant conferences, hackathons, or workshops.
                        </p>
                        <div className="d-flex gap-2 mb-2">
                            <Form.Control
                                type="text"
                                placeholder="e.g. JavaScript, Public Speaking, Guitar"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                            />
                            <Button 
                                variant="outline-primary" 
                                type="button" 
                                onClick={() => handleAddSkill()}
                                className="d-flex align-items-center gap-1"
                            >
                                <FaPlus size={11} /> Add
                            </Button>
                        </div>
                        {skills.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-2">
                                {skills.map(item => (
                                    <Badge 
                                        key={item} 
                                        bg="secondary" 
                                        className="p-2 d-inline-flex align-items-center gap-2"
                                    >
                                        {item}
                                        <FaTimes 
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => handleRemoveSkill(item)} 
                                            title="Remove skill" 
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="d-flex flex-wrap gap-1 align-items-center mt-2">
                            <span className="small text-muted me-1">Suggestions:</span>
                            {SUGGESTED_SKILLS.filter(s => !skills.includes(s.toLowerCase())).map(item => (
                                <Button
                                    key={item}
                                    variant="outline-secondary"
                                    size="sm"
                                    className="py-0 px-2"
                                    style={{ fontSize: '0.8rem' }}
                                    onClick={() => handleAddSkill(item)}
                                >
                                    +{item}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Preferred Categories */}
                    <div className="mb-4">
                        <Form.Label className="fw-semibold text-dark mb-1">
                            Preferred Event Categories
                        </Form.Label>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {CATEGORY_OPTIONS.map(cat => {
                                const selected = preferredCategories.includes(cat);
                                return (
                                    <Button
                                        key={cat}
                                        variant={selected ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => toggleCategory(cat)}
                                    >
                                        {cat}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Location & Budget Row */}
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold text-dark mb-1">
                                    Base Location
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="City or Metropolitan Area (e.g., Mumbai, NY)"
                                    value={preferredLocation}
                                    onChange={(e) => setPreferredLocation(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold text-dark mb-1">
                                    Maximum Budget Ceiling (INR)
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 2000"
                                    value={maxBudget}
                                    onChange={(e) => setMaxBudget(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Online Events Checkbox */}
                    <div className="mt-4 pt-2">
                        <Form.Check
                            type="checkbox"
                            id="allow-online-events"
                            label="Include virtual / online events regardless of physical location"
                            checked={allowOnline}
                            onChange={(e) => setAllowOnline(e.target.checked)}
                            className="text-dark small"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PreferenceModal;

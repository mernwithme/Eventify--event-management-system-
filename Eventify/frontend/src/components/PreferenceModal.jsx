import { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaHeart, FaTools, FaMapMarkerAlt, FaMoneyBillWave, FaLaptop, FaSave } from 'react-icons/fa';

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
        <Modal show={show} onHide={onHide} centered size="lg" className="opportunity-modal">
            <Modal.Header closeButton className="border-0 bg-dark text-white">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <span>✨ Customize Your Opportunity Preferences</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white p-4">
                {error && <div className="alert alert-danger">{error}</div>}
                <Form onSubmit={handleSubmit}>
                    {/* Interests Section */}
                    <div className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 text-info">
                            <FaHeart /> Interests & Passion Tags
                        </Form.Label>
                        <div className="d-flex gap-2 mb-2">
                            <Form.Control
                                type="text"
                                placeholder="e.g. Rock, Coding, Indie, Startups (press Add)"
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                                className="bg-dark text-white border-secondary"
                            />
                            <Button variant="outline-info" onClick={() => handleAddInterest()} type="button">
                                Add
                            </Button>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                            {interests.map(item => (
                                <Badge key={item} bg="primary" className="p-2 d-flex align-items-center gap-2 rounded-pill">
                                    <span>#{item}</span>
                                    <span style={{ cursor: 'pointer' }} onClick={() => handleRemoveInterest(item)}>✕</span>
                                </Badge>
                            ))}
                        </div>
                        <div className="small text-muted mb-1">Quick suggestions:</div>
                        <div className="d-flex flex-wrap gap-1">
                            {SUGGESTED_INTERESTS.filter(s => !interests.includes(s.toLowerCase())).slice(0, 8).map(s => (
                                <Badge
                                    key={s}
                                    bg="secondary"
                                    className="p-1 px-2 rounded-pill"
                                    style={{ cursor: 'pointer', opacity: 0.8 }}
                                    onClick={() => handleAddInterest(s)}
                                >
                                    + {s}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 text-warning">
                            <FaTools /> Skills & Proficiencies
                        </Form.Label>
                        <div className="d-flex gap-2 mb-2">
                            <Form.Control
                                type="text"
                                placeholder="e.g. JavaScript, Guitar, Photography, Public Speaking"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                                className="bg-dark text-white border-secondary"
                            />
                            <Button variant="outline-warning" onClick={() => handleAddSkill()} type="button">
                                Add
                            </Button>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                            {skills.map(item => (
                                <Badge key={item} bg="warning" text="dark" className="p-2 d-flex align-items-center gap-2 rounded-pill">
                                    <span>{item}</span>
                                    <span style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(item)}>✕</span>
                                </Badge>
                            ))}
                        </div>
                        <div className="small text-muted mb-1">Quick suggestions:</div>
                        <div className="d-flex flex-wrap gap-1">
                            {SUGGESTED_SKILLS.filter(s => !skills.includes(s.toLowerCase())).slice(0, 8).map(s => (
                                <Badge
                                    key={s}
                                    bg="secondary"
                                    className="p-1 px-2 rounded-pill"
                                    style={{ cursor: 'pointer', opacity: 0.8 }}
                                    onClick={() => handleAddSkill(s)}
                                >
                                    + {s}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Categories */}
                    <div className="mb-4">
                        <Form.Label className="fw-bold text-light-custom">Preferred Event Categories</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map(cat => {
                                const selected = preferredCategories.includes(cat);
                                return (
                                    <Button
                                        key={cat}
                                        type="button"
                                        size="sm"
                                        variant={selected ? 'primary' : 'outline-secondary'}
                                        className="rounded-pill px-3"
                                        onClick={() => toggleCategory(cat)}
                                    >
                                        {cat} {selected && '✓'}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <Row>
                        {/* Preferred Location */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex align-items-center gap-2 text-success">
                                    <FaMapMarkerAlt /> Preferred City / Location
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Bangalore, Mumbai, New York"
                                    value={preferredLocation}
                                    onChange={(e) => setPreferredLocation(e.target.value)}
                                    className="bg-dark text-white border-secondary"
                                />
                            </Form.Group>
                        </Col>

                        {/* Max Budget */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex align-items-center gap-2 text-danger">
                                    <FaMoneyBillWave /> Maximum Budget (₹)
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 1500 (leave blank for any)"
                                    value={maxBudget}
                                    onChange={(e) => setMaxBudget(e.target.value)}
                                    className="bg-dark text-white border-secondary"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Online Events Preference */}
                    <div className="mb-4 p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <Form.Check
                            type="switch"
                            id="allow-online-switch"
                            label={
                                <span className="d-flex align-items-center gap-2">
                                    <FaLaptop className="text-info" /> Include Online & Virtual Events in Recommendations
                                </span>
                            }
                            checked={allowOnline}
                            onChange={(e) => setAllowOnline(e.target.checked)}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary">
                        <Button variant="outline-light" onClick={onHide} type="button" className="rounded-pill px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving} className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2">
                            <FaSave /> {saving ? 'Saving...' : 'Save & Update Matches'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default PreferenceModal;

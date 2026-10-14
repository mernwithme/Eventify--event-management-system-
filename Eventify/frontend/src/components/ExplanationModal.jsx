import { Modal, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FaCheckCircle, FaInfoCircle, FaTag, FaTools, FaMapMarkerAlt, FaMoneyBillWave, FaGlobe } from 'react-icons/fa';

const ExplanationModal = ({ show, onHide, opportunity }) => {
    if (!opportunity) return null;

    const { event, matchScore, scoreBreakdown, reasons, matchedInterests, matchedSkills, budgetCompatibility } = opportunity;

    const getScoreBadgeColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'primary';
        return 'warning';
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="opportunity-modal">
            <Modal.Header closeButton className="border-0 bg-dark text-white">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <FaInfoCircle className="text-info" />
                    <span>Match Intelligence: {event?.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white p-4">
                {/* Overall Score Banner */}
                <div className="glass-card p-4 text-center mb-4" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                        <span className="display-4 fw-bold text-white">{matchScore}%</span>
                        <Badge bg={getScoreBadgeColor(matchScore)} className="fs-6 px-3 py-2 rounded-pill">
                            {matchScore >= 80 ? 'Exceptional Match' : matchScore >= 60 ? 'Strong Match' : 'Potential Fit'}
                        </Badge>
                    </div>
                    <p className="text-light-custom mb-0" style={{ opacity: 0.85 }}>
                        This match score is transparently calculated based on your profile preferences and verified event data.
                    </p>
                </div>

                {/* Score Breakdown Bars */}
                {scoreBreakdown && (
                    <div className="mb-4">
                        <h6 className="fw-bold mb-3 text-uppercase text-light-custom" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
                            Scoring Breakdown (100 Points Model)
                        </h6>
                        <div className="d-flex flex-column gap-3">
                            <div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span><FaTag className="me-1 text-primary" /> Category Match ({event?.category || 'Music'})</span>
                                    <span className="fw-bold">{scoreBreakdown.category} / 25 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.category / 25) * 100} variant="primary" style={{ height: '6px' }} />
                            </div>

                            <div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span><FaTag className="me-1 text-info" /> Interests & Tags Overlap</span>
                                    <span className="fw-bold">{scoreBreakdown.interests} / 25 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.interests / 25) * 100} variant="info" style={{ height: '6px' }} />
                            </div>

                            <div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span><FaTools className="me-1 text-warning" /> Skills Alignment</span>
                                    <span className="fw-bold">{scoreBreakdown.skills} / 20 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.skills / 20) * 100} variant="warning" style={{ height: '6px' }} />
                            </div>

                            <div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span><FaMapMarkerAlt className="me-1 text-success" /> Location & Format Relevance</span>
                                    <span className="fw-bold">{scoreBreakdown.location} / 15 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.location / 15) * 100} variant="success" style={{ height: '6px' }} />
                            </div>

                            <div>
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span><FaMoneyBillWave className="me-1 text-danger" /> Budget Affordability</span>
                                    <span className="fw-bold">{scoreBreakdown.budget} / 15 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.budget / 15) * 100} variant="danger" style={{ height: '6px' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Match Reasons */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-uppercase text-light-custom" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
                        Why We Recommend This
                    </h6>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {reasons && reasons.map((reason, idx) => (
                            <li key={idx} className="d-flex align-items-start gap-2 small">
                                <FaCheckCircle className="text-success mt-1 flex-shrink-0" />
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Matched Tags / Skills Pills */}
                {((matchedInterests && matchedInterests.length > 0) || (matchedSkills && matchedSkills.length > 0)) && (
                    <div className="mb-4 p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                        {matchedInterests && matchedInterests.length > 0 && (
                            <div className="mb-2">
                                <span className="small text-muted me-2">Matched Interests:</span>
                                {matchedInterests.map((interest, i) => (
                                    <Badge key={i} bg="primary" className="me-1 mb-1 fw-normal">
                                        #{interest}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {matchedSkills && matchedSkills.length > 0 && (
                            <div>
                                <span className="small text-muted me-2">Matched Skills:</span>
                                {matchedSkills.map((skill, i) => (
                                    <Badge key={i} bg="warning" text="dark" className="me-1 mb-1 fw-normal">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Budget Details */}
                {budgetCompatibility && (
                    <div className="p-3 rounded mb-2" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="small text-muted">Budget Analysis</div>
                                <div className="fw-bold">{budgetCompatibility.notes}</div>
                            </div>
                            <Badge bg={budgetCompatibility.isAffordable ? 'success' : 'secondary'} className="px-3 py-2">
                                {budgetCompatibility.isAffordable ? '✓ Budget Friendly' : 'Tier Notice'}
                            </Badge>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 bg-dark">
                <Button variant="outline-light" onClick={onHide} className="rounded-pill px-4">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExplanationModal;

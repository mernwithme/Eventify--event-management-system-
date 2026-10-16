import { Modal, Button, Badge, ProgressBar } from 'react-bootstrap';
import { 
    FaCheckCircle, 
    FaInfoCircle, 
    FaTag, 
    FaTools, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaCheck 
} from 'react-icons/fa';

const ExplanationModal = ({ show, onHide, opportunity }) => {
    if (!opportunity) return null;

    const { event, matchScore, scoreBreakdown, reasons, matchedInterests, matchedSkills, budgetCompatibility } = opportunity;

    const getScoreBadgeColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'primary';
        return 'secondary';
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
                    <FaInfoCircle className="text-primary" />
                    <span>Match Intelligence: {event?.name}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Overall Score Header Banner */}
                <div className="p-4 text-center mb-4 bg-light rounded border">
                    <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                        <span className="display-5 fw-bold text-dark">{matchScore}%</span>
                        <Badge bg={getScoreBadgeColor(matchScore)} className="fs-6 px-3 py-2">
                            {matchScore >= 80 ? 'Exceptional Fit' : matchScore >= 60 ? 'Strong Fit' : 'Potential Fit'}
                        </Badge>
                    </div>
                    <p className="text-muted small mb-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        This match score is calculated deterministically from your explicit profile constraints and verified event metadata.
                    </p>
                </div>

                {/* Score Breakdown Bars */}
                {scoreBreakdown && (
                    <div className="mb-4">
                        <h6 className="fw-bold mb-3 text-uppercase text-secondary small" style={{ letterSpacing: '0.04em' }}>
                            Scoring Breakdown (100 Points Model)
                        </h6>
                        <div className="d-flex flex-column gap-3">
                            <div className="p-2 px-3 border rounded bg-white">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="fw-semibold text-dark">
                                        <FaTag className="me-2 text-primary" /> Category Match ({event?.category || 'General'})
                                    </span>
                                    <span className="fw-bold text-dark">{scoreBreakdown.category} / 25 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.category / 25) * 100} variant="primary" style={{ height: '6px' }} />
                            </div>

                            <div className="p-2 px-3 border rounded bg-white">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="fw-semibold text-dark">
                                        <FaTag className="me-2 text-primary" /> Interest & Tag Overlap
                                    </span>
                                    <span className="fw-bold text-dark">{scoreBreakdown.interests} / 25 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.interests / 25) * 100} variant="primary" style={{ height: '6px' }} />
                            </div>

                            <div className="p-2 px-3 border rounded bg-white">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="fw-semibold text-dark">
                                        <FaTools className="me-2 text-secondary" /> Skills Alignment
                                    </span>
                                    <span className="fw-bold text-dark">{scoreBreakdown.skills} / 20 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.skills / 20) * 100} variant="secondary" style={{ height: '6px' }} />
                            </div>

                            <div className="p-2 px-3 border rounded bg-white">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="fw-semibold text-dark">
                                        <FaMapMarkerAlt className="me-2 text-secondary" /> Location & Format Relevance
                                    </span>
                                    <span className="fw-bold text-dark">{scoreBreakdown.location} / 15 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.location / 15) * 100} variant="info" style={{ height: '6px' }} />
                            </div>

                            <div className="p-2 px-3 border rounded bg-white">
                                <div className="d-flex justify-content-between mb-1 small">
                                    <span className="fw-semibold text-dark">
                                        <FaMoneyBillWave className="me-2 text-success" /> Budget Affordability
                                    </span>
                                    <span className="fw-bold text-dark">{scoreBreakdown.budget} / 15 pts</span>
                                </div>
                                <ProgressBar now={(scoreBreakdown.budget / 15) * 100} variant="success" style={{ height: '6px' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Match Reasons */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-uppercase text-secondary small" style={{ letterSpacing: '0.04em' }}>
                        Specific Match Explanations
                    </h6>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {reasons && reasons.map((reason, idx) => (
                            <li key={idx} className="d-flex align-items-start gap-2 small p-2 rounded bg-light border">
                                <FaCheckCircle className="text-success mt-1 flex-shrink-0" />
                                <span className="text-dark">{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Matched Tags / Skills Pills */}
                {((matchedInterests && matchedInterests.length > 0) || (matchedSkills && matchedSkills.length > 0)) && (
                    <div className="mb-4 p-3 rounded bg-light border">
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
                                    <Badge key={i} bg="secondary" className="me-1 mb-1 fw-normal">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Budget Details */}
                {budgetCompatibility && (
                    <div className="p-3 rounded mb-2 bg-light border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="small text-muted">Budget Analysis</div>
                                <div className="fw-bold text-dark">{budgetCompatibility.notes}</div>
                            </div>
                            <Badge bg={budgetCompatibility.isAffordable ? 'success' : 'secondary'} className="px-3 py-2">
                                {budgetCompatibility.isAffordable ? (
                                    <>
                                        <FaCheck className="me-1" /> Within Budget
                                    </>
                                ) : (
                                    'Tier Notice'
                                )}
                            </Badge>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExplanationModal;

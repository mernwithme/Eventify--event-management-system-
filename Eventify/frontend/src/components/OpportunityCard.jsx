import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaGlobe, FaTicketAlt, FaInfoCircle, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const OpportunityCard = ({ opportunity, onExplain }) => {
    const { event, matchScore, reasons, matchedInterests, matchedSkills, budgetCompatibility } = opportunity;

    const getScoreBadgeProps = (score) => {
        if (score >= 80) {
            return {
                bg: 'success',
                label: 'Strong Fit'
            };
        }
        if (score >= 60) {
            return {
                bg: 'primary',
                label: 'Matched'
            };
        }
        return {
            bg: 'secondary',
            label: 'Potential Fit'
        };
    };

    const badgeProps = getScoreBadgeProps(matchScore);

    return (
        <Card className="h-100 border shadow-sm d-flex flex-column">
            {/* Restrained Slate Header without Gradients */}
            <div 
                className="p-4 border-bottom position-relative" 
                style={{ backgroundColor: 'var(--color-surface-muted)' }}
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="dark" className="text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.75rem' }}>
                        {event?.category || 'General'}
                    </Badge>
                    <Badge 
                        bg={badgeProps.bg}
                        className="fw-bold" 
                        style={{ fontSize: '0.85rem' }}
                    >
                        {matchScore}% Match
                    </Badge>
                </div>

                <h3 className="h5 fw-bold text-dark mb-2">
                    {event?.name}
                </h3>

                <div className="d-flex align-items-center text-muted small gap-3 flex-wrap">
                    <span className="d-flex align-items-center gap-1">
                        {event?.isOnline ? <FaGlobe className="text-primary" /> : <FaMapMarkerAlt className="text-secondary" />}
                        <span>{event?.isOnline ? 'Virtual Event' : (event?.location || 'Venue TBA')}</span>
                    </span>
                    {event?.eventDate && (
                        <span className="d-flex align-items-center gap-1">
                            <FaCalendarAlt className="text-secondary" />
                            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                        </span>
                    )}
                </div>
            </div>

            <Card.Body className="d-flex flex-column p-4 flex-grow-1">
                {/* Description snippet */}
                <p className="text-dark small mb-3" style={{ lineHeight: '1.6', minHeight: '44px' }}>
                    {event?.description}
                </p>

                {/* Match Highlights */}
                <div className="p-3 rounded mb-3 bg-light border">
                    <div className="small fw-bold text-dark mb-1 d-flex align-items-center gap-1">
                        <FaCheck className="text-primary" size={11} /> Signal Alignment
                    </div>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                        {reasons && reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="small text-muted d-flex align-items-start gap-1" style={{ fontSize: '0.8rem' }}>
                                <span>•</span> <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Matched tags */}
                {((matchedInterests && matchedInterests.length > 0) || (matchedSkills && matchedSkills.length > 0)) && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                        {matchedInterests && matchedInterests.slice(0, 3).map((item, i) => (
                            <Badge key={i} bg="light" text="dark" className="border fw-semibold" style={{ fontSize: '0.75rem' }}>
                                #{item}
                            </Badge>
                        ))}
                        {matchedSkills && matchedSkills.slice(0, 2).map((item, i) => (
                            <Badge key={i} bg="light" text="primary" className="border fw-semibold" style={{ fontSize: '0.75rem' }}>
                                {item}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Pricing & Budget Section */}
                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>STARTING TIER</div>
                        <div className="h6 fw-bold text-dark mb-0">
                            {budgetCompatibility?.minPrice !== null && budgetCompatibility?.minPrice !== undefined ? (
                                `₹${budgetCompatibility.minPrice}`
                            ) : (
                                'Admission at Door'
                            )}
                        </div>
                    </div>
                    {budgetCompatibility?.isAffordable && (
                        <Badge bg="success" className="px-2 py-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                            <FaCheck className="me-1" size={10} /> In Budget
                        </Badge>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-50 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => onExplain(opportunity)}
                    >
                        <FaInfoCircle /> Breakdown
                    </Button>
                    <Link to="/concert-events" className="w-50 text-decoration-none">
                        <Button variant="primary" size="sm" className="w-100 d-flex align-items-center justify-content-center gap-1">
                            <FaTicketAlt /> Book
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default OpportunityCard;

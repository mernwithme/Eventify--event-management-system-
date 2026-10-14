import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaGlobe, FaTicketAlt, FaInfoCircle, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const OpportunityCard = ({ opportunity, onExplain }) => {
    const { event, matchScore, reasons, matchedInterests, matchedSkills, budgetCompatibility } = opportunity;

    const getScoreBadgeStyle = (score) => {
        if (score >= 80) {
            return {
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                label: 'High Match'
            };
        }
        if (score >= 60) {
            return {
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                label: 'Great Match'
            };
        }
        return {
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            label: 'Potential Fit'
        };
    };

    const badgeStyle = getScoreBadgeStyle(matchScore);

    return (
        <Card className="h-100 light-glass-card border-0 shadow-lg overflow-hidden hover-lift d-flex flex-column" style={{ transition: 'all 0.3s ease' }}>
            {/* Header with Match Score */}
            <div className="position-relative p-4" style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: 'white'
            }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
                        {event?.category || 'Music'}
                    </Badge>
                    <div
                        className="px-3 py-1 rounded-pill text-white fw-bold shadow-sm d-flex align-items-center gap-1"
                        style={{
                            background: badgeStyle.background,
                            fontSize: '0.85rem'
                        }}
                    >
                        <span>{matchScore}% Match</span>
                    </div>
                </div>

                <h3 className="h5 fw-bold text-white mb-2" style={{ lineHeight: '1.3' }}>
                    {event?.name}
                </h3>

                <div className="d-flex align-items-center text-light small gap-3">
                    <span className="d-flex align-items-center gap-1">
                        {event?.isOnline ? <FaGlobe className="text-info" /> : <FaMapMarkerAlt className="text-danger" />}
                        <span>{event?.isOnline ? 'Online / Virtual' : (event?.location || 'Venue TBA')}</span>
                    </span>
                    {event?.eventDate && (
                        <span className="d-flex align-items-center gap-1">
                            <FaCalendarAlt className="text-warning" />
                            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                        </span>
                    )}
                </div>
            </div>

            <Card.Body className="d-flex flex-column p-4">
                {/* Description snippet */}
                <p className="text-dark small mb-3 text-truncate-2" style={{ minHeight: '40px', lineHeight: '1.5' }}>
                    {event?.description}
                </p>

                {/* Match Highlights */}
                <div className="p-3 rounded mb-3" style={{ background: 'rgba(99, 102, 241, 0.08)', borderLeft: '3px solid #6366F1' }}>
                    <div className="small fw-bold text-primary mb-1 d-flex align-items-center gap-1">
                        <FaCheck size={12} /> Match Highlights
                    </div>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                        {reasons && reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="small text-dark d-flex align-items-start gap-1" style={{ fontSize: '0.8rem' }}>
                                <span>•</span> <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Matched tags pills */}
                {((matchedInterests && matchedInterests.length > 0) || (matchedSkills && matchedSkills.length > 0)) && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                        {matchedInterests && matchedInterests.slice(0, 3).map((item, i) => (
                            <Badge key={i} bg="primary" className="fw-normal" style={{ fontSize: '0.75rem' }}>
                                #{item}
                            </Badge>
                        ))}
                        {matchedSkills && matchedSkills.slice(0, 2).map((item, i) => (
                            <Badge key={i} bg="warning" text="dark" className="fw-normal" style={{ fontSize: '0.75rem' }}>
                                {item}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Pricing & Budget Section */}
                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>STARTING AT</div>
                        <div className="h5 fw-bold text-dark mb-0">
                            {budgetCompatibility?.minPrice !== null && budgetCompatibility?.minPrice !== undefined ? (
                                `₹${budgetCompatibility.minPrice}`
                            ) : (
                                'Check Tiers'
                            )}
                        </div>
                    </div>
                    {budgetCompatibility?.isAffordable && (
                        <Badge bg="success" className="px-2 py-1 rounded-pill fw-normal" style={{ fontSize: '0.75rem' }}>
                            ✓ In Budget
                        </Badge>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-dark"
                        size="sm"
                        className="w-50 rounded-pill d-flex align-items-center justify-content-center gap-1"
                        onClick={() => onExplain(opportunity)}
                    >
                        <FaInfoCircle /> Why Match?
                    </Button>
                    <Link to="/concert-events" className="w-50 text-decoration-none">
                        <Button variant="primary" size="sm" className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-1">
                            <FaTicketAlt /> Book
                        </Button>
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
};

export default OpportunityCard;

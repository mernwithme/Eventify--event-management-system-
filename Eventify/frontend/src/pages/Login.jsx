import { useState, useContext, useEffect, useRef } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaEnvelope, FaArrowLeft, FaRedo, FaCheckCircle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Login = () => {
    // Step: 'credentials' or 'otp'
    const [step, setStep] = useState('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [devOtp, setDevOtp] = useState(null);
    const [timer, setTimer] = useState(60);
    const [resendLoading, setResendLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const inputRefs = useRef([]);
    const { login, verifyLoginOtp, resendLoginOtp } = useContext(AuthContext);
    const navigate = useNavigate();

    // Timer effect for Resend OTP countdown
    useEffect(() => {
        let interval = null;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, timer]);

    // Auto-focus first OTP input when entering OTP step
    useEffect(() => {
        if (step === 'otp') {
            const firstInput = inputRefs.current[0];
            if (firstInput) {
                firstInput.focus();
            }
        }
    }, [step]);

    // Handle credential submission
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await login(email, password);
            if (res.otpRequired) {
                setStep('otp');
                setTimer(60);
                setOtp(['', '', '', '', '', '']);
                if (res.devOtp) {
                    setDevOtp(res.devOtp);
                }
                setSuccessMessage(res.message || 'Verification code sent to your email.');
            } else if (res.success) {
                navigate('/personal-events');
            } else {
                setError(res.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handle single OTP digit change
    const handleOtpChange = (index, value) => {
        // Only accept numbers
        const cleaned = value.replace(/[^0-9]/g, '');
        if (!cleaned && value !== '') return;

        const newOtp = [...otp];
        newOtp[index] = cleaned.slice(-1); // Take last character entered
        setOtp(newOtp);

        // Move focus forward if digit entered
        if (cleaned && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle key navigation (Backspace, Left, Right)
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste event across all 6 inputs
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
        if (!pasted) return;

        const digits = pasted.slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, idx) => {
            newOtp[idx] = digit;
        });
        setOtp(newOtp);

        const targetFocusIndex = Math.min(digits.length, 5);
        inputRefs.current[targetFocusIndex]?.focus();
    };

    // Handle OTP verification submission
    const handleOtpSubmit = async (e) => {
        if (e) e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter all 6 digits of your verification code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await verifyLoginOtp(email, code);
            if (res.success) {
                navigate('/personal-events');
            } else {
                setError(res.message || 'Verification failed. Please check the code.');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (timer > 0 || resendLoading) return;

        setResendLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await resendLoginOtp(email);
            if (res.success) {
                setTimer(60);
                setOtp(['', '', '', '', '', '']);
                if (res.devOtp) {
                    setDevOtp(res.devOtp);
                }
                setSuccessMessage(res.message || 'A new code has been sent to your email.');
                inputRefs.current[0]?.focus();
            } else {
                setError(res.message || 'Could not resend code. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Could not resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // Auto-fill dev OTP for quick local testing
    const handleAutoFillDevOtp = () => {
        if (devOtp && devOtp.length === 6) {
            const digits = devOtp.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
        }
    };

    // Switch back to credentials step
    const handleBackToLogin = () => {
        setStep('credentials');
        setError('');
        setSuccessMessage('');
        setOtp(['', '', '', '', '', '']);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh' }}>
            <div className="glass-card p-4 p-md-5" style={{ width: '100%', maxWidth: '440px', borderRadius: '12px' }}>
                {step === 'credentials' ? (
                    <>
                        <div className="text-center mb-4">
                            <h2 className="fw-bold mb-2">Welcome Back</h2>
                            <p className="text-muted small">Sign in to manage your events and registrations</p>
                        </div>

                        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                        <Form onSubmit={handleCredentialsSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label className="small fw-semibold text-secondary">Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" animation="border" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    'Continue with OTP'
                                )}
                            </Button>
                        </Form>

                        <div className="mt-4 text-center text-muted small">
                            New to Eventify?{' '}
                            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                                Register
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="btn btn-link p-0 text-muted small text-decoration-none d-inline-flex align-items-center gap-1 mb-3"
                        >
                            <FaArrowLeft size={12} /> Back to email & password
                        </button>

                        <div className="text-center mb-4">
                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                            >
                                <FaShieldAlt size={26} />
                            </div>
                            <h3 className="fw-bold mb-1">Verify Your Identity</h3>
                            <p className="text-muted small mb-0">
                                Enter the 6-digit verification code sent to
                            </p>
                            <p className="fw-semibold text-dark small mb-0 text-break">
                                {email}
                            </p>
                        </div>

                        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                        {successMessage && <Alert variant="success" className="py-2 small d-flex align-items-center gap-2">
                            <FaCheckCircle className="flex-shrink-0" />
                            <span>{successMessage}</span>
                        </Alert>}

                        {/* Local development hint if SMTP credentials are absent */}
                        {devOtp && (
                            <div className="p-3 mb-3 rounded border border-warning-subtle bg-light small">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-dark">🔑 Dev Mode OTP Code:</span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="py-0 px-2 font-monospace"
                                        style={{ fontSize: '11px' }}
                                        onClick={handleAutoFillDevOtp}
                                    >
                                        Auto-Fill
                                    </Button>
                                </div>
                                <code className="fw-bold fs-6 text-primary">{devOtp}</code>
                                <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                                    (SMTP email sending is not configured in .env; code is displayed for testing)
                                </div>
                            </div>
                        )}

                        <Form onSubmit={handleOtpSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-secondary text-center w-100 mb-2">
                                    6-Digit Verification Code
                                </label>
                                <div
                                    className="d-flex justify-content-between gap-2"
                                    onPaste={handleOtpPaste}
                                >
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (inputRefs.current[idx] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e.target)}
                                            disabled={loading}
                                            className="form-control text-center fw-bold fs-5 px-0"
                                            style={{
                                                width: '48px',
                                                height: '52px',
                                                borderRadius: '8px',
                                                borderColor: digit ? 'var(--color-primary)' : 'var(--color-border)',
                                                backgroundColor: digit ? 'var(--color-primary-subtle)' : '#ffffff'
                                            }}
                                            aria-label={`Digit ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                                disabled={loading || otp.join('').length < 6}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" animation="border" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    'Verify & Log In'
                                )}
                            </Button>
                        </Form>

                        <div className="text-center pt-2 border-top">
                            {timer > 0 ? (
                                <p className="text-muted small mb-0">
                                    Resend code in <span className="fw-semibold text-dark">{timer}s</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-link text-primary fw-semibold small p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                                    onClick={handleResendOtp}
                                    disabled={resendLoading}
                                >
                                    <FaRedo size={12} className={resendLoading ? 'fa-spin' : ''} />
                                    {resendLoading ? 'Resending...' : 'Resend verification code'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Container>
    );
};

export default Login;

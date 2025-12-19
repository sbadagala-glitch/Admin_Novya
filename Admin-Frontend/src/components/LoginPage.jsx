import React, { useState, useEffect } from 'react';
import {
  Form, Button, Card, Container, InputGroup, Modal, Toast, ToastContainer,
} from 'react-bootstrap';
import { FaUser, FaLock, FaSignInAlt, FaEnvelope, FaKey, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPasswordResetFields, setShowPasswordResetFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', variant: '' });

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Novya - Your Smart Learning Platform";

    // Only clear auth when user intentionally arrived at the login root path.
    // Prevents clearing during quick route transitions that cause redirect loops.
    if (window.location.pathname === "/") {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, []);

  // Strong Password Validation Function
  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) return "Password must be at least 8 characters long.";
    if (!uppercase.test(password)) return "Password must contain at least one uppercase letter.";
    if (!lowercase.test(password)) return "Password must contain at least one lowercase letter.";
    if (!number.test(password)) return "Password must contain at least one number.";
    if (!specialChar.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  // Login with FastAPI Backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (accountLocked) {
      setToast({ show: true, message: "❌ Account locked due to multiple failed attempts!", variant: "danger" });
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setToast({ show: true, message: "❌ Please enter both email and password", variant: "danger" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('profileName', `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim());
        localStorage.setItem('profileEmail', data.user.email || '');
        localStorage.setItem('lastLogin', new Date().toLocaleString());

        setFailedAttempts(0);
        setToast({ show: true, message: "✅ Login Successful!", variant: "success" });

        setTimeout(() => {
          // Navigate to dashboard after success
          navigate('/dashboard');
        }, 800);
      } else {
        throw new Error(data.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setFailedAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setAccountLocked(true);
          setToast({ show: true, message: "❌ Too many failed attempts. Account locked!", variant: "danger" });
        } else {
          setToast({ show: true, message: `❌ ${error.message}`, variant: "danger" });
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Flow with Backend
  const sendResetLink = async () => {
    if (!resetEmail) {
      setToast({ show: true, message: "❌ Please enter your email address", variant: "danger" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetLinkSent(true);
        setToast({ show: true, message: `✅ ${data.message}`, variant: "success" });
        // For demo, show reset fields directly
        setTimeout(() => {
          setShowPasswordResetFields(true);
          setResetLinkSent(false);
          // In real app, you'd get the token from email
          setResetToken('demo-reset-token-12345');
        }, 1200);
      } else {
        throw new Error(data.detail || 'Failed to send reset link');
      }
    } catch (error) {
      setToast({ show: true, message: `❌ ${error.message}`, variant: "danger" });
    }
  };

  const resetPassword = async () => {
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setToast({ show: true, message: `❌ ${validationError}`, variant: "danger" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ show: true, message: "❌ Passwords do not match", variant: "danger" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ show: true, message: "✅ Password Reset Successful", variant: "success" });
        handleModalClose();
      } else {
        throw new Error(data.detail || 'Password reset failed');
      }
    } catch (error) {
      setToast({ show: true, message: `❌ ${error.message}`, variant: "danger" });
    }
  };

  const handleModalClose = () => {
    setShowResetModal(false);
    setResetEmail('');
    setShowPasswordResetFields(false);
    setNewPassword('');
    setConfirmPassword('');
    setResetLinkSent(false);
    setResetToken('');
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#e3f2fd' }}>
      <Container className="px-3">
        <Card className="login-card animated-card shadow mx-auto"
          style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
          <div className="text-center mb-4 mt-3">
            <img src="/NOVYA LOGO (1).png" alt="NOVYA Logo"
              style={{ width: '80px', height: '80px', borderRadius: '30px' }} />
            <h4 className="mt-2" style={{
              background: 'linear-gradient(90deg, #6D0DAD, #C316A4, #F02D6D, #FF5E52, #FF8547)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              Admin Login
            </h4>
          </div>

          <Card.Body>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email"
                    required 
                    disabled={isLoading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login <FaSignInAlt className="ms-2" />
                  </>
                )}
              </Button>

              <div className="d-flex justify-content-between mt-3">
                <Button variant="link" size="sm" onClick={() => setShowResetModal(true)}>
                  Forgot Password?
                </Button>
                <Link to="/signup" className="text-decoration-none">
                  <Button variant="outline-primary" size="sm">
                    Create Account <FaUserPlus className="ms-1" />
                  </Button>
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Toast Notifications */}
      <ToastContainer position="top-center" className="p-3">
        <Toast bg={toast.variant} show={toast.show} delay={3000} autohide onClose={() => setToast({ ...toast, show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Reset Password Modal */}
      <Modal show={showResetModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton><Modal.Title>Reset Password</Modal.Title></Modal.Header>
        <Modal.Body>
          {!resetLinkSent && !showPasswordResetFields && (
            <>
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    placeholder="Enter your registered email"
                  />
                </InputGroup>
              </Form.Group>
              <Button className="mt-3 w-100" variant="primary" onClick={sendResetLink}>
                Send Reset Link
              </Button>
            </>
          )}

          {resetLinkSent && (
            <div className="text-center">
              <p>✅ Reset link sent to your email. Please check your inbox.</p>
            </div>
          )}

          {showPasswordResetFields && (
            <>
              <p className="text-muted">Enter your new password below:</p>
              <Form.Group className="mt-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaKey /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaKey /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <Button className="mt-3 w-100" variant="success" onClick={resetPassword}>
                Reset Password
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={handleModalClose}>Close</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;

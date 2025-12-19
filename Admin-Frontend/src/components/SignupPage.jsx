import React, { useState, useEffect } from 'react';
import {
  Form, Button, Card, Container, InputGroup, Modal, Toast, ToastContainer,
} from 'react-bootstrap';
import { FaUser, FaLock, FaSignInAlt, FaEnvelope, FaKey, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up | Novya - Your Smart Learning Platform";
  }, []);

  // ✅ Strong Password Validation Function
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

  // ✅ Handle Signup with FastAPI Backend
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation checks
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setToast({ show: true, message: "❌ Please fill in all fields", variant: "danger" });
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setToast({ show: true, message: "❌ Please agree to the Terms and Conditions", variant: "danger" });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ show: true, message: "❌ Please enter a valid email address", variant: "danger" });
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (passwordValidation) {
      setToast({ show: true, message: `❌ ${passwordValidation}`, variant: "danger" });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ show: true, message: "❌ Passwords do not match", variant: "danger" });
      setIsLoading(false);
      return;
    }

    try {
      // Send registration data to FastAPI backend
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, now auto-login
        await handleAutoLogin(formData.email, formData.password);
      } else {
        throw new Error(data.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setToast({ 
        show: true, 
        message: `❌ ${error.message || 'Registration failed. Please try again.'}`, 
        variant: "danger" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto-login after successful registration
  const handleAutoLogin = async (email, password) => {
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
        localStorage.setItem('profileName', `${formData.firstName} ${formData.lastName}`);
        localStorage.setItem('profileEmail', formData.email);
        localStorage.setItem('lastLogin', new Date().toLocaleString());

        setToast({ 
          show: true, 
          message: "✅ Account created successfully! Redirecting...", 
          variant: "success" 
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.detail || 'Auto-login failed');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setToast({ 
        show: true, 
        message: "✅ Account created! Please login manually.", 
        variant: "warning" 
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#e3f2fd' }}>
      <Container className="px-3">
        <Card className="login-card animated-card shadow mx-auto"
          style={{ maxWidth: '450px', width: '100%', borderRadius: '1rem' }}>
          <div className="text-center mb-4 mt-3">
            <img src="/NOVYA LOGO (1).png" alt="NOVYA Logo"
              style={{ width: '80px', height: '80px', borderRadius: '30px' }} />
            <h4 className="mt-2" style={{
              background: 'linear-gradient(90deg, #6D0DAD, #C316A4, #F02D6D, #FF5E52, #FF8547)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              Create Admin Account
            </h4>
            <p className="text-muted">Join Novya Admin Portal</p>
          </div>

          <Card.Body>
            <Form onSubmit={handleSignup}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaUser /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                        disabled={isLoading}
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><FaUser /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                        disabled={isLoading}
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    required
                    disabled={isLoading}
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
                <Form.Text className="text-muted">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password *</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaKey /></InputGroup.Text>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer" }}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={
                    <span>
                      I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); setToast({ show: true, message: "Terms and Conditions modal would open here", variant: "info" }); }}>Terms and Conditions</a> and <a href="#privacy" onClick={(e) => { e.preventDefault(); setToast({ show: true, message: "Privacy Policy modal would open here", variant: "info" }); }}>Privacy Policy</a>
                    </span>
                  }
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <FaUserPlus className="ms-2" />
                  </>
                )}
              </Button>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/" className="text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* ✅ Toast Notifications */}
      <ToastContainer position="top-center" className="p-3">
        <Toast bg={toast.variant} show={toast.show} delay={4000} autohide onClose={() => setToast({ ...toast, show: false })}>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default SignupPage;
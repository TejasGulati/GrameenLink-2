import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Briefcase, MapPin, Phone, X } from 'lucide-react';

const Register = () => {
  const { register, user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'retailer',
    phone: '',
    location: '',
    company: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!formData.phone.trim() && formData.user_type !== 'farmer') errors.phone = 'Phone number is required';
    if (!formData.location.trim()) errors.location = 'Location is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Clean up the form data - convert empty strings to null for numeric fields
      const cleanedData = { ...formData };
      if (cleanedData.latitude === '') cleanedData.latitude = null;
      if (cleanedData.longitude === '') cleanedData.longitude = null;
      
      // Register the user but don't automatically authenticate
      await register(cleanedData);
      
      // Set registration success flag
      setRegistrationSuccess(true);
      
      // Redirect to login page after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const backendErrors = {};
      
      if (typeof error === 'object') {
        // Process structured errors from the backend
        Object.entries(error).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages) ? messages.join(' ') : messages;
        });
      } else {
        // Handle string or other error types
        backendErrors.general = error.toString();
      }
      
      setFormErrors(backendErrors);
      setRegistrationSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getError = (field) => formErrors[field] || null;

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="container mx-auto px-5 w-full max-w-7xl py-16 md:py-24">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Join GrameenLink Network</h2>
            <p className="text-gray-600">Create your account and start growing your business</p>
          </div>
          
          {registrationSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
              <p>Registration successful! Redirecting you to login...</p>
            </div>
          )}
          
          {Object.keys(formErrors).length > 0 && !registrationSuccess && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="space-y-1">
                  {Object.entries(formErrors).map(([field, message]) => (
                    <p key={field} className="text-sm">
                      {field === 'general' ? '' : `${field.replace(/_/g, ' ')}: `}{message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Full Name*
                </label>
                <input
                  className={`w-full px-4 py-3 bg-gray-50 border ${getError('name') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address*
                </label>
                <input
                  className={`w-full px-4 py-3 bg-gray-50 border ${getError('email') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password*
                </label>
                <input
                  className={`w-full px-4 py-3 bg-gray-50 border ${getError('password') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="user_type">
                  Account Type*
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                >
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                  <option value="farmer">Farmer</option>
                  <option value="node">Node Operator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-500" />
                    Phone Number{formData.user_type !== 'farmer' ? '*' : ''}
                  </span>
                </label>
                <input
                  className={`w-full px-4 py-3 bg-gray-50 border ${getError('phone') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                    Location*
                  </span>
                </label>
                <input
                  className={`w-full px-4 py-3 bg-gray-50 border ${getError('location') ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="company">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-gray-500" />
                  Business/Company Name
                </span>
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                Full Address
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="latitude">
                  Latitude (optional)
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="longitude">
                  Longitude (optional)
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              className={`w-full mt-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isLoading || registrationSuccess}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : registrationSuccess ? (
                'Registration Successful'
              ) : (
                <>
                  Register <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
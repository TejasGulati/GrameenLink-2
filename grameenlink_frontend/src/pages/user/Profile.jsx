import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, Lock, Save, X, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    company: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        company: user.company || '',
        address: user.address || '',
        latitude: user.latitude || '',
        longitude: user.longitude || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user modifies field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim() && user?.user_type !== 'farmer') {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await updateUserProfile({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setSuccess('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsPasswordEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || 
           error?.response?.data?.[fieldName]?.join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-emerald-600 px-6 py-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-white">{user?.name || 'User Profile'}</h1>
            <p className="text-emerald-100 mt-1 capitalize">{user?.user_type}</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-4 mx-6 mt-6 rounded">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                <p className="text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(error || Object.values(validationErrors).some(Boolean)) && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-6 rounded">
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="space-y-1">
                  {/* Display general errors */}
                  {error && <p className="text-sm">{error}</p>}
                  {/* Display field-specific errors */}
                  {Object.entries(formData).map(([field]) => (
                    getFieldError(field) && (
                      <p key={field} className="text-sm">
                        {field.charAt(0).toUpperCase() + field.slice(1)}: {getFieldError(field)}
                      </p>
                    )
                  ))}
                  {/* Password errors */}
                  {Object.entries(passwordData).map(([field]) => (
                    getFieldError(field) && (
                      <p key={field} className="text-sm">
                        {field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: {getFieldError(field)}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      Full Name*
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('name') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email Address*
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('email') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-500" />
                        Phone Number{user?.user_type !== 'farmer' ? '*' : ''}
                      </span>
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('phone') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Location Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                        Location*
                      </span>
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('location') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Company Field */}
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

                {/* Address Field */}
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
                  {/* Latitude Field */}
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

                  {/* Longitude Field */}
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

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition flex items-center ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">{user?.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-800">{user?.location || '-'}</p>
                  </div>
                </div>

                {user?.company && (
                  <div className="flex items-start">
                    <Briefcase className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-gray-800">{user.company}</p>
                    </div>
                  </div>
                )}

                {user?.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-800">{user.address}</p>
                    </div>
                  </div>
                )}

                {(user?.latitude || user?.longitude) && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Coordinates</p>
                      <p className="text-gray-800">
                        {user.latitude && user.longitude 
                          ? `${parseFloat(user.latitude).toFixed(6)}, ${parseFloat(user.longitude).toFixed(6)}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Password</h2>
              {!isPasswordEditing && (
                <button
                  onClick={() => setIsPasswordEditing(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Change Password
                </button>
              )}
            </div>

            {isPasswordEditing ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current_password">
                    Current Password*
                  </label>
                  <input
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      getFieldError('current_password') ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                    id="current_password"
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new_password">
                      New Password*
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('new_password') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="new_password"
                      name="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm_password">
                      Confirm Password*
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        getFieldError('confirm_password') ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition`}
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPasswordEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition flex items-center ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    ) : (
                      <Lock className="w-4 h-4 mr-1" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-500 mr-3" />
                <p className="text-gray-800">Password last changed: {user?.last_password_change || 'Unknown'}</p>
              </div>
            )}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 px-6 py-8 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
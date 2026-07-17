import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector(state => state.auth);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update Redux state
      dispatch({
        type: 'SET_USER',
        payload: data.user
      });

      setSuccess(true);
      setIsEditMode(false);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess(true);
      setShowPasswordModal(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setError(null);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading) {
    return (
      <div className="profile-settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-settings-container">
        <div className="error-message">
          No user data available. Please log in.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p className="subtitle">Manage your account information</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button 
              className="alert-close" 
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>Profile updated successfully!</span>
            <button 
              className="alert-close" 
              onClick={() => setSuccess(false)}
            >
              ×
            </button>
          </div>
        )}

        {!isEditMode ? (
          <div className="profile-view-mode">
            <div className="profile-section">
              <div className="profile-field">
                <label className="field-label">Full Name</label>
                <p className="field-value">{formData.name}</p>
              </div>

              <div className="profile-field">
                <label className="field-label">Email Address</label>
                <p className="field-value">{formData.email}</p>
              </div>

              <div className="profile-field">
                <label className="field-label">Registration Date</label>
                <p className="field-value">{formatDate(user.createdAt)}</p>
              </div>

              <div className="profile-field">
                <label className="field-label">Account Status</label>
                <p className="field-value">
                  <span className="status-badge active">Active</span>
                </p>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="profile-edit-form">
            <div className="profile-field">
              <label htmlFor="name" className="field-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email" className="field-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="profile-field">
              <label className="field-label">Registration Date</label>
              <p className="field-value" style={{ marginTop: '8px' }}>
                {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="profile-actions">
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-field">
                <label htmlFor="currentPassword" className="field-label">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="newPassword" className="field-label">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your new password (min 8 characters)"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword" className="field-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
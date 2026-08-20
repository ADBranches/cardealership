// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { authenticatedApiRequest } from '../api/client';

const Admin: React.FC = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout, accessToken } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        navigate('/');
        return;
      }
    } catch (e) {
      navigate('/login');
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      if (!accessToken) return;
      const response = await authenticatedApiRequest('/api/admin/stats', accessToken);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ fontSize: '20px', color: '#4b5563' }}>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <nav style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
          Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Cars</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalCars}</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Users</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{stats.totalUsers}</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Bookings</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9333ea' }}>{stats.totalBookings}</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Pending Bookings</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ea580c' }}>{stats.pendingBookings}</p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Admin Panel</h2>
          <p style={{ color: '#4b5563', marginBottom: '24px' }}>
            Welcome to the admin dashboard. Here you can manage your dealership.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer'
            }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>?? Manage Cars</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                Add, edit, or remove vehicles
              </p>
            </div>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer'
            }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>?? Manage Bookings</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                View and manage test drive bookings
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/Admin/chat')}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: 'white',
                textAlign: 'left'
              }}
            >
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>Customer Inbox</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                Review customer vehicle inquiries
              </p>
            </button>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer'
            }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>?? View Reports</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                View sales and analytics reports
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            marginTop: '32px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Recent Activity</h3>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
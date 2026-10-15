// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, pendingRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`),
        fetch(`${API_URL}/admin/pending-approvals`),
        fetch(`${API_URL}/admin/bookings`)
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (pendingData.success) setPending(pendingData);
      if (bookingsData.success) setBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Booking ${status} successfully!`);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const approveCar = async (carId: number) => {
    try {
      const response = await fetch(`${API_URL}/admin/cars/${carId}/approve`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (data.success) {
        alert('Car approved!');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error approving car:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <nav style={{ backgroundColor: 'white', padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/')} style={{ backgroundColor: '#6b7280', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Back to Site
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ backgroundColor: 'white', padding: '0 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {['overview', 'pending', 'bookings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 8px',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #2563eb' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'pending' ? `Pending Approvals (${pending?.totalPending || 0})` : tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard title="Total Cars" value={stats.cars.total} color="#2563eb" />
              <StatCard title="Available" value={stats.cars.available} color="#16a34a" />
              <StatCard title="Total Users" value={stats.users.total} color="#9333ea" />
              <StatCard title="Total Bookings" value={stats.bookings.total} color="#ea580c" />
              <StatCard title="Pending" value={stats.bookings.pending} color="#dc2626" />
              <StatCard title="Confirmed" value={stats.bookings.confirmed} color="#0891b2" />
              <StatCard title="Completed" value={stats.bookings.completed} color="#16a34a" />
              <StatCard title="Revenue (Month)" value={`UGX ${(stats.revenue.monthly / 1000000).toFixed(1)}M`} color="#7c3aed" />
            </div>

            {/* Popular Cars */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>?? Most Popular Cars</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '14px' }}>Car</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '14px' }}>Brand</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280', fontSize: '14px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280', fontSize: '14px' }}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.popularCars.map((car: any) => (
                    <tr key={car.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{car.name}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{car.brand}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>UGX {(car.price / 1000000).toFixed(0)}M</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{car.booking_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Trend */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>?? 6-Month Booking Trend</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
                {stats.monthlyTrend.map((month: any) => (
                  <div key={month.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{month.bookings}</div>
                    <div style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      height: `${Math.max(10, (month.bookings / Math.max(...stats.monthlyTrend.map((m: any) => m.bookings))) * 150)}px`,
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>{month.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && pending && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                ?? Pending Bookings ({pending.pendingBookings.length})
              </h2>
              {pending.pendingBookings.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                  No pending bookings
                </div>
              ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>User</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Car</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Time</th>
                        <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.pendingBookings.map((booking: any) => (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '500' }}>{booking.user_name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.user_email}</div>
                          </td>
                          <td style={{ padding: '12px' }}>{booking.car_name} ({booking.car_brand})</td>
                          <td style={{ padding: '12px' }}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>{booking.time_slot}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} style={{ backgroundColor: '#16a34a', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                              ? Confirm
                            </button>
                            <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} style={{ backgroundColor: '#dc2626', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              ? Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                ?? Pending Car Listings ({pending.pendingCars.length})
              </h2>
              {pending.pendingCars.length === 0 ? (
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                  No pending car listings
                </div>
              ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Car</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Brand</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.pendingCars.map((car: any) => (
                        <tr key={car.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{car.name}</td>
                          <td style={{ padding: '12px' }}>{car.brand}</td>
                          <td style={{ padding: '12px' }}>UGX {(car.price / 1000000).toFixed(0)}M</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button onClick={() => approveCar(car.id)} style={{ backgroundColor: '#16a34a', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              ? Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ALL BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Car</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>#{booking.id}</td>
                    <td style={{ padding: '12px' }}>{booking.user_name}</td>
                    <td style={{ padding: '12px' }}>{booking.car_name}</td>
                    <td style={{ padding: '12px' }}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          booking.status === 'confirmed' ? '#d1fae5' :
                          booking.status === 'pending' ? '#fef3c7' :
                          booking.status === 'completed' ? '#dbeafe' : '#fee2e2',
                        color:
                          booking.status === 'confirmed' ? '#065f46' :
                          booking.status === 'pending' ? '#92400e' :
                          booking.status === 'completed' ? '#1e40af' : '#991b1b'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }: { title: string; value: any; color: string }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
    <h3 style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</p>
  </div>
);

export default Admin;
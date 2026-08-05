import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BookingCalendar.css';

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookingData, setBookingData] = useState({
    user_id: 1,
    car_id: 101,
    car_model: 'Toyota Land Cruiser',
    user_name: '',
    user_email: '',
    user_phone: '',
    notes: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchAvailableSlots = useCallback(async (date) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/check-availability`, {
        params: { car_id: bookingData.car_id, date: date },
        timeout: 10000
      });
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots || []);
        setSelectedTime(null);
      }
    } catch (err) {
      console.error('Availability fetch error:', err);
      if (err.response) {
        setError(err.response.data.error || 'Failed to fetch available slots');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [bookingData.car_id, API_BASE_URL]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
  const isDateDisabled = (date) => isPastDate(date) || isWeekend(date);

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(formatDate(date));
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (error) setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and time slot.');
      return;
    }
    if (!bookingData.user_name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!bookingData.user_email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.user_email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBookingLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/create`, {
        ...bookingData,
        date: selectedDate,
        time_slot: selectedTime
      }, { timeout: 15000 });
      if (response.data.success) {
        setSuccess('?? Test drive booked successfully! Check your email for confirmation.');
        setTimeout(() => resetBookingForm(), 3000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response) {
        if (err.response.status === 409) {
          setError('? This time slot was just taken! Please select another time.');
          fetchAvailableSlots(selectedDate);
        } else {
          setError(err.response.data.error || 'Booking failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
    setBookingData(prev => ({
      ...prev,
      user_name: '',
      user_email: '',
      user_phone: '',
      notes: ''
    }));
    setCurrentMonth(new Date());
    setTimeout(() => setSuccess(null), 5000);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const today = new Date();
    const maxFuture = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    if (nextMonth <= maxFuture) {
      setCurrentMonth(nextMonth);
    } else {
      setError('You can only book up to 3 months in advance.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const disabled = isDateDisabled(date);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate === formatDate(date);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateSelect(date)}
        >
          <span className="day-number">{day}</span>
          {isToday && <span className="today-badge">Today</span>}
          {isWeekend(date) && <span className="weekend-badge">??</span>}
        </div>
      );
    }
    return days;
  };

  const renderTimeSlots = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading available slots...</p>
        </div>
      );
    }
    if (availableSlots.length === 0) {
      return (
        <div className="no-slots">
          <span className="no-slots-icon">??</span>
          <p>No available slots for this date</p>
          <small>Please select another date</small>
        </div>
      );
    }
    return (
      <div className="slots-grid">
        {availableSlots.map(time => (
          <button
            key={time}
            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
            onClick={() => handleTimeSelect(time)}
          >
            <span className="time-icon">??</span>
            {time}
          </button>
        ))}
      </div>
    );
  };

  const renderBookingForm = () => {
    if (!selectedTime) return null;
    return (
      <form className="booking-form" onSubmit={handleBooking}>
        <h4>?? Your Details</h4>
        <div className="form-group">
          <label htmlFor="user_name">Full Name *</label>
          <input type="text" id="user_name" name="user_name" value={bookingData.user_name} onChange={handleInputChange} placeholder="Enter your full name" required disabled={bookingLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="user_email">Email Address *</label>
          <input type="email" id="user_email" name="user_email" value={bookingData.user_email} onChange={handleInputChange} placeholder="Enter your email address" required disabled={bookingLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="user_phone">Phone Number *</label>
          <input type="tel" id="user_phone" name="user_phone" value={bookingData.user_phone} onChange={handleInputChange} placeholder="+256 7XX XXX XXX" required disabled={bookingLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea id="notes" name="notes" value={bookingData.notes} onChange={handleInputChange} placeholder="Any special requests?" rows="3" disabled={bookingLoading}></textarea>
        </div>
        <button type="submit" className="book-btn" disabled={bookingLoading}>
          {bookingLoading ? (
            <>
              <span className="spinner-small"></span>
              Booking...
            </>
          ) : (
            '?? Book Test Drive'
          )}
        </button>
      </form>
    );
  };

  return (
    <div className="booking-calendar-container">
      <div className="header-section">
        <h2>?? Book Your Test Drive</h2>
        <p className="subtitle">Select your preferred date and time for a test drive at Panda Motors</p>
      </div>
      
      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">??</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" role="alert">
          <span className="alert-icon">?</span>
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}
      
      <div className="booking-grid">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={goToPreviousMonth} className="nav-btn" aria-label="Previous month">‹</button>
            <h3>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</h3>
            <button onClick={goToNextMonth} className="nav-btn" aria-label="Next month">›</button>
          </div>
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">{renderCalendarDays()}</div>
          <div className="calendar-legend">
            <div className="legend-item"><span className="legend-dot available"></span>Available</div>
            <div className="legend-item"><span className="legend-dot selected"></span>Selected</div>
            <div className="legend-item"><span className="legend-dot disabled"></span>Unavailable</div>
          </div>
        </div>
        
        <div className="booking-section">
          {selectedDate ? (
            <>
              <div className="selected-info">
                <div className="selected-date-display">
                  <span className="date-icon">??</span>
                  <div>
                    <span className="label">Selected Date</span>
                    <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                </div>
              </div>
              <div className="time-slots-section">
                <h4>? Available Time Slots</h4>
                {renderTimeSlots()}
              </div>
              {renderBookingForm()}
            </>
          ) : (
            <div className="select-date-prompt">
              <div className="prompt-icon">??</div>
              <h3>Select a Date</h3>
              <p>Choose an available date from the calendar to see time slots</p>
              <div className="info-cards">
                <div className="info-card">
                  <span className="info-icon">??</span>
                  <div><h4>Monday - Friday</h4><p>9:00 AM - 5:00 PM</p></div>
                </div>
                <div className="info-card">
                  <span className="info-icon">??</span>
                  <div><h4>Duration</h4><p>30 minutes per test drive</p></div>
                </div>
                <div className="info-card">
                  <span className="info-icon">??</span>
                  <div><h4>Cancellation</h4><p>Free cancellation up to 24 hours</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
// backend/server.cjs
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    if (email && password) {
        const isAdmin = email.includes('admin') || email === 'maxtinka7@gmail.com';
        res.json({
            success: true,
            token: 'test-jwt-token-12345',
            user: {
                id: 1,
                name: email.split('@')[0],
                email: email,
                role: isAdmin ? 'admin' : 'user'
            }
        });
    } else {
        res.status(400).json({ 
            success: false,
            message: 'Email and password required' 
        });
    }
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    console.log('Register attempt:', name, email);
    
    if (name && email && password) {
        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: 1,
                name: name,
                email: email,
                role: 'user'
            }
        });
    } else {
        res.status(400).json({ 
            success: false,
            message: 'All fields required' 
        });
    }
});

// Admin stats
app.get('/api/admin/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalCars: 6,
            totalUsers: 10,
            totalBookings: 25,
            pendingBookings: 3
        }
    });
});

// Cars
app.get('/api/cars', (req, res) => {
    const cars = [
        {
            id: 1,
            name: "Land Cruiser V8",
            brand: "Toyota",
            type: "Luxury SUV",
            year: 2023,
            price: 285000000,
            image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
            specs: { power: "309 HP", engine: "4.5L V8", drive: "4WD" },
            category: "luxury",
            condition: "New"
        },
        {
            id: 2,
            name: "S-Class S500",
            brand: "Mercedes-Benz",
            type: "Luxury Sedan",
            year: 2023,
            price: 360000000,
            image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
            specs: { power: "429 HP", engine: "3.0L V6T", drive: "RWD" },
            category: "luxury",
            condition: "New"
        },
        {
            id: 3,
            name: "Range Rover Sport",
            brand: "Land Rover",
            type: "Sport Luxury SUV",
            year: 2023,
            price: 420000000,
            image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
            specs: { power: "395 HP", engine: "3.0L I6T", drive: "AWD" },
            category: "sport",
            condition: "New"
        },
        {
            id: 4,
            name: "X5 xDrive40i",
            brand: "BMW",
            type: "Sports SUV",
            year: 2023,
            price: 195000000,
            image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
            specs: { power: "335 HP", engine: "3.0L I6T", drive: "AWD" },
            category: "sport",
            condition: "New"
        },
        {
            id: 5,
            name: "Land Cruiser Prado TZ",
            brand: "Toyota",
            type: "Premium SUV",
            year: 2022,
            price: 168000000,
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
            specs: { power: "177 HP", engine: "2.8L Diesel", drive: "4WD" },
            category: "luxury",
            condition: "Used"
        },
        {
            id: 6,
            name: "LX 570",
            brand: "Lexus",
            type: "Ultra Luxury SUV",
            year: 2023,
            price: 390000000,
            image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
            specs: { power: "383 HP", engine: "5.7L V8", drive: "4WD" },
            category: "luxury",
            condition: "New"
        }
    ];
    res.json({ success: true, cars });
});

// Bookings
app.post('/api/bookings/create', (req, res) => {
    const { car_id, booking_date, time_slot } = req.body;
    console.log('Booking:', car_id, booking_date, time_slot);
    
    if (car_id && booking_date && time_slot) {
        res.json({
            success: true,
            message: 'Booking created successfully!',
            booking: {
                id: Date.now(),
                car_id,
                booking_date,
                time_slot,
                status: 'pending'
            }
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
});

app.get('/api/bookings/check-availability', (req, res) => {
    res.json({
        success: true,
        isAvailable: true,
        message: 'This time slot is available!'
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log('========================================');
});
// Import required packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create an Express application
const app = express();

// Define the port (use environment variable or default to 5000)
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
// Middleware functions that run before every request

// cors() - Allows your React frontend (running on port 5173) 
// to communicate with this backend (running on port 5000)
app.use(cors());

// express.json() - Automatically parses incoming JSON data 
// from POST requests into a JavaScript object (req.body)
app.use(express.json());

// ============================================
// USER STORY 1: Financial Payment Approximation
// ============================================
// POST /api/finance/calculate
// This endpoint calculates monthly loan payments
app.post('/api/finance/calculate', (req, res) => {
    try {
        // STEP 1: Extract data from the request body
        // The frontend sends a JSON object with these fields
        const {
            carPrice,        // Price of the car (e.g., 285,000,000 UGX)
            downPayment,     // Down payment amount (e.g., 50,000,000 UGX)
            interestRate,    // Annual interest rate (e.g., 12 for 12%)
            loanTermMonths   // Loan duration in months (e.g., 60 for 5 years)
        } = req.body;

        // STEP 2: Input Validation
        // Check if all required fields are present
        if (carPrice === undefined || downPayment === undefined || 
            interestRate === undefined || loanTermMonths === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['carPrice', 'downPayment', 'interestRate', 'loanTermMonths']
            });
        }

        // Convert string inputs to numbers (they come as strings from JSON)
        const price = parseFloat(carPrice);
        const down = parseFloat(downPayment);
        const rate = parseFloat(interestRate);
        const term = parseInt(loanTermMonths);

        // STEP 3: Validate non-negative values (Acceptance Criteria)
        if (price < 0) {
            return res.status(400).json({ error: 'Car price cannot be negative' });
        }
        if (down < 0) {
            return res.status(400).json({ error: 'Down payment cannot be negative' });
        }
        if (rate < 0) {
            return res.status(400).json({ error: 'Interest rate cannot be negative' });
        }
        if (term <= 0) {
            return res.status(400).json({ error: 'Loan term must be greater than 0 months' });
        }

        // STEP 4: Calculate the loan amount
        const loanAmount = price - down;
        
        // Check if down payment is larger than car price
        if (loanAmount <= 0) {
            return res.status(400).json({ 
                error: 'Down payment must be less than car price',
                message: 'Your down payment already covers the full price!'
            });
        }

        // STEP 5: Calculate Monthly Payment using Amortization Formula
        // Convert annual interest rate to monthly decimal
        // Example: 12% annual = 0.12 yearly = 0.12/12 = 0.01 monthly
        const monthlyRate = (rate / 100) / 12;

        let monthlyPayment;
        let totalPayment;
        let totalInterest;

        // Formula: P = (r * PV) / (1 - (1 + r)^-n)
        // Where:
        // P = monthly payment
        // r = monthly interest rate
        // PV = present value (loan amount)
        // n = number of payments (term)
        
        if (monthlyRate === 0) {
            // If interest rate is 0%, it's simple division
            monthlyPayment = loanAmount / term;
            totalPayment = loanAmount;
            totalInterest = 0;
        } else {
            // Standard amortization formula
            const compoundFactor = Math.pow(1 + monthlyRate, term);
            monthlyPayment = loanAmount * (monthlyRate * compoundFactor) / (compoundFactor - 1);
            totalPayment = monthlyPayment * term;
            totalInterest = totalPayment - loanAmount;
        }

        // STEP 6: Generate Payment Schedule (first 6 months)
        // This shows how each payment breaks down into principal + interest
        const paymentSchedule = [];
        let remainingBalance = loanAmount;
        
        for (let month = 1; month <= Math.min(6, term); month++) {
            // Interest for this month = remaining balance * monthly rate
            const interestPayment = remainingBalance * monthlyRate;
            // Principal payment = total payment - interest
            const principalPayment = monthlyPayment - interestPayment;
            // New remaining balance
            remainingBalance -= principalPayment;
            
            paymentSchedule.push({
                month: month,
                payment: Math.round(monthlyPayment),
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                remainingBalance: Math.max(0, Math.round(remainingBalance))
            });
        }

        // STEP 7: Return the calculated results
        res.json({
            success: true,
            inputs: {
                carPrice: price,
                downPayment: down,
                loanAmount: loanAmount,
                interestRate: rate,
                loanTermMonths: term
            },
            results: {
                monthlyPayment: Math.round(monthlyPayment),
                totalPayment: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                paymentSchedule: paymentSchedule,
                currency: 'UGX'
            }
        });

    } catch (error) {
        // Handle any unexpected errors
        console.error('Calculation error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// ============================================
// USER STORY 2: Dealership Localization
// ============================================
// GET /api/dealership/location
// This endpoint returns dealership information formatted for Google Maps
app.get('/api/dealership/location', (req, res) => {
    try {
        // Dealership information for Panda Motors in Banda, Kampala
        const dealershipInfo = {
            success: true,
            dealership: {
                // Basic info
                name: 'Panda Motors Ltd',
                description: 'Uganda\'s trusted luxury vehicle importer',
                
                // Address - structured for easy display
                address: {
                    street: 'Banda, Jinja Road',
                    city: 'Kampala',
                    district: 'Kampala District',
                    country: 'Uganda',
                    fullAddress: 'Banda, Jinja Road, Kampala, Uganda'
                },
                
                // LOCATION COORDINATES - For Google Maps integration
                // These coordinates point to Banda, Kampala, Uganda
                location: {
                    latitude: 0.3488,    // Decimal degrees
                    longitude: 32.6160,   // Decimal degrees
                    zoom: 15              // Recommended zoom level for map
                },
                
                // Operating hours for each day
                operatingHours: {
                    monday: { open: '08:00', close: '18:00', isOpen: true },
                    tuesday: { open: '08:00', close: '18:00', isOpen: true },
                    wednesday: { open: '08:00', close: '18:00', isOpen: true },
                    thursday: { open: '08:00', close: '18:00', isOpen: true },
                    friday: { open: '08:00', close: '18:00', isOpen: true },
                    saturday: { open: '09:00', close: '17:00', isOpen: true },
                    sunday: { open: '00:00', close: '00:00', isOpen: false, note: 'Closed' }
                },
                
                // Contact information
                contact: {
                    phone: ['+256 770 826 951', '+256 756 053 475'],
                    whatsapp: '+256 770 826 951',
                    email: 'sales@pandamotors.co.ug'
                },
                
                // Services offered
                services: [
                    'URA Duty Clearance',
                    'Import Documentation',
                    'Certified Workshop',
                    'Flexible Financing'
                ],
                
                // GOOGLE MAPS INTEGRATION URLs
                // These URLs can be used directly in frontend map components
                googleMapsUrl: 'https://maps.google.com/?q=Banda,+Jinja+Road,+Kampala,+Uganda',
                directionsUrl: 'https://maps.google.com/dir//Banda,+Jinja+Road,+Kampala,+Uganda',
                embedMapUrl: 'https://maps.google.com/maps?q=Banda+Kampala+Uganda&z=15&output=embed'
            }
        };

        // Send the response
        res.json(dealershipInfo);

    } catch (error) {
        console.error('Location error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// ============================================
// BONUS: Dealership Open Status Endpoint
// ============================================
// GET /api/dealership/status
// Returns whether the dealership is currently open
app.get('/api/dealership/status', (req, res) => {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    // Format current time as HH:MM
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Operating hours (same as above)
    const hours = {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '00:00', close: '00:00' }
    };
    
    const todayHours = hours[currentDay];
    const isOpen = currentDay !== 'sunday' && 
                   currentTime >= todayHours.open && 
                   currentTime <= todayHours.close;
    
    res.json({
        success: true,
        currentTime: currentTime,
        currentDay: currentDay,
        isOpen: isOpen,
        operatingHours: todayHours,
        message: isOpen ? 'We are currently open! Visit us today.' : 'We are closed. Please visit during business hours.'
    });
});

// ============================================
// Health Check Endpoint
// ============================================
// GET /api/health
// Simple endpoint to verify the API is running
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Panda Motors API is running!',
        endpoints: [
            'POST /api/finance/calculate - Calculate loan payments',
            'GET /api/dealership/location - Get dealership location',
            'GET /api/dealership/status - Check if open'
        ]
    });
});

// ============================================
// Start the Server
// ============================================
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('?? Panda Motors API Server');
    console.log('========================================');
    console.log(`?? Server running on: http://localhost:${PORT}`);
    console.log('\n?? Available Endpoints:');
    console.log(`   POST /api/finance/calculate  - Loan calculator`);
    console.log(`   GET  /api/dealership/location - Store location`);
    console.log(`   GET  /api/dealership/status   - Open status`);
    console.log(`   GET  /api/health              - Health check`);
    console.log('========================================\n');
});
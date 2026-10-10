import db from '../config/database.js';

// Configuration
const HIGH_VALUE_THRESHOLD = 250000000; // 250M UGX
const LUXURY_BADGES = [
    'Land Cruiser', 'G-Wagon', 'Range Rover', 'LX570',
    'S-Class', '7-Series', 'A8', 'Cayenne', 'Taycan'
];
const PERFORMANCE_BADGES = [
    'AMG', 'M Power', 'RS', 'Turbo', 'GT'
];

class HighValueAlertSystem {
    constructor() {
        this.threshold = HIGH_VALUE_THRESHOLD;
        this.luxuryBadges = LUXURY_BADGES;
        this.performanceBadges = PERFORMANCE_BADGES;
        this.alerts = [];
        this.featuredVehicles = [];
    }

    /**
     * Check if vehicle qualifies for Featured Spotlight
     */
    qualifiesForSpotlight(vehicle) {
        const isHighValue = vehicle.price >= this.threshold;
        const isLuxury = this.luxuryBadges.some(badge => 
            vehicle.model && vehicle.model.includes(badge) ||
            vehicle.make && vehicle.make.includes(badge)
        );
        const isPerformance = this.performanceBadges.some(badge =>
            vehicle.model && vehicle.model.includes(badge) ||
            vehicle.make && vehicle.make.includes(badge)
        );

        return isHighValue || isLuxury || isPerformance;
    }

    /**
     * Get spotlight priority score
     */
    getSpotlightScore(vehicle) {
        let score = 0;
        
        // Price-based scoring
        if (vehicle.price >= 300000000) score += 30;
        else if (vehicle.price >= 250000000) score += 20;
        else if (vehicle.price >= 200000000) score += 10;
        
        // Luxury badge scoring
        this.luxuryBadges.forEach(badge => {
            if (vehicle.model && vehicle.model.includes(badge)) score += 15;
            if (vehicle.make && vehicle.make.includes(badge)) score += 10;
        });
        
        // Performance badge scoring
        this.performanceBadges.forEach(badge => {
            if (vehicle.model && vehicle.model.includes(badge)) score += 10;
            if (vehicle.make && vehicle.make.includes(badge)) score += 5;
        });
        
        // Condition scoring
        if (vehicle.condition === 'new') score += 10;
        else if (vehicle.condition === 'excellent') score += 5;
        
        // Recent addition scoring
        if (vehicle.createdAt) {
            const days = (Date.now() - new Date(vehicle.createdAt)) / (1000 * 60 * 60 * 24);
            if (days < 7) score += 15;
            else if (days < 30) score += 5;
        }
        
        return Math.min(score, 100);
    }

    /**
     * Get spotlight tier based on score
     */
    getSpotlightTier(score) {
        if (score >= 80) return 'Platinum';
        if (score >= 60) return 'Gold';
        if (score >= 40) return 'Silver';
        return 'Bronze';
    }

    /**
     * Process new vehicle for spotlight tagging
     */
    async processNewVehicle(vehicle) {
        const qualifies = this.qualifiesForSpotlight(vehicle);
        const score = this.getSpotlightScore(vehicle);
        
        const result = {
            vehicleId: vehicle.id,
            qualifiesForSpotlight: qualifies,
            spotlightScore: score,
            spotlightTier: this.getSpotlightTier(score),
            isHighValue: vehicle.price >= this.threshold,
            isLuxury: this.luxuryBadges.some(badge => 
                vehicle.model && vehicle.model.includes(badge)
            ),
            isPerformance: this.performanceBadges.some(badge =>
                vehicle.model && vehicle.model.includes(badge)
            )
        };

        // If qualifies, add to featured list
        if (qualifies) {
            const featuredEntry = {
                ...vehicle,
                spotlight: {
                    score: score,
                    tier: result.spotlightTier,
                    reason: this.getSpotlightReason(vehicle),
                    taggedAt: new Date().toISOString()
                }
            };
            
            this.featuredVehicles.push(featuredEntry);
            
            // Update in database
            await db.collection('cars').updateOne(
                { id: vehicle.id },
                { 
                    $set: { 
                        isFeatured: true,
                        spotlightScore: score,
                        spotlightTier: result.spotlightTier,
                        spotlightReason: this.getSpotlightReason(vehicle),
                        updatedAt: new Date().toISOString()
                    }
                }
            );
            
            // Create alert
            this.createAlert(vehicle, result);
        }

        return result;
    }

    /**
     * Get spotlight reason
     */
    getSpotlightReason(vehicle) {
        const reasons = [];
        
        if (vehicle.price >= 300000000) {
            reasons.push('?? Ultra-Luxury Price Point');
        } else if (vehicle.price >= 250000000) {
            reasons.push('?? High-Value Vehicle');
        }
        
        this.luxuryBadges.forEach(badge => {
            if (vehicle.model && vehicle.model.includes(badge)) {
                reasons.push(`?? ${badge} Luxury Badge`);
            }
        });
        
        this.performanceBadges.forEach(badge => {
            if (vehicle.model && vehicle.model.includes(badge)) {
                reasons.push(`? ${badge} Performance Badge`);
            }
        });
        
        if (vehicle.condition === 'new') {
            reasons.push('?? New Arrival');
        }
        
        return reasons.length > 0 ? reasons.join(' | ') : 'Featured Vehicle';
    }

    /**
     * Create alert for new spotlight vehicle
     */
    createAlert(vehicle, result) {
        const alert = {
            id: this.alerts.length + 1,
            type: 'FEATURED_SPOTLIGHT',
            vehicleId: vehicle.id,
            vehicleDetails: {
                make: vehicle.make,
                model: vehicle.model,
                price: vehicle.price,
                year: vehicle.year
            },
            spotlights: {
                score: result.spotlightScore,
                tier: result.spotlightTier,
                qualifies: result.qualifiesForSpotlight
            },
            priority: result.spotlightScore >= 80 ? 'HIGH' : 'MEDIUM',
            message: this.generateAlertMessage(vehicle, result),
            createdAt: new Date().toISOString(),
            isRead: false
        };
        
        this.alerts.push(alert);
        console.log(`?? [SPOTLIGHT ALERT] ${alert.message}`);
        
        return alert;
    }

    /**
     * Generate alert message
     */
    generateAlertMessage(vehicle, result) {
        return `?? Spotlight Vehicle Detected: ${vehicle.make} ${vehicle.model} ` +
               `(${vehicle.year}) - ${vehicle.price.toLocaleString()} UGX ` +
               `| Score: ${result.spotlightScore} | Tier: ${result.spotlightTier}`;
    }

    /**
     * Get all alerts
     */
    getAlerts(unreadOnly = false) {
        if (unreadOnly) {
            return this.alerts.filter(a => !a.isRead);
        }
        return this.alerts;
    }

    /**
     * Mark alert as read
     */
    markAlertAsRead(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.isRead = true;
            return true;
        }
        return false;
    }

    /**
     * Get featured vehicles
     */
    getFeaturedVehicles(limit = 10) {
        return this.featuredVehicles
            .sort((a, b) => b.spotlight.score - a.spotlight.score)
            .slice(0, limit);
    }

    /**
     * Get high-value inventory stats
     */
    async getHighValueStats() {
        const cars = await db.collection('cars').find({}).toArray();
        
        const highValue = cars.filter(c => c.price >= this.threshold);
        const luxury = cars.filter(c => 
            this.luxuryBadges.some(badge => 
                c.model && c.model.includes(badge)
            )
        );
        const performance = cars.filter(c =>
            this.performanceBadges.some(badge =>
                c.model && c.model.includes(badge)
            )
        );
        
        return {
            totalCars: cars.length,
            highValueCount: highValue.length,
            highValuePercentage: ((highValue.length / cars.length) * 100).toFixed(1),
            luxuryCount: luxury.length,
            performanceCount: performance.length,
            featuredCount: this.featuredVehicles.length,
            totalValue: cars.reduce((sum, c) => sum + c.price, 0),
            highValueValue: highValue.reduce((sum, c) => sum + c.price, 0)
        };
    }

    /**
     * Process all existing vehicles
     */
    async processAllVehicles() {
        const cars = await db.collection('cars').find({}).toArray();
        const results = [];
        
        for (const car of cars) {
            const result = await this.processNewVehicle(car);
            results.push(result);
        }
        
        return {
            processed: results.length,
            featured: results.filter(r => r.qualifiesForSpotlight).length,
            results: results
        };
    }
}

// Create singleton instance
export const highValueAlertSystem = new HighValueAlertSystem();

// Controller for routes
export const highValueController = {
    /**
     * Process a new vehicle
     */
    async processVehicle(req, res) {
        try {
            const { vehicleId } = req.params;
            const vehicle = await db.collection('cars').findOne({ id: parseInt(vehicleId) });
            
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    error: 'Vehicle not found'
                });
            }

            const result = await highValueAlertSystem.processNewVehicle(vehicle);
            
            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Process vehicle error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Get all alerts
     */
    async getAlerts(req, res) {
        try {
            const { unread = 'false' } = req.query;
            const alerts = highValueAlertSystem.getAlerts(unread === 'true');
            
            res.json({
                success: true,
                data: alerts,
                total: alerts.length
            });

        } catch (error) {
            console.error('Get alerts error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Mark alert as read
     */
    async markAlertRead(req, res) {
        try {
            const { alertId } = req.params;
            const result = highValueAlertSystem.markAlertAsRead(parseInt(alertId));
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Alert not found'
                });
            }

            res.json({
                success: true,
                message: 'Alert marked as read'
            });

        } catch (error) {
            console.error('Mark alert error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Get featured vehicles
     */
    async getFeaturedVehicles(req, res) {
        try {
            const { limit = 10 } = req.query;
            const featured = highValueAlertSystem.getFeaturedVehicles(parseInt(limit));
            
            res.json({
                success: true,
                data: featured,
                total: featured.length
            });

        } catch (error) {
            console.error('Get featured vehicles error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Get high-value stats
     */
    async getHighValueStats(req, res) {
        try {
            const stats = await highValueAlertSystem.getHighValueStats();
            
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Get high-value stats error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Process all vehicles
     */
    async processAllVehicles(req, res) {
        try {
            const result = await highValueAlertSystem.processAllVehicles();
            
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Process all vehicles error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Process vehicle on creation (webhook)
     */
    async vehicleCreatedWebhook(req, res) {
        try {
            const vehicle = req.body;
            
            if (!vehicle || !vehicle.id) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid vehicle data'
                });
            }

            const result = await highValueAlertSystem.processNewVehicle(vehicle);
            
            res.json({
                success: true,
                message: 'Vehicle processed for spotlight',
                data: result
            });

        } catch (error) {
            console.error('Vehicle creation webhook error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

export default highValueController;
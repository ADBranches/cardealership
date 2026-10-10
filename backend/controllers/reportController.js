import db from '../config/database.js';
import PDFGenerator from '../utils/pdfGenerator.js';

export const reportController = {
    /**
     * Generate Inventory PDF Report
     * GET /api/admin/reports/inventory
     */
    async generateInventoryReport(req, res) {
        try {
            // Get inventory data
            const cars = await db.collection('cars').find({}).toArray();
            
            if (!cars || cars.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No inventory data available'
                });
            }

            // Get query parameters
            const {
                format = 'pdf',
                includeSummary = 'true',
                sortBy = 'make',
                sortOrder = 'asc'
            } = req.query;

            // Sort data
            const sortedCars = this.sortInventory(cars, sortBy, sortOrder);

            // Generate PDF
            const pdfGenerator = new PDFGenerator();
            const buffer = await pdfGenerator.getBuffer(sortedCars, {
                title: 'Panda Motors - Inventory Report',
                subtitle: `Complete Vehicle Stock List (${sortedCars.length} vehicles)`,
                currency: 'UGX',
                includeSummary: includeSummary === 'true'
            });

            // Set response headers
            const filename = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            
            // Send PDF
            res.send(buffer);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate inventory report',
                message: error.message
            });
        }
    },

    /**
     * Generate Inventory Report as JSON
     * GET /api/admin/reports/inventory/json
     */
    async getInventoryJSON(req, res) {
        try {
            const cars = await db.collection('cars').find({}).toArray();
            
            const { sortBy = 'make', sortOrder = 'asc' } = req.query;
            const sortedCars = this.sortInventory(cars, sortBy, sortOrder);

            res.json({
                success: true,
                data: {
                    generatedAt: new Date().toISOString(),
                    totalVehicles: sortedCars.length,
                    summary: this.calculateSummary(sortedCars),
                    vehicles: sortedCars
                }
            });

        } catch (error) {
            console.error('JSON Report Error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Get Inventory Summary Only
     * GET /api/admin/reports/inventory/summary
     */
    async getInventorySummary(req, res) {
        try {
            const cars = await db.collection('cars').find({}).toArray();
            
            if (!cars || cars.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No inventory data available'
                });
            }

            const summary = this.calculateSummary(cars);
            
            res.json({
                success: true,
                data: summary,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Summary Error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    /**
     * Sort Inventory
     */
    sortInventory(cars, sortBy, sortOrder) {
        const order = sortOrder === 'desc' ? -1 : 1;
        return [...cars].sort((a, b) => {
            const valA = a[sortBy] || '';
            const valB = b[sortBy] || '';
            
            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * order;
            }
            
            return valA.toString().localeCompare(valB.toString()) * order;
        });
    },

    /**
     * Calculate Summary Statistics
     */
    calculateSummary(cars) {
        const total = cars.length;
        const totalValue = cars.reduce((sum, car) => sum + car.price, 0);
        const avgPrice = total > 0 ? totalValue / total : 0;
        const minPrice = total > 0 ? Math.min(...cars.map(c => c.price)) : 0;
        const maxPrice = total > 0 ? Math.max(...cars.map(c => c.price)) : 0;

        const makeCount = {};
        cars.forEach(car => {
            makeCount[car.make] = (makeCount[car.make] || 0) + 1;
        });

        const topMakes = Object.entries(makeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            total,
            totalValue,
            avgPrice: Math.round(avgPrice),
            minPrice,
            maxPrice,
            byMake: makeCount,
            topMakes
        };
    }
};

export default reportController;
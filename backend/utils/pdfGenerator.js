import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFGenerator {
    constructor() {
        this.doc = null;
        this.filename = '';
    }

    /**
     * Generate Inventory Report PDF
     * @param {Array} inventoryData - Array of car objects
     * @param {Object} options - Report options
     * @returns {Buffer} PDF buffer
     */
    generateInventoryReport(inventoryData, options = {}) {
        const {
            title = 'Panda Motors - Inventory Report',
            subtitle = 'Complete Vehicle Stock List',
            currency = 'UGX',
            includeImages = false,
            includeSummary = true
        } = options;

        // Create a new PDF document
        this.doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            layout: 'landscape'
        });

        const chunks = [];
        this.doc.on('data', chunk => chunks.push(chunk));
        this.doc.on('end', () => {});

        // ============ HEADER SECTION ============
        this.addHeader(title, subtitle);
        
        // ============ SUMMARY SECTION ============
        if (includeSummary) {
            this.addSummary(inventoryData, currency);
        }
        
        // ============ TABLE SECTION ============
        this.addInventoryTable(inventoryData, currency);
        
        // ============ FOOTER SECTION ============
        this.addFooter();

        // Finalize PDF
        this.doc.end();
        
        // Return buffer
        return new Promise((resolve) => {
            this.doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        });
    }

    /**
     * Add Header to PDF
     */
    addHeader(title, subtitle) {
        const { doc } = this;
        
        // Logo/Header
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#1a237e')
           .text('?? Panda Motors', { align: 'center' });
        
        doc.moveDown(0.5);
        
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#0d47a1')
           .text(title, { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#37474f')
           .text(subtitle, { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Date and Time
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        doc.fontSize(10)
           .fillColor('#78909c')
           .text(`Generated: ${dateStr} at ${timeStr}`, { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Divider line
        doc.strokeColor('#e0e0e0')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke();
        
        doc.moveDown(1);
    }

    /**
     * Add Summary Section
     */
    addSummary(inventoryData, currency) {
        const { doc } = this;
        
        const totalCars = inventoryData.length;
        const totalValue = inventoryData.reduce((sum, car) => sum + car.price, 0);
        const avgPrice = totalCars > 0 ? totalValue / totalCars : 0;
        const minPrice = totalCars > 0 ? Math.min(...inventoryData.map(c => c.price)) : 0;
        const maxPrice = totalCars > 0 ? Math.max(...inventoryData.map(c => c.price)) : 0;
        
        // Make breakdown
        const makeCount = {};
        inventoryData.forEach(car => {
            makeCount[car.make] = (makeCount[car.make] || 0) + 1;
        });
        const topMakes = Object.entries(makeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        // Summary Box
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1a237e')
           .text('?? Inventory Summary', { underline: true });
        
        doc.moveDown(0.5);
        
        // Create summary table
        const summaryData = [
            ['Total Vehicles', totalCars.toString()],
            [`Total Value (${currency})`, `${currency} ${this.formatCurrency(totalValue)}`],
            [`Average Price (${currency})`, `${currency} ${this.formatCurrency(avgPrice)}`],
            [`Price Range (${currency})`, `${currency} ${this.formatCurrency(minPrice)} - ${currency} ${this.formatCurrency(maxPrice)}`],
            ['Top Makes', topMakes.map(([make, count]) => `${make} (${count})`).join(', ')]
        ];
        
        const startX = 50;
        let y = doc.y;
        const colWidth = 150;
        const rowHeight = 25;
        
        summaryData.forEach((row, index) => {
            const yPos = y + (index * rowHeight);
            
            // Background alternating
            doc.rect(startX, yPos, colWidth, rowHeight)
               .fill(index % 2 === 0 ? '#f5f5f5' : '#ffffff');
            
            // Label
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#1a237e')
               .text(row[0], startX + 10, yPos + 7, { width: colWidth - 10 });
            
            // Value
            doc.font('Helvetica')
               .fillColor('#000000')
               .text(row[1], startX + 10, yPos + 7, { width: colWidth - 10, align: 'right' });
        });
        
        doc.moveDown(2);
    }

    /**
     * Add Inventory Table
     */
    addInventoryTable(inventoryData, currency) {
        const { doc } = this;
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1a237e')
           .text('?? Vehicle Inventory', { underline: true });
        
        doc.moveDown(0.5);
        
        // Table headers
        const headers = ['#', 'Make', 'Model', 'Year', 'Condition', 'Transmission', `Price (${currency})`, 'Status'];
        const columnWidths = [30, 80, 90, 50, 60, 70, 100, 70];
        const rowHeight = 25;
        const startX = 50;
        let y = doc.y;
        
        // Table header background
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
           .fill('#1a237e');
        
        // Table header text
        let xPos = startX;
        headers.forEach((header, index) => {
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#ffffff')
               .text(header, xPos + 5, y + 7, { 
                   width: columnWidths[index] - 10,
                   align: 'left'
               });
            xPos += columnWidths[index];
        });
        
        y += rowHeight;
        
        // Table body
        let rowCount = 0;
        let maxRows = 20; // Rows per page
        
        inventoryData.forEach((car, index) => {
            // Check if we need a new page
            if (rowCount >= maxRows) {
                doc.addPage();
                y = 50;
                rowCount = 0;
                
                // Re-add header on new page
                doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                   .fill('#1a237e');
                
                let headerX = startX;
                headers.forEach((header, hIndex) => {
                    doc.fontSize(9)
                       .font('Helvetica-Bold')
                       .fillColor('#ffffff')
                       .text(header, headerX + 5, y + 7, { 
                           width: columnWidths[hIndex] - 10,
                           align: 'left'
                       });
                    headerX += columnWidths[hIndex];
                });
                y += rowHeight;
            }
            
            const rowY = y;
            const rowData = [
                (index + 1).toString(),
                car.make || 'N/A',
                car.model || 'N/A',
                car.year?.toString() || 'N/A',
                car.condition || 'N/A',
                car.transmission || 'N/A',
                this.formatCurrency(car.price || 0),
                car.status || 'Available'
            ];
            
            // Row background (alternating)
            doc.rect(startX, rowY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
               .fill(rowCount % 2 === 0 ? '#fafafa' : '#ffffff');
            
            // Row data
            let cellX = startX;
            rowData.forEach((data, colIndex) => {
                const color = (colIndex === 6) ? '#1a237e' : '#000000';
                const font = (colIndex === 6) ? 'Helvetica-Bold' : 'Helvetica';
                
                // Highlight high-value cars
                if (colIndex === 6 && car.price && car.price > 250000000) {
                    doc.fontSize(9)
                       .font('Helvetica-Bold')
                       .fillColor('#e65100');
                } else {
                    doc.fontSize(9)
                       .font(font)
                       .fillColor(color);
                }
                
                // Truncate long text
                const displayText = data.length > 15 ? data.substring(0, 14) + '...' : data;
                
                doc.text(displayText, cellX + 5, rowY + 7, { 
                    width: columnWidths[colIndex] - 10,
                    align: 'left'
                });
                
                cellX += columnWidths[colIndex];
            });
            
            y += rowHeight;
            rowCount++;
        });
        
        doc.moveDown(1);
    }

    /**
     * Add Footer
     */
    addFooter() {
        const { doc } = this;
        
        // Footer line
        doc.strokeColor('#e0e0e0')
           .lineWidth(1)
           .moveTo(50, doc.page.height - 60)
           .lineTo(doc.page.width - 50, doc.page.height - 60)
           .stroke();
        
        // Footer text
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#78909c')
           .text(
               'Panda Motors Ltd - Confidential Inventory Report',
               50,
               doc.page.height - 45,
               { align: 'left' }
           );
        
        doc.text(
            `Page ${doc.page.number}`,
            doc.page.width - 50,
            doc.page.height - 45,
            { align: 'right' }
        );
    }

    /**
     * Format Currency
     */
    formatCurrency(amount) {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /**
     * Save PDF to File
     */
    async saveToFile(inventoryData, filePath, options = {}) {
        const buffer = await this.generateInventoryReport(inventoryData, options);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    }

    /**
     * Get PDF as Buffer
     */
    async getBuffer(inventoryData, options = {}) {
        return await this.generateInventoryReport(inventoryData, options);
    }
}

export default PDFGenerator;
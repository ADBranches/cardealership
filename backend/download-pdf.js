import http from 'http';
import fs from 'fs';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJUZXN0IEFkbWluIiwiaWF0IjoxNzg4OTc4MTE0LCJleHAiOjE3ODk1ODI5MTR9.iEVCOsnEC4zxtt2oGwGwlcMeeg2jcQ3BP2TaJsuT1XM";

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/reports/inventory',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log('?? Downloading PDF Report...');

const req = http.request(options, (res) => {
    console.log(`?? Status Code: ${res.statusCode}`);
    console.log(`?? Content-Type: ${res.headers['content-type']}`);
    
    if (res.statusCode !== 200) {
        console.error('? Error: Failed to generate PDF');
        res.on('data', (chunk) => {
            console.log('Error Response:', chunk.toString());
        });
        return;
    }

    const fileStream = fs.createWriteStream('inventory-report.pdf');
    let fileSize = 0;
    
    res.on('data', (chunk) => {
        fileSize += chunk.length;
        process.stdout.write(`\r?? Downloading: ${(fileSize / 1024).toFixed(1)} KB`);
    });
    
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
        fileStream.close();
        console.log(`\n? PDF Downloaded Successfully!`);
        console.log(`?? File: inventory-report.pdf`);
        console.log(`?? Size: ${(fileSize / 1024).toFixed(1)} KB`);
        
        // Verify file exists
        if (fs.existsSync('inventory-report.pdf')) {
            console.log('?? Location: ' + process.cwd() + '\\inventory-report.pdf');
        }
    });
});

req.on('error', (e) => {
    console.error('? Error:', e.message);
    console.error('?? Make sure the server is running on http://localhost:5000');
});

req.end();
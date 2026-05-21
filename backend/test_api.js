const http = require('http');

const data = JSON.stringify({
  id: 'TEST-' + Date.now(),
  patientName: 'Test Patient',
  testType: 'Blood Test',
  requestedBy: 'Dr. Test',
  date: '2024-04-15',
  status: 'Pending',
  result: 'Pending'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/labs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.write(data);
req.end();

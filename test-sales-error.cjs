const http = require('http');

// First login to get token
const postData = JSON.stringify({ email: 'dmtshop20@gmail.com', password: 'password', username: 'paten', pin: '123456' });

const req1 = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/sales?branchId=undefined',
  method: 'GET'
}, (res) => {
  console.log(`SALES STATUS: ${res.statusCode}`);
});

req1.on('error', (e) => { console.error('Sales error: ' + e); });
req1.end();

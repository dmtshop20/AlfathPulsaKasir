const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/\/api\/sales/g, '/api/transactions');
server = server.replace(/\/api\/commissions/g, '/api/incentives');
fs.writeFileSync('server.ts', server);

let api = fs.readFileSync('src/services/api.ts', 'utf8');
api = api.replace(/BASE_URL\}\/sales/g, 'BASE_URL}/transactions');
api = api.replace(/BASE_URL\}\/commissions/g, 'BASE_URL}/incentives');
fs.writeFileSync('src/services/api.ts', api);

console.log("Renamed endpoints.");

const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3002,
    path: '/ar/cars/city/beni-mellal',
    method: 'GET',
    headers: {
        'x-forwarded-proto': 'https'
    }
};

http.get(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Body length:', data.length);
        if (res.statusCode !== 200) {
            console.log('Body preview:', data.substring(0, 1000));
        }
    });
}).on('error', (err) => {
    console.error('Error fetching page:', err.message);
});

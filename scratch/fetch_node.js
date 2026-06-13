const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: '/ar/cars/city/casablanca',
    method: 'GET',
    headers: {
        'x-forwarded-proto': 'https'
    }
};

http.get(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Body length:', data.length);
        if (res.statusCode !== 200) {
            console.log('Body preview:', data.substring(0, 1000));
        } else {
            console.log('Page loaded successfully! Title/H1 search:');
            const match = data.match(/<title>([^<]+)<\/title>/);
            if (match) {
                console.log('Title:', match[1]);
            }
            const h1Match = data.match(/<h1[^>]*>([^<]+)<\/h1>/);
            if (h1Match) {
                console.log('H1:', h1Match[1]);
            }
        }
    });
}).on('error', (err) => {
    console.error('Error fetching page:', err.message);
});

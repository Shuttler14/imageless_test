
const https = require('https');

const url = 'https://mynarrative-ai.vercel.app/api/fashion_consultant';

console.log(`Testing URL: ${url}`);

const req = https.request(url, { method: 'POST' }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();

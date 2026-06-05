const fs = require('fs');
const path = require('path');
const http = require('http');

function testFetch(url, name) {
    return new Promise((resolve, reject) => {
        console.log(`\nFetching ${url}...`);
        const options = {
            headers: {
                'x-forwarded-proto': 'https'
            }
        };
        http.get(url, options, (res) => {
            console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
            if (res.headers.location) {
                console.log(`Redirect location: ${res.headers.location}`);
            }
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`Length: ${data.length} bytes`);
                if (res.statusCode !== 200) {
                    console.error(`Status code is not 200, it is ${res.statusCode}`);
                    resolve();
                    return;
                }

                // Check for key elements
                const hasTitle = data.includes("دليل");
                const hasFAQSchema = data.includes('"@type":"FAQPage"') || data.includes('"@type": "FAQPage"');
                const hasBreadcrumbSchema = data.includes('"@type":"BreadcrumbList"') || data.includes('"@type": "BreadcrumbList"');
                const hasAuthor = data.includes("فريق Cayn.ma") || data.includes("فريق عمل Cayn.ma") || data.includes("L&#x27;équipe Cayn.ma") || data.includes("L'équipe Cayn.ma");
                const hasRelatedGuides = data.includes("قد يهمك") || data.includes("Vous aimerez");

                console.log(`- Contains Guide Title (دليل): ${hasTitle ? '✅' : '❌'}`);
                console.log(`- Contains FAQPage Schema: ${hasFAQSchema ? '✅' : '❌'}`);
                console.log(`- Contains BreadcrumbList Schema: ${hasBreadcrumbSchema ? '✅' : '❌'}`);
                console.log(`- Contains Author/Date Info: ${hasAuthor ? '✅' : '❌'}`);
                console.log(`- Contains Related Guides Section: ${hasRelatedGuides ? '✅' : '❌'}`);

                const dir = path.join(__dirname, '../scratch');
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                fs.writeFileSync(path.join(dir, `${name}.html`), data);
                console.log(`Saved page content to scratch/${name}.html`);
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error fetching page ${name}:`, err);
            resolve();
        });
    });
}

async function run() {
    await testFetch('http://127.0.0.1:3000/ar/rent-agencies/casablanca', 'casablanca_rent_ar');
    await testFetch('http://127.0.0.1:3000/ar/cars/city/casablanca', 'casablanca_cars_ar');
    process.exit(0);
}

run();

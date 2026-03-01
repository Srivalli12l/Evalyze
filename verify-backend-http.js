const http = require('http');

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function verify() {
    const userId = '00000000-0000-0000-0000-000000000000'; // Specific UUID for Dev Mode testing

    console.log('--- Verifying Backend APIs (Dev Mode - Native HTTP) ---');

    // 1. Test GET /api/results
    try {
        console.log('\nTesting GET /api/results...');
        const res = await request(`/results?userId=${userId}`);
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));
        if (res.data.success && res.data.data.resume.role_fit_score === 85) {
            console.log('✅ GET /api/results PASSED');
        } else {
            console.log('❌ GET /api/results FAILED');
        }
    } catch (error) {
        console.error('❌ GET /api/results Error:', error.message);
    }

    // 2. Test POST /api/resume/analyze
    try {
        console.log('\nTesting POST /api/resume/analyze...');
        const body = JSON.stringify({ userId, text: 'Sample Resume Text' });
        const res = await request('/resume/analyze', 'POST', body);
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));
        if (res.data.success && res.data.analysis.role_fit_score) {
            console.log('✅ POST /api/resume/analyze PASSED');
        } else {
            console.log('❌ POST /api/resume/analyze FAILED');
        }
    } catch (error) {
        console.error('❌ POST /api/resume/analyze Error:', error.message);
    }

    // 3. Test POST /api/assessment/submit (Skill)
    try {
        console.log('\nTesting POST /api/assessment/submit (Skill)...');
        const body = JSON.stringify({ userId, type: 'skill', answers: [1, 0, 1] });
        const res = await request('/assessment/submit', 'POST', body);
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));
        if (res.data.success && res.data.results.score) {
            console.log('✅ POST /api/assessment/submit (Skill) PASSED');
        } else {
            console.log('❌ POST /api/assessment/submit (Skill) FAILED');
        }
    } catch (error) {
        console.error('❌ POST /api/assessment/submit (Skill) Error:', error.message);
    }
}

verify();

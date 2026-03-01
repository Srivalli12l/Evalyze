const fetch = require('node-fetch'); // Check if node-fetch is available, or use native fetch if Node 18+

async function verify() {
    const baseUrl = 'http://localhost:3000/api';
    const userId = 'test-user';

    console.log('--- Verifying Backend APIs (Dev Mode) ---');

    // 1. Test GET /api/results
    try {
        console.log('\nTesting GET /api/results...');
        const res = await fetch(`${baseUrl}/results?userId=${userId}`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (data.success && data.data.resume.role_fit_score === 85) {
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
        const res = await fetch(`${baseUrl}/resume/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, text: 'Sample Resume Text' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (data.success && data.analysis.role_fit_score) {
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
        const res = await fetch(`${baseUrl}/assessment/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, type: 'skill', answers: [1, 0, 1] })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (data.success && data.results.score) {
            console.log('✅ POST /api/assessment/submit (Skill) PASSED');
        } else {
            console.log('❌ POST /api/assessment/submit (Skill) FAILED');
        }
    } catch (error) {
        console.error('❌ POST /api/assessment/submit (Skill) Error:', error.message);
    }
}

verify();

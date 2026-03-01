const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function verify() {
    const baseUrl = 'http://localhost:3000/api';

    console.log('--- Verifying FULL Admin Dashboard APIs ---');

    // 1. Test GET /api/admin/overview
    try {
        console.log('\nTesting GET /api/admin/overview...');
        const res = await fetch(`${baseUrl}/admin/overview`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
        if (res.status === 200 && 'totalUsers' in data) {
            console.log('✅ GET /api/admin/overview PASSED');
        } else {
            console.log('❌ GET /api/admin/overview FAILED');
        }
    } catch (error) {
        console.error('❌ GET /api/admin/overview Error:', error.message);
    }

    // 2. Test GET /api/admin/users
    try {
        console.log('\nTesting GET /api/admin/users...');
        const res = await fetch(`${baseUrl}/admin/users`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('User Count:', data.length);
        if (res.status === 200 && Array.isArray(data)) {
            console.log('✅ GET /api/admin/users PASSED');
        } else {
            console.log('❌ GET /api/admin/users FAILED');
        }
    } catch (error) {
        console.error('❌ GET /api/admin/users Error:', error.message);
    }

    // 3. Test GET /api/admin/assessments
    try {
        console.log('\nTesting GET /api/admin/assessments...');
        const res = await fetch(`${baseUrl}/admin/assessments`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Assessment Count:', data.length);
        if (res.status === 200 && Array.isArray(data)) {
            console.log('✅ GET /api/admin/assessments PASSED');
        } else {
            console.log('❌ GET /api/admin/assessments FAILED');
        }
    } catch (error) {
        console.error('❌ GET /api/admin/assessments Error:', error.message);
    }
}

verify();

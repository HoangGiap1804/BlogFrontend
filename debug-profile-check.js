import { fetchCurrentUser, getAuthData } from './src/services/auth.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// polyfill fetch
if (!global.fetch) {
    global.fetch = require('node-fetch');
}

async function testProfile() {
    // using the token from the last successful login in debug-api.js output
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGI5NGYwODgwOWI4ZjY1MjJkOTc4MTciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjUxMjUzOTQsImV4cCI6MTc2NTEyODk5NCwic3ViIjoiYWNjZXNzQXBpIn0.tf9UAxjf7lJbIbcHBNIYqv3lRZo5HH3XUujQnrDNW8A';

    console.log('Testing Profile API with token...');
    try {
        const response = await fetch('http://localhost:12000/api/v1/users/current', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Profile Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', await response.text());
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

console.log("Reviewing code logic...");

testProfile();

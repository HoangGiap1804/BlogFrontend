const login = async () => {
    try {
        const response = await fetch('http://localhost:12000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email: 'admin@gmail.com', password: '12345678' }) // Guessing password
        });
        const data = await response.json();
        console.log('Login Data:', data);
        return data.accessToken;
    } catch (e) {
        console.error('Login failed', e);
    }
};

const checkBlogs = async (token) => {
    try {
        console.log('--- Page 1 ---');
        const response1 = await fetch('http://localhost:12000/api/v1/blogs?limit=4&offset=0', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data1 = await response1.json();
        console.log('Page 1 IDs:', data1.blogs.map(b => b._id));

        console.log('--- Page 2 ---');
        const response2 = await fetch('http://localhost:12000/api/v1/blogs?limit=4&offset=4', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await response2.json();
        console.log('Page 2 IDs:', data2.blogs.map(b => b._id));
    } catch (e) {
        console.error('Check blogs failed', e);
    }
};

(async () => {
    const token = await login();
    if (token) await checkBlogs(token);
})();

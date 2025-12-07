export const loginUser = async (email, password) => {
    const details = {
        'email': email,
        'password': password
    };

    const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
        .join('&');

    try {
        const response = await fetch('http://localhost:12000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        });

        if (!response.ok) {
            // Try to parse error message if available
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            } catch (e) {
                throw new Error(`Login failed with status: ${response.status}`);
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const saveAuthData = (data) => {
    if (data && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
    }
    if (data && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
};

export const getAuthData = () => {
    return {
        accessToken: localStorage.getItem('accessToken'),
        user: JSON.parse(localStorage.getItem('user') || 'null')
    };
};

export const fetchCurrentUser = async () => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch('http://localhost:12000/api/v1/users/current', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) throw new Error('Failed to fetch user profile');
    return await response.json();
};

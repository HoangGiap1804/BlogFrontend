import { getAuthData } from './auth';

export const fetchUsers = async (limit = 10, offset = 0) => {
    const { accessToken } = getAuthData();

    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(`http://localhost:12000/api/v1/users?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            if (response.status === 403) {
                throw new Error('Access denied. Admin privileges required.');
            }
            throw new Error(`Error fetching users: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch users error:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    // Convert to form-urlencoded format
    const formBody = Object.keys(userData)
        .map(key => {
            const value = userData[key];
            // Handle nested objects like socialLinks
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value)
                    .map(subKey =>
                        encodeURIComponent(`${key}.${subKey}`) + '=' + encodeURIComponent(value[subKey] || '')
                    )
                    .join('&');
            }
            return encodeURIComponent(key) + '=' + encodeURIComponent(value || '');
        })
        .join('&');

    const response = await fetch(`http://localhost:12000/api/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user');
    }

    return await response.json();
};

export const deleteUser = async (userId) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
    }

    // 204 No Content - successful deletion with no response body
    if (response.status === 204) {
        return { status: 204, success: true };
    }

    // Other successful statuses with response body
    return await response.json();
};

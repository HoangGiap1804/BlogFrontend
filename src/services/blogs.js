import { getAuthData } from './auth';

export const fetchBlogs = async (limit = 12, offset = 0) => {
    const { accessToken } = getAuthData();

    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(`http://localhost:12000/api/v1/blogs?limit=${limit}&offset=${offset}`, {
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
            throw new Error(`Error fetching blogs: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch blogs error:', error);
        throw error;
    }
};

export const fetchBlogById = async (id) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch blog'); // Add more specific handling
    return await response.json();
};

export const likeBlog = async (id) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/${id}/like`, {
        method: 'POST', // Assuming POST for like action
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to like blog');
    return await response.json();
};

export const fetchBlogBySlug = async (slug) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/slug/${slug}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch blog by slug');
    return await response.json();
};

export const fetchBlogsByUserId = async (userId, limit = 10, offset = 0) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/user/${userId}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch user blogs');
    return await response.json();
};

export const createBlog = async (formData) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch('http://localhost:12000/api/v1/blogs', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
            // Note: Don't set Content-Type for FormData, browser sets it automatically with boundary
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create blog');
    }

    return await response.json();
};

export const updateBlog = async (blogId, formData) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
            // Note: Don't set Content-Type for FormData, browser sets it automatically with boundary
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update blog');
    }

    return await response.json();
};

export const deleteBlog = async (blogId) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    const response = await fetch(`http://localhost:12000/api/v1/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete blog');
    }

    // 204 No Content - successful deletion with no response body
    if (response.status === 204) {
        return { status: 204, success: true };
    }

    // Other successful statuses with response body
    return await response.json();
};

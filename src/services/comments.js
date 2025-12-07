import { getAuthData } from './auth';

export const fetchComments = async (blogId) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    // Updated endpoint as per user request
    const response = await fetch(`http://localhost:12000/api/v1/comments/blog/${blogId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
};

export const createComment = async (blogId, content) => {
    const { accessToken } = getAuthData();
    if (!accessToken) throw new Error('No access token found');

    // Endpoint updated to match GET request pattern /comments/blog/{{blogId}}
    const response = await fetch(`http://localhost:12000/api/v1/comments/blog/${blogId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ comment: content })
    });

    if (!response.ok) throw new Error('Failed to post comment');
    return await response.json();
};

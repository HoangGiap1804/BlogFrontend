import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthData, fetchCurrentUser, saveAuthData } from '../services/auth';
import { fetchBlogsByUserId, fetchBlogs, deleteBlog } from '../services/blogs';
import { fetchUsers, deleteUser } from '../services/users';
import EditProfileModal from '../components/EditProfileModal';
import EditBlogModal from '../components/EditBlogModal';
import DeleteBlogModal from '../components/DeleteBlogModal';
import DeleteUserModal from '../components/DeleteUserModal';
import '../index.css';

const Profile = () => {
    const { user: storedUser } = getAuthData();
    const [profile, setProfile] = useState(storedUser);
    const [blogs, setBlogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(!storedUser);
    const [blogsLoading, setBlogsLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [deletingBlog, setDeletingBlog] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [activeTab, setActiveTab] = useState('blogs'); // 'blogs' or 'users'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const navigate = useNavigate();
    const blogsPerPage = 6;
    const usersPerPage = 10;

    useEffect(() => {
        if (!storedUser) {
            navigate('/login');
        } else {
            console.log("Profile loaded from localStorage:", storedUser._id);
            setLoading(false);
        }
    }, [storedUser, navigate]);

    // Reload blogs when page changes
    useEffect(() => {
        if (profile?._id) {
            const loadBlogsPage = async () => {
                setBlogsLoading(true);
                try {
                    const offset = (page - 1) * blogsPerPage;

                    let blogsData;
                    // Admin fetches all blogs, regular users fetch only their blogs
                    if (profile.role === 'admin') {
                        blogsData = await fetchBlogs(blogsPerPage, offset);
                    } else {
                        blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, offset);
                    }

                    setBlogs(blogsData.blogs || blogsData.items || []);
                    const total = blogsData.total || 0;
                    setTotalBlogs(total);
                    setTotalPages(Math.ceil(total / blogsPerPage));
                } catch (err) {
                    console.error("Failed to load blogs", err);
                } finally {
                    setBlogsLoading(false);
                }
            };
            loadBlogsPage();
        }
    }, [page, profile]);

    const handleProfileUpdate = async () => {
        try {
            // Fetch fresh user data from API
            const data = await fetchCurrentUser();
            if (data && data.user) {
                setProfile(data.user);
                // Update localStorage to keep it in sync
                const { accessToken } = getAuthData();
                saveAuthData({ accessToken, user: data.user });
            }
        } catch (err) {
            console.error("Failed to fetch updated profile:", err);
            // Fallback to localStorage if fetch fails
            const { user } = getAuthData();
            if (user) {
                setProfile(user);
            }
        }
    };

    const handleBlogUpdate = async () => {
        // Reload blogs after update and reset to page 1
        setPage(1);
        if (profile?._id) {
            try {
                let blogsData;
                // Admin fetches all blogs, regular users fetch only their blogs
                if (profile.role === 'admin') {
                    blogsData = await fetchBlogs(blogsPerPage, 0);
                } else {
                    blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, 0);
                }

                setBlogs(blogsData.blogs || blogsData.items || []);
                const total = blogsData.total || 0;
                setTotalBlogs(total);
                setTotalPages(Math.ceil(total / blogsPerPage));
            } catch (err) {
                console.error("Failed to reload blogs", err);
            }
        }
    };

    const handleEditBlog = (e, blog) => {
        e.stopPropagation(); // Prevent navigation
        setEditingBlog(blog);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handleDeleteClick = (e, blog) => {
        e.stopPropagation(); // Prevent navigation
        setDeletingBlog(blog);
    };

    const handleConfirmDeleteBlog = async (blog) => {
        try {
            await deleteBlog(blog._id);

            // Reload blogs after deletion
            setPage(1);
            if (profile?._id) {
                let blogsData;
                // Admin fetches all blogs, regular users fetch only their blogs
                if (profile.role === 'admin') {
                    blogsData = await fetchBlogs(blogsPerPage, 0);
                } else {
                    blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, 0);
                }

                setBlogs(blogsData.blogs || blogsData.items || []);
                const total = blogsData.total || 0;
                setTotalBlogs(total);
                setTotalPages(Math.ceil(total / blogsPerPage));
            }
            setDeletingBlog(null);
        } catch (err) {
            alert(`Failed to delete blog: ${err.message}`);
        }
    };

    // Load users when admin switches to users tab
    useEffect(() => {
        if (profile?.role === 'admin' && activeTab === 'users') {
            const loadUsers = async () => {
                setUsersLoading(true);
                try {
                    const offset = (userPage - 1) * usersPerPage;
                    const data = await fetchUsers(usersPerPage, offset);

                    setUsers(data.users || []);
                    setTotalUsers(data.total || 0);
                    setUserTotalPages(Math.ceil((data.total || 0) / usersPerPage));
                } catch (err) {
                    console.error('Failed to load users', err);
                } finally {
                    setUsersLoading(false);
                }
            };

            loadUsers();
        }
    }, [profile, activeTab, userPage]);

    // Fetch initial stats for Admin
    useEffect(() => {
        if (profile?.role === 'admin' && totalUsers === 0) {
            fetchUsers(1, 0).then(data => {
                setTotalUsers(data.total || 0);
            }).catch(err => console.error("Failed to load user stats", err));
        }
    }, [profile]);



    const handleDeleteUserCheck = (e, user) => {
        // Prevent deleting yourself
        if (user._id === profile._id) {
            alert('You cannot delete your own account!');
            return;
        }
        setDeletingUser(user);
    };

    const handleConfirmDeleteUser = async (user) => {
        try {
            await deleteUser(user._id);
            setDeletingUser(null);

            // Reload users after deletion
            setUserPage(1);
            const data = await fetchUsers(usersPerPage, 0);
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
            setUserTotalPages(Math.ceil((data.total || 0) / usersPerPage));
        } catch (err) {
            alert(`Failed to delete user: ${err.message}`);
        }
    };

    const handleUserPrevPage = () => {
        if (userPage > 1) setUserPage(userPage - 1);
    };

    const handleUserNextPage = () => {
        if (userPage < userTotalPages) setUserPage(userPage + 1);
    };


    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return <div className="no-blogs">User not found</div>;

    const { socialLinks } = profile;

    return (
        <>
            {profile.role === 'admin' ? (
                <div className="admin-dashboard-container">
                    <div className="admin-sidebar">
                        <h2>🛡️ Admin Panel</h2>
                        <div
                            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Overview
                        </div>
                        <div
                            className={`admin-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('blogs')}
                        >
                            📝 Manage Blogs
                        </div>
                        <div
                            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 Manage Users
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <div className="admin-nav-item" onClick={() => navigate('/')}>
                                🏠 Home
                            </div>
                            <div className="admin-nav-item" onClick={() => setIsEditModalOpen(true)}>
                                ⚙️ My Settings
                            </div>
                        </div>
                    </div>

                    <div className="admin-main-content">
                        <div className="admin-header">
                            <h1>Welcome back, {profile.firstName}</h1>
                            <div className="user-info">
                                <span>{profile.email}</span>
                                <span className="status-badge admin-badge">ADMIN</span>
                            </div>
                        </div>

                        {/* Overview / Stats Tab */}
                        {activeTab === 'overview' && (
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>📝</div>
                                    <div className="stat-info">
                                        <h3>Total Blogs</h3>
                                        <span className="value">{totalBlogs}</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>👥</div>
                                    <div className="stat-info">
                                        <h3>Total Users</h3>
                                        <span className="value">{totalUsers}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blogs Management Tab */}
                        {activeTab === 'blogs' && (
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Status</th>
                                            <th>Views</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blogs.map(blog => (
                                            <tr key={blog._id}>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>{blog.title}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{blog.slug}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-tag ${blog.status}`}>{blog.status}</span>
                                                </td>
                                                <td>{blog.viewsCount || 0}</td>
                                                <td>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-btn-group">
                                                        <button
                                                            className="table-action-btn btn-edit"
                                                            onClick={(e) => handleEditBlog(e, blog)}
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="table-action-btn btn-delete"
                                                            onClick={(e) => handleDeleteClick(e, blog)}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {blogs.length === 0 && <div className="no-blogs">No blogs found.</div>}

                                {totalPages > 1 && (
                                    <div className="pagination-controls">
                                        <button onClick={handlePrevPage} disabled={page === 1} className="page-btn">Previous</button>
                                        <span className="page-info">Page {page} of {totalPages}</span>
                                        <button onClick={handleNextPage} disabled={page === totalPages} className="page-btn">Next</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Management Tab */}
                        {activeTab === 'users' && (
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>{user.username}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-tag ${user.role === 'admin' ? 'admin-badge' : ''}`}>{user.role}</span>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-btn-group">
                                                        <button
                                                            className="table-action-btn btn-delete"
                                                            onClick={(e) => handleDeleteUserCheck(e, user)}
                                                            disabled={user._id === profile._id}
                                                            title="Delete"
                                                            style={user._id === profile._id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && <div className="no-blogs">No users found.</div>}

                                {userTotalPages > 1 && (
                                    <div className="pagination-controls">
                                        <button onClick={handleUserPrevPage} disabled={userPage === 1} className="page-btn">Previous</button>
                                        <span className="page-info">Page {userPage} of {userTotalPages}</span>
                                        <button onClick={handleUserNextPage} disabled={userPage === userTotalPages} className="page-btn">Next</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Regular User Profile Layout */
                <div className="dashboard-container">
                    <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

                    <div className="profile-card">
                        <div className="profile-header">
                            <h1>{profile.firstName} {profile.lastName}</h1>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="edit-profile-btn"
                                >
                                    ✏️ Edit Profile
                                </button>
                                <span className="status-badge">{profile.role}</span>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <span className="label">Email</span>
                                <span className="value">{profile.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Joined</span>
                                <span className="value">{new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {socialLinks && Object.keys(socialLinks).length > 0 && (
                            <div className="social-links-section">
                                <h3>Social Links</h3>
                                <div className="social-links-grid">
                                    {Object.entries(socialLinks).map(([platform, url]) => (
                                        url ? (
                                            <a key={platform} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                            </a>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-blogs-section">
                        <h2>My Blogs ({blogs.length})</h2>
                        {blogsLoading ? (
                            <div className="loading">Loading blogs...</div>
                        ) : blogs.length > 0 ? (
                            <div className="blog-grid">
                                {blogs.map(blog => (
                                    <div key={blog._id} className="blog-card blog-card-with-edit" onClick={() => navigate(`/blog/${blog.slug}`)} style={{ cursor: 'pointer' }}>
                                        <div className="blog-card-actions">
                                            <button
                                                className="edit-blog-btn"
                                                onClick={(e) => handleEditBlog(e, blog)}
                                                title="Edit blog"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="delete-blog-btn"
                                                onClick={(e) => handleDeleteClick(e, blog)}
                                                title="Delete blog"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        {blog.banner?.url && (
                                            <img
                                                src={blog.banner.url}
                                                alt={blog.title}
                                                className="blog-card-banner"
                                            />
                                        )}
                                        <div className="blog-card-content">
                                            <h3>{blog.title}</h3>
                                            <p className="blog-excerpt">
                                                {blog.content?.substring(0, 120)}
                                                {blog.content?.length > 120 ? '...' : ''}
                                            </p>
                                            <div className="blog-meta">
                                                <span className={`status-tag ${blog.status}`}>{blog.status}</span>
                                                <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-blogs">No blogs yet. Create your first blog post!</div>
                        )}
                        {blogs.length > 0 && totalPages > 1 && (
                            <div className="pagination-controls">
                                <button onClick={handlePrevPage} disabled={page === 1} className="page-btn">← Previous</button>
                                <span className="page-info">Page {page} of {totalPages}</span>
                                <button onClick={handleNextPage} disabled={page === totalPages} className="page-btn">Next →</button>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                onSuccess={handleProfileUpdate}
            />

            <EditBlogModal
                isOpen={!!editingBlog}
                onClose={() => setEditingBlog(null)}
                blog={editingBlog}
                onSuccess={handleBlogUpdate}
            />

            <DeleteBlogModal
                isOpen={!!deletingBlog}
                onClose={() => setDeletingBlog(null)}
                blog={deletingBlog}
                onConfirm={handleConfirmDeleteBlog}
            />

            <DeleteUserModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                user={deletingUser}
                onConfirm={handleConfirmDeleteUser}
            />
        </>
    );
};

export default Profile;

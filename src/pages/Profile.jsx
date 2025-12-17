import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthData } from '../services/auth';
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

    const handleProfileUpdate = () => {
        // Reload profile from localStorage after update
        const { user } = getAuthData();
        if (user) {
            setProfile(user);
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
        <div className="dashboard-container">
            <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

            {/* Profile Card - Shows first */}
            <div className={`profile-card ${profile.role === 'admin' ? 'admin-profile' : ''}`}>
                <div className="profile-header">
                    <h1>{profile.firstName} {profile.lastName}</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="edit-profile-btn"
                        >
                            ✏️ Edit Profile
                        </button>
                        <span className={`status-badge ${profile.role === 'admin' ? 'admin-badge' : ''}`}>{profile.role}</span>
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
                            {Object.entries(socialLinks).map(([platform, url]) => {
                                if (!url) return null;

                                // Sanitize URL: Ensure it starts with http:// or https://
                                let safeUrl = url;
                                if (!/^https?:\/\//i.test(url)) {
                                    // If it's a javascript: URI, ignore it or make it safe
                                    if (/^javascript:/i.test(url)) {
                                        return null; // Do not render dangerous links
                                    }
                                    // Assume it's a domain and prepend https://
                                    safeUrl = `https://${url}`;
                                }

                                return (
                                    <a key={platform} href={safeUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Dashboard Panel - Only visible for admin users, positioned after profile */}
            {profile.role === 'admin' && (
                <div className="admin-dashboard-panel">
                    <div className="admin-dashboard-header">
                        <h2>🛡️ Admin Control Panel</h2>
                        <p className="admin-dashboard-subtitle">Manage your blog platform</p>
                    </div>
                    <div className="admin-management-buttons">
                        <button
                            className={`management-btn ${activeTab === 'blogs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('blogs')}
                        >
                            <span className="management-btn-icon">📝</span>
                            <span className="management-btn-text">Manage Blogs</span>
                        </button>
                        <button
                            className={`management-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <span className="management-btn-icon">👥</span>
                            <span className="management-btn-text">Manage Users</span>
                        </button>
                    </div>

                </div>
            )}

            {/* Management Section - Shows blogs or users based on activeTab */}
            {profile.role === 'admin' ? (
                <div className="profile-blogs-section">
                    <h2>
                        {activeTab === 'blogs' ? `All Blogs (${blogs.length})` : `All Users (${totalUsers})`}
                    </h2>

                    {/* Blogs Tab Content */}
                    {activeTab === 'blogs' && (
                        <>
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
                                                <div className="blog-stats">
                                                    <span>👁️ {blog.viewsCount || 0}</span>
                                                    <span>❤️ {blog.likesCount || 0}</span>
                                                    <span>💬 {blog.commentCount || 0}</span>
                                                </div>
                                                <div className="blog-meta">
                                                    <span className={`status-tag ${blog.status}`}>{blog.status}</span>
                                                    <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-blogs">No blogs yet.</div>
                            )}

                            {blogs.length > 0 && totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={page === 1}
                                        className="page-btn"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="page-info">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={page === totalPages}
                                        className="page-btn"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Users Tab Content */}
                    {activeTab === 'users' && (
                        <>
                            {usersLoading ? (
                                <div className="loading">Loading users...</div>
                            ) : users.length > 0 ? (
                                <div className="blog-grid">
                                    {users.map(user => (
                                        <div key={user._id} className="blog-card" style={{ cursor: 'default' }}>
                                            <div className="blog-card-actions">
                                                <button
                                                    className="delete-blog-btn"
                                                    onClick={(e) => handleDeleteUserCheck(e, user)}
                                                    title="Delete user"
                                                    disabled={user._id === profile._id}
                                                    style={user._id === profile._id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="blog-card-content">
                                                <h3>{user.firstName || user.username} {user.lastName || ''}</h3>
                                                <p className="blog-excerpt">
                                                    {user.email}
                                                </p>
                                                <div className="blog-meta">
                                                    <span className={`status-tag ${user.role === 'admin' ? 'admin-badge' : ''}`}>
                                                        {user.role}
                                                    </span>
                                                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                                                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                                        {Object.keys(user.socialLinks).length} social link(s)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-blogs">No users found</div>
                            )}

                            {users.length > 0 && userTotalPages > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        onClick={handleUserPrevPage}
                                        disabled={userPage === 1}
                                        className="page-btn"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="page-info">
                                        Page {userPage} of {userTotalPages}
                                    </span>
                                    <button
                                        onClick={handleUserNextPage}
                                        disabled={userPage === userTotalPages}
                                        className="page-btn"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* Regular User Blogs Section */
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
                                        <div className="blog-stats">
                                            <span>👁️ {blog.viewsCount || 0}</span>
                                            <span>❤️ {blog.likesCount || 0}</span>
                                            <span>💬 {blog.commentCount || 0}</span>
                                        </div>
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
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="page-btn"
                            >
                                ← Previous
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages}
                                className="page-btn"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}

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
        </div>
    );
};

export default Profile;

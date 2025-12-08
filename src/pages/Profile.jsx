import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../services/auth';
import { fetchBlogsByUserId, deleteBlog } from '../services/blogs';
import EditProfileModal from '../components/EditProfileModal';
import EditBlogModal from '../components/EditBlogModal';
import '../index.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogsLoading, setBlogsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const blogsPerPage = 6;

    useEffect(() => {
        const loadProfile = async () => {
            console.log("Starting loadProfile...");
            try {
                console.log("Calling fetchCurrentUser...");
                const data = await fetchCurrentUser();
                console.log("fetchCurrentUser success:", data);
                // API returns { user: { ... } }
                const userData = data.user || data;
                setProfile(userData);

                console.log("User ID:", userData?._id);

                // Fetch user's blogs after profile is loaded
                if (userData?._id) {
                    setBlogsLoading(true);
                    try {
                        console.log("Fetching blogs for user ID:", userData._id);
                        const offset = (page - 1) * blogsPerPage;
                        const blogsData = await fetchBlogsByUserId(userData._id, blogsPerPage, offset);
                        console.log("User blogs:", blogsData);
                        setBlogs(blogsData.blogs || blogsData.items || []);
                        const total = blogsData.total || 0;
                        setTotalPages(Math.ceil(total / blogsPerPage));
                    } catch (blogErr) {
                        console.error("Failed to load blogs", blogErr);
                    } finally {
                        setBlogsLoading(false);
                    }
                } else {
                    console.log("No user ID found in userData:", userData);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                if (err.message === 'Unauthorized' || err.message === 'Access denied') {
                    navigate('/login');
                } else {
                    setError('Failed to load profile info.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    // Reload blogs when page changes
    useEffect(() => {
        if (profile?._id) {
            const loadBlogsPage = async () => {
                setBlogsLoading(true);
                try {
                    const offset = (page - 1) * blogsPerPage;
                    const blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, offset);
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

    const handleProfileUpdate = async () => {
        // Reload profile after update
        try {
            const data = await fetchCurrentUser();
            const userData = data.user || data;
            setProfile(userData);
        } catch (err) {
            console.error("Failed to reload profile", err);
        }
    };

    const handleBlogUpdate = async () => {
        // Reload blogs after update and reset to page 1
        setPage(1);
        if (profile?._id) {
            try {
                const blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, 0);
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

    const handleDeleteBlog = async (e, blog) => {
        e.stopPropagation(); // Prevent navigation

        const confirmed = window.confirm(`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`);

        if (!confirmed) return;

        try {
            await deleteBlog(blog._id);

            // Reload blogs after deletion
            setPage(1);
            if (profile?._id) {
                const blogsData = await fetchBlogsByUserId(profile._id, blogsPerPage, 0);
                setBlogs(blogsData.blogs || blogsData.items || []);
                const total = blogsData.total || 0;
                setTotalPages(Math.ceil(total / blogsPerPage));
            }
        } catch (err) {
            alert(`Failed to delete blog: ${err.message}`);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return <div className="no-blogs">User not found</div>;

    const { socialLinks } = profile;

    return (
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
                        <span className="label">Username</span>
                        <span className="value">{profile.username}</span>
                    </div>
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
                                url && (
                                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User's Blogs Section */}
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
                                        onClick={(e) => handleDeleteBlog(e, blog)}
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
        </div>
    );
};

export default Profile;

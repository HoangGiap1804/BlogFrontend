import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogs } from '../services/blogs';
import { getAuthData } from '../services/auth';
import '../index.css';

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { user } = getAuthData();
    const limit = 12;

    useEffect(() => {
        const loadBlogs = async () => {
            setLoading(true);
            try {
                const offset = (page - 1) * limit;
                const data = await fetchBlogs(limit, offset);
                // API returns { blogs: [...], total: ..., limit: ..., offset: ... }
                setBlogs(data.blogs || []);
                const total = data.total || 0;
                setTotalPages(Math.ceil(total / limit));
            } catch (err) {
                if (err.message === 'Unauthorized' || err.message === 'No access token found') {
                    navigate('/login');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        loadBlogs();
    }, [navigate, page]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    if (loading && page === 1 && blogs.length === 0) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Blog Dashboard</h1>
                <div className="user-info">
                    <span onClick={() => navigate('/profile')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        Welcome, {user?.username || user?.email || 'User'}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            <main className="blog-grid">
                {blogs.length === 0 && !loading ? (
                    <p className="no-blogs">No blogs found.</p>
                ) : (
                    blogs.map((blog) => (
                        <article key={blog._id} className="blog-card" onClick={() => navigate(`/blog/${blog.slug}`)} style={{ cursor: 'pointer' }}>
                            <h3>{blog.title}</h3>
                            <p className="blog-excerpt">{blog.content || 'No content'}</p>
                            <div className="blog-meta">
                                <span>By {blog.author?.username || blog.author?.email || 'Unknown'}</span>
                            </div>
                        </article>
                    ))
                )}
            </main>

            {blogs.length > 0 && (
                <div className="pagination-controls">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="page-btn"
                    >
                        &larr; Previous
                    </button>
                    <span className="page-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        className="page-btn"
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;

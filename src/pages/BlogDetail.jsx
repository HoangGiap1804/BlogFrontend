import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBlogBySlug, likeBlog } from '../services/blogs';
import { fetchComments, createComment } from '../services/comments';
import { getAuthData } from '../services/auth';
import '../index.css';

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = getAuthData();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchBlogBySlug(slug);
                const blogData = data.blog || data;
                setBlog(blogData);

                if (blogData && blogData._id) {
                    const commentsData = await fetchComments(blogData._id);
                    setComments(commentsData.comments || []);
                }
            } catch (err) {
                console.error("Error loading details:", err);
                if (err.message === 'Unauthorized' || err.message === 'No access token found') {
                    navigate('/login');
                } else {
                    setError('Failed to load blog details.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug, navigate]);

    const handleLike = async () => {
        try {
            const updatedBlog = await likeBlog(blog._id);
            if (updatedBlog && updatedBlog._id) {
                setBlog(updatedBlog);
            } else {
                setBlog({ ...blog, likesCount: (blog.likesCount || 0) + 1 });
            }
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // Using createComment from service
            const addedComment = await createComment(blog._id, newComment);
            // Re-fetch comments to ensure we get the latest list in correct format
            const commentsData = await fetchComments(blog._id);
            setComments(commentsData.comments || []);
            setNewComment('');

            // Optimistically update comment count
            setBlog(prevBlog => ({
                ...prevBlog,
                commentCount: (prevBlog.commentCount || 0) + 1
            }));

        } catch (err) {
            console.error('Failed to post comment', err);
            alert('Failed to post comment');
        }
    };

    if (loading) return <div className="loading">Loading details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!blog) return <div className="no-blogs">Blog not found.</div>;

    return (
        <div className="dashboard-container">
            <button className="back-btn" onClick={() => navigate('/')}>&larr; Back to Dashboard</button>

            <article className="blog-detail-card">
                {blog.banner && blog.banner.url && (
                    <div className="blog-banner-container">
                        <img src={blog.banner.url} alt={blog.title} className="blog-banner" />
                    </div>
                )}

                <header className="blog-detail-header">
                    <h1>{blog.title}</h1>
                    <div className="blog-meta-grid">
                        <div className="meta-item">
                            <span className="label">Author ID:</span>
                            <span className="value">{blog.authorId}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Published:</span>
                            <span className="value">{new Date(blog.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Status:</span>
                            <span className="value status-badge">{blog.status}</span>
                        </div>
                    </div>
                </header>

                <div className="blog-content">
                    {blog.content}
                </div>

                <div className="blog-stats-bar">
                    <div className="stat">
                        <span className="stat-label">Views</span>
                        <span className="stat-value">{blog.viewsCount}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Likes</span>
                        <span className="stat-value">{blog.likesCount}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Comments</span>
                        <span className="stat-value">{blog.commentCount}</span>
                    </div>
                </div>

                <div className="blog-actions">
                    <button onClick={handleLike} className="like-btn">
                        ❤️ Like
                    </button>
                </div>
            </article>

            <section className="comments-section">
                <h3>Comments ({comments.length})</h3>

                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        required
                    />
                    <button type="submit" className="comment-btn">Post Comment</button>
                </form>

                <div className="comments-list">
                    {comments.map((comment, index) => (
                        <div key={comment._id || index} className="comment-item">
                            <div className="comment-header">
                                <strong>User: {comment.userId || 'Anonymous'}</strong>
                            </div>
                            <DangerousComment html={comment.comment} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const DangerousComment = ({ html }) => {
    const ref = React.useRef(null);

    React.useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = '';
            const range = document.createRange();
            range.selectNodeContents(ref.current);
            // createContextualFragment executes scripts
            const fragment = range.createContextualFragment(html);
            ref.current.appendChild(fragment);
        }
    }, [html]);

    return <div ref={ref} />;
};

export default BlogDetail;

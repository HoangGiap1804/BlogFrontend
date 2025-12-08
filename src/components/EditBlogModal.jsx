import { useState } from 'react';
import { updateBlog } from '../services/blogs';
import '../index.css';

const EditBlogModal = ({ isOpen, onClose, blog, onSuccess }) => {
    const [title, setTitle] = useState(blog?.title || '');
    const [content, setContent] = useState(blog?.content || '');
    const [status, setStatus] = useState(blog?.status || 'draft');
    const [bannerImage, setBannerImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('status', status);
            if (bannerImage) {
                formData.append('banner_image', bannerImage);
            }

            await updateBlog(blog._id, formData);

            // Notify parent component
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Blog</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="blog-form">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter blog title"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content *</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your blog content..."
                            rows="10"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="banner_image">Banner Image</label>
                        <input
                            type="file"
                            id="banner_image"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        {bannerImage && (
                            <p className="file-name">New image: {bannerImage.name}</p>
                        )}
                        {!bannerImage && blog?.banner?.url && (
                            <p className="file-name">Current: {blog.banner.url.split('/').pop()}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status *</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Blog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlogModal;

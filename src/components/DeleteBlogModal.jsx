import React from 'react';
import '../index.css';

const DeleteBlogModal = ({ isOpen, onClose, blog, onConfirm }) => {
    if (!isOpen || !blog) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ color: '#dc3545' }}>Delete Blog</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="blog-form">
                    <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                        Are you sure you want to delete this blog? This action cannot be undone.
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-title">Title</label>
                        <input
                            type="text"
                            id="delete-title"
                            value={blog.title}
                            disabled={true}
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-content">Content</label>
                        <textarea
                            id="delete-content"
                            value={blog.content}
                            rows="5"
                            disabled={true}
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-status">Status</label>
                        <input
                            type="text"
                            id="delete-status"
                            value={blog.status}
                            disabled={true}
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', textTransform: 'capitalize' }}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(blog)}
                            className="submit-btn"
                            style={{ backgroundColor: '#dc3545' }}
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteBlogModal;

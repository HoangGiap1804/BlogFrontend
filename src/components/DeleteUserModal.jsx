import React from 'react';
import '../index.css';

const DeleteUserModal = ({ isOpen, onClose, user, onConfirm }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ color: '#dc3545' }}>Delete User</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="blog-form">
                    <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-username">Username</label>
                        <input
                            type="text"
                            id="delete-username"
                            value={user.username}
                            disabled={true}
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-email">Email</label>
                        <input
                            type="email"
                            id="delete-email"
                            value={user.email}
                            disabled={true}
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="delete-role">Role</label>
                        <input
                            type="text"
                            id="delete-role"
                            value={user.role}
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
                            onClick={() => onConfirm(user)}
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

export default DeleteUserModal;

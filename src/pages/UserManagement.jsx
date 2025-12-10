import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../services/auth';
import { fetchUsers, deleteUser } from '../services/users';
import EditUserModal from '../components/EditUserModal';
import '../index.css';

const UserManagement = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const usersPerPage = 10;

    // Check if user is admin
    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const data = await fetchCurrentUser();
                const userData = data.user || data;
                setCurrentUser(userData);

                // Redirect non-admin users
                if (userData.role !== 'admin') {
                    navigate('/');
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to load user', err);
                navigate('/login');
            }
        };

        checkAdminAccess();
    }, [navigate]);

    // Fetch users when component mounts or page changes
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            const loadUsers = async () => {
                setUsersLoading(true);
                try {
                    const offset = (page - 1) * usersPerPage;
                    const data = await fetchUsers(usersPerPage, offset);

                    setUsers(data.users || []);
                    setTotal(data.total || 0);
                    setTotalPages(Math.ceil((data.total || 0) / usersPerPage));
                } catch (err) {
                    console.error('Failed to load users', err);
                    setError('Failed to load users. ' + err.message);
                } finally {
                    setUsersLoading(false);
                }
            };

            loadUsers();
        }
    }, [currentUser, page]);

    const handleUserUpdate = async () => {
        // Reload users after update and reset to page 1
        setPage(1);
        try {
            const data = await fetchUsers(usersPerPage, 0);
            setUsers(data.users || []);
            setTotal(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / usersPerPage));
        } catch (err) {
            console.error('Failed to reload users', err);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleDeleteUser = async (user) => {
        // Prevent deleting yourself
        if (user._id === currentUser._id) {
            alert('You cannot delete your own account!');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteUser(user._id);

            // Reload users after deletion
            setPage(1);
            const data = await fetchUsers(usersPerPage, 0);
            setUsers(data.users || []);
            setTotal(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / usersPerPage));
        } catch (err) {
            alert(`Failed to delete user: ${err.message}`);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!currentUser || currentUser.role !== 'admin') {
        return <div className="error-message">Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="dashboard-container">
            <button className="back-btn" onClick={() => navigate('/profile')}>← Back to Profile</button>

            <div className="admin-dashboard-panel" style={{ marginTop: '1rem' }}>
                <div className="admin-dashboard-header">
                    <h2>👥 User Management</h2>
                    <p className="admin-dashboard-subtitle">Manage all users ({total} total)</p>
                </div>
            </div>

            {usersLoading ? (
                <div className="loading">Loading users...</div>
            ) : users.length > 0 ? (
                <>
                    <div className="blog-grid">
                        {users.map(user => (
                            <div key={user._id} className="blog-card" style={{ cursor: 'default' }}>
                                <div className="blog-card-actions">
                                    <button
                                        className="edit-blog-btn"
                                        onClick={() => handleEditUser(user)}
                                        title="Edit user"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="delete-blog-btn"
                                        onClick={() => handleDeleteUser(user)}
                                        title="Delete user"
                                        disabled={user._id === currentUser._id}
                                        style={user._id === currentUser._id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="blog-card-content">
                                    <h3>{user.firstName || user.username} {user.lastName || ''}</h3>
                                    <p className="blog-excerpt">
                                        <strong>@{user.username}</strong><br />
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

                    {totalPages > 1 && (
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
            ) : (
                <div className="no-blogs">No users found</div>
            )}

            <EditUserModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onSuccess={handleUserUpdate}
            />
        </div>
    );
};

export default UserManagement;

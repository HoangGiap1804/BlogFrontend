import { useState, useEffect } from 'react';
import { updateUser } from '../services/users';
import '../index.css';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState(user?.role || 'user');
    const [socialLinks, setSocialLinks] = useState({
        facebook: user?.socialLinks?.facebook || '',
        instagram: user?.socialLinks?.instagram || '',
        x: user?.socialLinks?.x || '',
        youtube: user?.socialLinks?.youtube || '',
        website: user?.socialLinks?.website || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update form when user prop changes
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setRole(user.role || 'user');
            setSocialLinks({
                facebook: user.socialLinks?.facebook || '',
                instagram: user.socialLinks?.instagram || '',
                x: user.socialLinks?.x || '',
                youtube: user.socialLinks?.youtube || '',
                website: user.socialLinks?.website || ''
            });
        }
    }, [user]);

    const handleSocialLinkChange = (platform, value) => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userData = {
                firstName,
                lastName,
                email,
                role,
                ...Object.keys(socialLinks).reduce((acc, key) => {
                    acc[`socialLinks.${key}`] = socialLinks[key];
                    return acc;
                }, {})
            };

            await updateUser(user._id, userData);

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
                    <h2>Edit User</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="profile-form">


                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                            disabled={true}
                            title="Email cannot be changed"
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-section">
                        <h3>Social Links (Optional)</h3>

                        <div className="form-group">
                            <label htmlFor="facebook">Facebook</label>
                            <input
                                type="url"
                                id="facebook"
                                value={socialLinks.facebook}
                                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                placeholder="https://facebook.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="instagram">Instagram</label>
                            <input
                                type="url"
                                id="instagram"
                                value={socialLinks.instagram}
                                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                placeholder="https://instagram.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="x">X (Twitter)</label>
                            <input
                                type="url"
                                id="x"
                                value={socialLinks.x}
                                onChange={(e) => handleSocialLinkChange('x', e.target.value)}
                                placeholder="https://x.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="youtube">YouTube</label>
                            <input
                                type="url"
                                id="youtube"
                                value={socialLinks.youtube}
                                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                                placeholder="https://youtube.com/@username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="website">Website</label>
                            <input
                                type="url"
                                id="website"
                                value={socialLinks.website}
                                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                                placeholder="https://example.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;

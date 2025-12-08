import { useState } from 'react';
import { updateProfile } from '../services/auth';
import '../index.css';

const EditProfileModal = ({ isOpen, onClose, profile, onSuccess }) => {
    const [username, setUsername] = useState(profile?.username || '');
    const [firstName, setFirstName] = useState(profile?.firstName || '');
    const [lastName, setLastName] = useState(profile?.lastName || '');
    const [facebook, setFacebook] = useState(profile?.socialLinks?.facebook || '');
    const [instagram, setInstagram] = useState(profile?.socialLinks?.instagram || '');
    const [youtube, setYoutube] = useState(profile?.socialLinks?.youtube || '');
    const [x, setX] = useState(profile?.socialLinks?.x || '');
    const [website, setWebsite] = useState(profile?.socialLinks?.website || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updateData = {
                username,
                first_name: firstName,
                last_name: lastName,
                facebook,
                instagram,
                youtube,
                x,
                website
            };

            await updateProfile(updateData);

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
                    <h2>Edit Profile</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={loading}
                        />
                    </div>

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

                    <div className="form-section">
                        <h3>Social Links</h3>

                        <div className="form-group">
                            <label htmlFor="facebook">Facebook</label>
                            <input
                                type="url"
                                id="facebook"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="https://facebook.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="instagram">Instagram</label>
                            <input
                                type="url"
                                id="instagram"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="https://instagram.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="youtube">YouTube</label>
                            <input
                                type="url"
                                id="youtube"
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder="https://youtube.com/@username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="x">X (Twitter)</label>
                            <input
                                type="url"
                                id="x"
                                value={x}
                                onChange={(e) => setX(e.target.value)}
                                placeholder="https://x.com/username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="website">Website</label>
                            <input
                                type="url"
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://yourwebsite.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;

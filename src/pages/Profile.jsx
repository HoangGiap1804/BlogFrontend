import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../services/auth';
import '../index.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            console.log("Starting loadProfile...");
            try {
                console.log("Calling fetchCurrentUser...");
                const data = await fetchCurrentUser();
                console.log("fetchCurrentUser success:", data);
                // API returns { user: { ... } }
                setProfile(data.user || data);
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

    if (loading) return <div className="loading">Loading profile...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile) return <div className="no-blogs">User not found</div>;

    const { socialLinks } = profile;

    return (
        <div className="dashboard-container">
            <button className="back-btn" onClick={() => navigate('/')}>&larr; Back to Dashboard</button>

            <div className="profile-card">
                <div className="profile-header">
                    <h1>{profile.firstName} {profile.lastName}</h1>
                    <span className="status-badge">{profile.role}</span>
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
        </div>
    );
};

export default Profile;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, saveAuthData, fetchCurrentUser } from '../services/auth';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await loginUser(email, password);
            saveAuthData(data);

            // Fetch full user profile to ensure we have latest data in localStorage
            try {
                const userProfile = await fetchCurrentUser();
                const detailedUser = userProfile.user || userProfile;
                saveAuthData({ ...data, user: detailedUser });
                console.log('User profile fetched and saved:', detailedUser);
                alert(`Login Successful! Welcome ${detailedUser.username || detailedUser.email}`);
            } catch (profileErr) {
                console.warn('Failed to fetch detailed profile on login:', profileErr);
                // Fallback to basic data if available, or just proceed
                alert(`Login Successful! Welcome ${data.user?.username || 'User'}`);
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Please login to your account</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

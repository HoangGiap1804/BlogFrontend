import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BlogDetail from './pages/BlogDetail';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [role, setRole] = useState('Manager');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Mock Auth: Real mein yahan JWT token aayega
        localStorage.setItem('userRole', role);
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6">LogiAgent Login</h2>
                <select 
                    onChange={(e) => setRole(e.target.value)} 
                    className="w-full p-2 mb-4 border rounded"
                >
                    <option value="Manager">Manager</option>
                    <option value="Validator">Validator</option>
                    <option value="Owner">Owner</option>
                </select>
                <button 
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;
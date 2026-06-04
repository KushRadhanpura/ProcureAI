import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, KeyRound, Mail, User, Building, Compass } from 'lucide-react';

const API_BASE_URL = 'https://procureai-zspz.onrender.com';

const Logo = ({ light = false, showSubtitle = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      <svg className={`w-10 h-10 flex-shrink-0 ${light ? 'text-white' : 'text-blue-600'}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 78 A28 28 0 1 1 68 50 C68 62 60 72 48 76" />
        <path d="M40 88 A38 38 0 1 1 78 50 C78 66 66 80 50 86" strokeWidth="2.2" />
        <path d="M40 98 A48 48 0 1 1 88 50" strokeWidth="1.5" />
        <path d="M40 50v48M30 60v38M20 70v28" strokeWidth="2.5" />
        <circle cx="40" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="40" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="30" cy="60" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="30" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="70" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="98" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="68" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="78" cy="50" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="48" cy="22" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="50" cy="12" r="3.2" fill="currentColor" stroke="none" />
        <path d="M35 65 L60 40 M46 40 H60 V54" strokeWidth="5.5" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-baseline text-base font-extrabold tracking-tight leading-none uppercase">
          <span className={light ? 'text-white' : 'text-slate-800'}>Procure</span>
          <span className="text-blue-500 ml-0.5">AI</span>
        </div>
        {showSubtitle && (
          <span className={`text-[6px] font-bold tracking-widest uppercase mt-1 leading-none ${light ? 'text-slate-500' : 'text-slate-400'}`}>
            Autonomous Procurement Network
          </span>
        )}
      </div>
    </div>
  );
};

const Login = ({ onLoginSuccess, onBackToHome, inline = false }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    isRegister: false,
    name: '',
    companyName: '',
    role: 'Manager'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = form.isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = form.isRegister
        ? { name: form.name, email: form.email, password: form.password, companyName: form.companyName, role: form.role }
        : { email: form.email, password: form.password };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <div className="flex border-b border-slate-100 mb-6">
        <button
          type="button"
          onClick={() => setForm({ ...form, isRegister: false })}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition ${
            !form.isRegister ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, isRegister: true })}
          className={`flex-1 pb-3 text-sm font-semibold text-center transition ${
            form.isRegister ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Register Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {form.isRegister && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-850 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-850 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Platform Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Compass className="w-4 h-4" />
                </span>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-850"
                >
                  <option value="Manager">Manager</option>
                  <option value="Owner">Owner</option>
                  <option value="Validator">Validator</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-850 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <KeyRound className="w-4 h-4" />
            </span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm text-slate-850 bg-white"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-100 transition disabled:bg-slate-300 text-sm mt-2 font-sans"
        >
          {loading ? 'Processing...' : form.isRegister ? 'Register' : 'Login'}
        </button>
      </form>
    </div>
  );

  if (inline) {
    return formContent;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden px-4 sm:px-6">
      {/* Decorative AI/Automation Tech Grid Mesh Backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-0 bg-repeat bg-center" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: '1200px'
        }} 
      />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-150 p-8 relative z-10">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </div>
        
        <div className="flex justify-center mb-8">
          <Logo showSubtitle={true} />
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default Login;

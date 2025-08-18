import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="glass-effect p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Cruise Platform</h1>
          <p className="text-white text-opacity-80">
            AI-Powered Entrepreneurship Accelerator
          </p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-l-lg transition-all ${
              isLogin 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-white bg-opacity-10 text-white text-opacity-60'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-r-lg transition-all ${
              !isLogin 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-white bg-opacity-10 text-white text-opacity-60'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="glass-input"
                required
              />
              <input
                type="text"
                name="company"
                placeholder="Company (Optional)"
                value={formData.company}
                onChange={handleChange}
                className="glass-input"
              />
              <input
                type="text"
                name="industry"
                placeholder="Industry (Optional)"
                value={formData.industry}
                onChange={handleChange}
                className="glass-input"
              />
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="glass-input"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="glass-input"
            required
          />

          {error && (
            <div className="text-red-300 text-sm mb-4 p-3 bg-red-500 bg-opacity-20 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-button w-full text-center disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white text-opacity-70 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white underline hover:text-opacity-80"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

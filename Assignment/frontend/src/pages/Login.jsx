import React, { useState } from 'react';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? data.errors.map(e => e.msg).join(', ') : data.error);
      } else {
        setSuccess('Login successful!');
        // Save token to localStorage for session management
        localStorage.setItem('token', data.token);
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold transition">Login</button>
        </form>
        {error && <div className="text-red-600 mt-4 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center font-semibold">{success}</div>}
      </div>
    </div>
  );
};

export default Login;

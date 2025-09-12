import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
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
      const res = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? data.errors.map(e => e.msg).join(', ') : data.error);
      } else {
        setSuccess('Registration successful!');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name (20-60 chars)" value={form.name} onChange={handleChange} required minLength={20} maxLength={60} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input name="address" placeholder="Address (max 400 chars)" value={form.address} onChange={handleChange} required maxLength={400} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <input name="password" type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <select name="role" value={form.role} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="user">Normal User</option>
            <option value="owner">Store Owner</option>
          </select>
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold transition">Register</button>
        </form>
        {error && <div className="text-red-600 mt-4 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center font-semibold">{success}</div>}
      </div>
    </div>
  );
};

export default Register;

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
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name (20-60 chars)" value={form.name} onChange={handleChange} required minLength={20} maxLength={60} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="address" placeholder="Address (max 400 chars)" value={form.address} onChange={handleChange} required maxLength={400} />
        <input name="password" type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Normal User</option>
          <option value="owner">Store Owner</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
};

export default Register;

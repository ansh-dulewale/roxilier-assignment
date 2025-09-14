import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext.jsx";

const Auth = () => {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  // Redirect after login if user context updates
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "owner") {
        navigate("/store-owner");
      } else if (user.role === "user") {
        navigate("/stores");
      } else {
        navigate("/auth");
      }
    }
  }, [user, navigate]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    remember: false,
    address: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (tab === "login") {
      // Use email for login
      try {
        const res = await fetch("http://localhost:3000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors ? data.errors.map(e => e.msg).join(", ") : data.error);
        } else {
          setSuccess("Login successful!");
          localStorage.setItem("token", data.token);
          // Save user info and redirect
          login(data.user); // expects backend to return user object
          console.log("Login role:", data.user.role); // Debug log
          if (data.user.role === "admin") navigate("/admin");
          else if (data.user.role === "owner") navigate("/store-owner");
          else if (data.user.role === "user") navigate("/stores");
          else navigate("/auth");
        }
      } catch {
        setError("Server error");
      }
    } else {
      // Register
      try {
        const res = await fetch("http://localhost:3000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.username,
            email: form.email,
            address: form.address,
            password: form.password,
            role: form.role,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors ? data.errors.map(e => e.msg).join(", ") : data.error);
        } else {
          setSuccess("Registration successful!");
        }
      } catch {
        setError("Server error");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">{tab === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "login" ? (
            <>
              <div className="relative">
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v2m0 4h.01" /></svg></span>
              </div>
              <div className="relative">
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v.01" /></svg></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} /> Remember me
                </label>
                <button type="button" className="text-blue-500 hover:underline">Forgot password?</button>
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold transition">Login</button>
              <div className="text-center text-sm mt-2">Don't have an account? <button type="button" className="text-blue-500 font-semibold hover:underline" onClick={() => setTab("register")}>Register</button></div>
            </>
          ) : (
            <>
              <div className="relative">
                <input name="username" placeholder="Name (20-60 chars)" value={form.username} onChange={handleChange} required minLength={20} maxLength={60} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v2m0 4h.01" /></svg></span>
              </div>
              <div className="relative">
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v2m0 4h.01" /></svg></span>
              </div>
              <div className="relative">
                <input name="address" placeholder="Address (max 400 chars)" value={form.address} onChange={handleChange} required maxLength={400} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v2m0 4h.01" /></svg></span>
              </div>
              <div className="relative">
                <input name="password" type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10" />
                <span className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v.01" /></svg></span>
              </div>
              <select name="role" value={form.role} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="user">Normal User</option>
                <option value="owner">Store Owner</option>
              </select>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold transition">Register</button>
              <div className="text-center text-sm mt-2">Already have an account? <button type="button" className="text-blue-500 font-semibold hover:underline" onClick={() => setTab("login")}>Login</button></div>
            </>
          )}
        </form>
        {error && <div className="text-red-600 mt-4 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center font-semibold">{success}</div>}
      </div>
    </div>
  );
};

export default Auth;

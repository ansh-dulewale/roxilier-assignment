import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeRole = (r) => (r === "store-owner" ? "owner" : r);

  useEffect(() => {
    // Example: get user info from localStorage or API
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const normalized = { ...storedUser, role: normalizeRole(storedUser.role) };
      setUser(normalized);
      setRole(normalized.role);
      // Keep localStorage consistent going forward
      localStorage.setItem("user", JSON.stringify(normalized));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalized = { ...userData, role: normalizeRole(userData.role) };
    setUser(normalized);
    setRole(normalized.role);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    fetch("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).finally(() => {
      setUser(null);
      setRole("");
      localStorage.removeItem("user");
    });
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: get user info from localStorage or API
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setRole(storedUser.role);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("user", JSON.stringify(userData));
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

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import StoreList from './pages/StoreList.jsx';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import Auth from './pages/Auth.jsx';
import './index.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  const { user, role, logout } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 flex flex-wrap gap-4 items-center">
        {!user && <Link to="/auth">Login / Register</Link>}
  {user && role === "user" && <Link to="/stores">User Dashboard</Link>}
  {user && role === "owner" && <Link to="/store-owner">Store Owner Dashboard</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user && role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user && <button className="ml-auto bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Logout</button>}
      </nav>
      <Routes>
  <Route
    path="/auth"
    element={
      !user ? (
        <Auth />
      ) : (
        <Navigate
          to={
            role === "admin"
              ? "/admin"
              : role === "owner"
              ? "/store-owner"
              : role === "user"
              ? "/stores"
              : "/"
          }
          replace
        />
      )
    }
  />
        <Route path="/stores" element={
          <ProtectedRoute allowedRoles={["user"]}>
            <StoreList />
          </ProtectedRoute>
        } />
        <Route path="/store-owner" element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <StoreOwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["user", "admin", "owner"]}>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
  <Route
    path="/"
    element={
      user ? (
        <Navigate
          to={
            role === "admin"
              ? "/admin"
              : role === "owner"
              ? "/store-owner"
              : role === "user"
              ? "/stores"
              : "/auth"
          }
          replace
        />
      ) : (
        <Login />
      )
    }
  />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
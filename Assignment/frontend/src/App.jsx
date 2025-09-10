import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import StoreList from './pages/StoreList.jsx';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { user, role, logout } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100 flex flex-wrap gap-4 items-center">
        {!user && <Link to="/register">Register</Link>}
        {!user && <Link to="/login">Login</Link>}
        {user && <Link to="/stores">Stores</Link>}
        {user && role === "store-owner" && <Link to="/store-owner">Store Owner Dashboard</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user && role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user && <button className="ml-auto bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/stores" element={
          <ProtectedRoute allowedRoles={["user", "admin", "store-owner"]}>
            <StoreList />
          </ProtectedRoute>
        } />
        <Route path="/store-owner" element={
          <ProtectedRoute allowedRoles={["store-owner"]}>
            <StoreOwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["user", "admin", "store-owner"]}>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={user ? <Navigate to={role === "admin" ? "/admin" : role === "store-owner" ? "/store-owner" : "/stores"} /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

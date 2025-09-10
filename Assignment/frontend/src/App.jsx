


import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import StoreList from './pages/StoreList.jsx';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/stores">Stores</Link> | <Link to="/store-owner">Store Owner Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stores" element={<StoreList />} />
        <Route path="/store-owner" element={<StoreOwnerDashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

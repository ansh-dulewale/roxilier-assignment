import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [addStoreForm, setAddStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    ownerAddress: ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Initial fetchers
    const fetchStats = () => {
      fetch("http://localhost:3000/api/v1/admin/dashboard")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    };
    const fetchUsers = () => {
      fetch("http://localhost:3000/api/v1/admin/users")
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(() => {});
    };
    const fetchStores = () => {
      fetch("http://localhost:3000/api/v1/admin/stores")
        .then(res => res.json())
        .then(data => setStores(data.stores || []))
        .catch(() => {});
    };

    // Initial calls
    fetchStats();
    fetchUsers();
    fetchStores();

    // Poll stats and stores every 5 seconds for near real-time updates
    const statsInterval = setInterval(fetchStats, 5000);
    const storesInterval = setInterval(fetchStores, 5000);

    // Live updates via SSE for ratings
    let es;
    try {
      es = new EventSource('http://localhost:3000/api/v1/store/ratings/stream');
      es.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data?.type === 'rating:update' && data.storeId) {
            setStores(prev => prev.map(s => s.id === Number(data.storeId) ? { ...s, avgRating: data.avgRating } : s));
            // Also re-fetch stats because ratings count may change if it's first rating
            fetchStats();
          }
        } catch (_) {
          // ignore parse errors
        }
      };
    } catch (_) {}

    return () => {
      clearInterval(statsInterval);
      clearInterval(storesInterval);
      if (es) {
        es.close();
      }
    };
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userFilters.name.toLowerCase()) &&
    u.email.toLowerCase().includes(userFilters.email.toLowerCase()) &&
    u.address.toLowerCase().includes(userFilters.address.toLowerCase()) &&
    (userFilters.role ? u.role === userFilters.role : true)
  );
  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(storeFilters.name.toLowerCase()) &&
    s.email.toLowerCase().includes(storeFilters.email.toLowerCase()) &&
    s.address.toLowerCase().includes(storeFilters.address.toLowerCase())
  );

  const handleAddUser = e => {
    e.preventDefault();
    setError(""); setSuccess("");
  fetch("http://localhost:3000/api/v1/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addUserForm),
    })
      .then(res => res.json())
      .then(data => {
        setSuccess("User added successfully.");
        setUsers(prev => [...prev, data.user]);
        setAddUserForm({ name: "", email: "", password: "", address: "", role: "user" });
      })
      .catch(() => setError("Failed to add user"));
  };

  const handleAddStore = e => {
    e.preventDefault();
    setError(""); setSuccess("");
    fetch("http://localhost:3000/api/v1/admin/add-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addStoreForm),
    })
      .then(res => res.json())
      .then(data => {
        setSuccess("Store and owner added successfully.");
        setStores(prev => [...prev, data.store]);
        setAddStoreForm({
          name: "",
          email: "",
          address: "",
          ownerName: "",
          ownerEmail: "",
          ownerPassword: "",
          ownerAddress: ""
        });
      })
      .catch(() => setError("Failed to add store"));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and related data?')) return;
    setDeleting(true); setError(""); setSuccess("");
    try {
      let res = await fetch(`http://localhost:3000/api/v1/admin/users/${id}`, { method: 'DELETE' });
      let data = await res.json();
      if (!res.ok && res.status === 404) {
        // Try singular path fallback
        res = await fetch(`http://localhost:3000/api/v1/admin/user/${id}`, { method: 'DELETE' });
        try { data = await res.json(); } catch { data = {}; }
      }
      if (!res.ok) {
        // If user not found, refresh users list to sync UI
        if (res.status === 404) {
          const usersRes = await fetch('http://localhost:3000/api/v1/admin/users');
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }
        throw new Error(data?.error || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== id));
      // Deleting a user (owner) may delete stores; refetch stores and stats
      const [storesRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/admin/stores'),
        fetch('http://localhost:3000/api/v1/admin/dashboard')
      ]);
      const storesData = await storesRes.json();
      const statsData = await statsRes.json();
      setStores(storesData.stores || []);
      setStats(statsData);
      setSuccess('User deleted');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const deleteStore = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store and its ratings?')) return;
    setDeleting(true); setError(""); setSuccess("");
    try {
      let res = await fetch(`http://localhost:3000/api/v1/admin/stores/${id}`, { method: 'DELETE' });
      let data = await res.json();
      if (!res.ok && res.status === 404) {
        // Try singular path fallback
        res = await fetch(`http://localhost:3000/api/v1/admin/store/${id}`, { method: 'DELETE' });
        try { data = await res.json(); } catch { data = {}; }
      }
      if (!res.ok) {
        // If store not found, refresh stores list to sync UI
        if (res.status === 404) {
          const storesRes = await fetch('http://localhost:3000/api/v1/admin/stores');
          const storesData = await storesRes.json();
          setStores(storesData.stores || []);
        }
        throw new Error(data?.error || 'Failed to delete store');
      }
      setStores(prev => prev.filter(s => s.id !== id));
      // Deleting a store affects stats; refetch stats
      const statsRes = await fetch('http://localhost:3000/api/v1/admin/dashboard');
      const statsData = await statsRes.json();
      setStats(statsData);
      setSuccess('Store deleted');
    } catch (err) {
      setError(err.message || 'Failed to delete store');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">Total Users</div>
          <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">Total Stores</div>
          <div className="text-2xl font-bold text-green-600">{stats.stores}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">Total Ratings</div>
          <div className="text-2xl font-bold text-purple-600">{stats.ratings}</div>
        </div>
      </div>
      {success && <div className="text-green-600 mb-2 text-center font-semibold">{success}</div>}
      {error && <div className="text-red-600 mb-2 text-center font-semibold">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <input type="text" placeholder="Name" value={addUserForm.name} onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input type="email" placeholder="Email" value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input type="password" placeholder="Password" value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input type="text" placeholder="Address" value={addUserForm.address} onChange={e => setAddUserForm({ ...addUserForm, address: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <select value={addUserForm.role} onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="user">Normal User</option>
              <option value="admin">Admin User</option>
              <option value="owner">Store Owner</option>
            </select>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold transition">Add User</button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Add New Store</h3>
          <form onSubmit={handleAddStore} className="space-y-4">
            <input type="text" placeholder="Store Name" value={addStoreForm.name} onChange={e => setAddStoreForm({ ...addStoreForm, name: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="email" placeholder="Store Email" value={addStoreForm.email} onChange={e => setAddStoreForm({ ...addStoreForm, email: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="text" placeholder="Store Address" value={addStoreForm.address} onChange={e => setAddStoreForm({ ...addStoreForm, address: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <hr />
            <h4 className="text-lg font-semibold mb-2 text-green-700">Store Owner Details</h4>
            <input type="text" placeholder="Owner Name" value={addStoreForm.ownerName} onChange={e => setAddStoreForm({ ...addStoreForm, ownerName: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="email" placeholder="Owner Email" value={addStoreForm.ownerEmail} onChange={e => setAddStoreForm({ ...addStoreForm, ownerEmail: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="password" placeholder="Owner Password" value={addStoreForm.ownerPassword} onChange={e => setAddStoreForm({ ...addStoreForm, ownerPassword: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="text" placeholder="Owner Address" value={addStoreForm.ownerAddress} onChange={e => setAddStoreForm({ ...addStoreForm, ownerAddress: e.target.value })} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-300" />
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full font-semibold transition">Add Store & Owner</button>
          </form>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">User List & Filters</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input type="text" placeholder="Name" value={userFilters.name} onChange={e => setUserFilters({ ...userFilters, name: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input type="text" placeholder="Email" value={userFilters.email} onChange={e => setUserFilters({ ...userFilters, email: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <input type="text" placeholder="Address" value={userFilters.address} onChange={e => setUserFilters({ ...userFilters, address: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <select value={userFilters.role} onChange={e => setUserFilters({ ...userFilters, role: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">All Roles</option>
              <option value="user">Normal User</option>
              <option value="admin">Admin User</option>
              <option value="owner">Store Owner</option>
            </select>
          </div>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map(u => (
              <li key={u.id} className="border p-3 rounded flex justify-between items-center hover:bg-gray-50 transition">
                <span className="text-gray-400 mr-2">#{u.id}</span>
                <span className="font-semibold text-gray-700">{u.name}</span>
                <span className="text-gray-500">{u.email}</span>
                <span className="text-gray-500">{u.address}</span>
                <span className="text-gray-500">{u.role}</span>
                <div className="flex gap-2 items-center">
                  <button className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700 font-semibold transition" onClick={() => setSelectedUser(u)}>View Details</button>
                  <button disabled={deleting} className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-700 font-semibold transition disabled:opacity-50" onClick={() => deleteUser(u.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Store List & Filters</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input type="text" placeholder="Name" value={storeFilters.name} onChange={e => setStoreFilters({ ...storeFilters, name: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="text" placeholder="Email" value={storeFilters.email} onChange={e => setStoreFilters({ ...storeFilters, email: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="text" placeholder="Address" value={storeFilters.address} onChange={e => setStoreFilters({ ...storeFilters, address: e.target.value })} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStores.map(s => {
              const rawRating = (s.avgRating ?? s.rating);
              const hasRating = rawRating !== undefined && rawRating !== null;
              const displayRating = hasRating ? Number(rawRating).toFixed(2) : "N/A";
              return (
                <li key={s.id} className="border p-3 rounded flex justify-between items-center hover:bg-gray-50 transition">
                  <span className="text-gray-400 mr-2">#{s.id}</span>
                  <span className="font-semibold text-gray-700">{s.name}</span>
                  <span className="text-gray-500">{s.email}</span>
                  <span className="text-gray-500">{s.address}</span>
                  <span className="text-green-600">Rating: {displayRating}</span>
                  <button disabled={deleting} className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-700 font-semibold transition disabled:opacity-50" onClick={() => deleteStore(s.id)}>Delete</button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {selectedUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-blue-700">User Details</h3>
            <p className="mb-2"><strong>Name:</strong> {selectedUser.name}</p>
            <p className="mb-2"><strong>Email:</strong> {selectedUser.email}</p>
            <p className="mb-2"><strong>Address:</strong> {selectedUser.address}</p>
            <p className="mb-2"><strong>Role:</strong> {selectedUser.role}</p>
            {selectedUser.role === "owner" && (
              <p className="mb-2"><strong>Rating:</strong> {selectedUser.avgRating || "N/A"}</p>
            )}
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-4 w-full font-semibold transition" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

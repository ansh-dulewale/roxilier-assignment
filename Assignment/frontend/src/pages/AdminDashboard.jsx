import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [addStoreForm, setAddStoreForm] = useState({ name: "", email: "", address: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/admin/dashboard")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
    fetch("http://localhost:3000/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => {});
    fetch("http://localhost:3000/api/admin/stores")
      .then(res => res.json())
      .then(data => setStores(data.stores || []))
      .catch(() => {});
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
    fetch("http://localhost:3000/api/admin/add-user", {
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
    fetch("http://localhost:3000/api/admin/add-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addStoreForm),
    })
      .then(res => res.json())
      .then(data => {
        setSuccess("Store added successfully.");
        setStores(prev => [...prev, data.store]);
        setAddStoreForm({ name: "", email: "", address: "" });
      })
      .catch(() => setError("Failed to add store"));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="mb-4 flex gap-8">
        <div><strong>Total Users:</strong> {stats.users}</div>
        <div><strong>Total Stores:</strong> {stats.stores}</div>
        <div><strong>Total Ratings:</strong> {stats.ratings}</div>
      </div>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Add New User</h3>
        <form onSubmit={handleAddUser} className="space-y-2">
          <input type="text" placeholder="Name" value={addUserForm.name} onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="email" placeholder="Email" value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="password" placeholder="Password" value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Address" value={addUserForm.address} onChange={e => setAddUserForm({ ...addUserForm, address: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <select value={addUserForm.role} onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })} className="border px-2 py-1 rounded w-full">
            <option value="user">Normal User</option>
            <option value="admin">Admin User</option>
            <option value="store-owner">Store Owner</option>
          </select>
          <button className="bg-blue-500 text-white px-2 py-1 rounded" type="submit">Add User</button>
        </form>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Add New Store</h3>
        <form onSubmit={handleAddStore} className="space-y-2">
          <input type="text" placeholder="Name" value={addStoreForm.name} onChange={e => setAddStoreForm({ ...addStoreForm, name: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="email" placeholder="Email" value={addStoreForm.email} onChange={e => setAddStoreForm({ ...addStoreForm, email: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="text" placeholder="Address" value={addStoreForm.address} onChange={e => setAddStoreForm({ ...addStoreForm, address: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <button className="bg-green-500 text-white px-2 py-1 rounded" type="submit">Add Store</button>
        </form>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">User List & Filters</h3>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Name" value={userFilters.name} onChange={e => setUserFilters({ ...userFilters, name: e.target.value })} className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Email" value={userFilters.email} onChange={e => setUserFilters({ ...userFilters, email: e.target.value })} className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Address" value={userFilters.address} onChange={e => setUserFilters({ ...userFilters, address: e.target.value })} className="border px-2 py-1 rounded" />
          <select value={userFilters.role} onChange={e => setUserFilters({ ...userFilters, role: e.target.value })} className="border px-2 py-1 rounded">
            <option value="">All Roles</option>
            <option value="user">Normal User</option>
            <option value="admin">Admin User</option>
            <option value="store-owner">Store Owner</option>
          </select>
        </div>
        <ul className="space-y-2">
          {filteredUsers.map(u => (
            <li key={u.id} className="border p-2 rounded">
              <span className="font-semibold">{u.name}</span> | {u.email} | {u.address} | {u.role}
              <button className="bg-gray-300 px-2 py-1 rounded ml-2" onClick={() => setSelectedUser(u)}>View Details</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Store List & Filters</h3>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Name" value={storeFilters.name} onChange={e => setStoreFilters({ ...storeFilters, name: e.target.value })} className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Email" value={storeFilters.email} onChange={e => setStoreFilters({ ...storeFilters, email: e.target.value })} className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Address" value={storeFilters.address} onChange={e => setStoreFilters({ ...storeFilters, address: e.target.value })} className="border px-2 py-1 rounded" />
        </div>
        <ul className="space-y-2">
          {filteredStores.map(s => (
            <li key={s.id} className="border p-2 rounded">
              <span className="font-semibold">{s.name}</span> | {s.email} | {s.address} | Rating: {s.avgRating || "N/A"}
            </li>
          ))}
        </ul>
      </div>
      {selectedUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">User Details</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {selectedUser.role === "store-owner" && (
              <p><strong>Rating:</strong> {selectedUser.avgRating || "N/A"}</p>
            )}
            <button className="bg-red-500 text-white px-2 py-1 rounded mt-4" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

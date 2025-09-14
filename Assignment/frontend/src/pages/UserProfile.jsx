import React, { useEffect, useState } from "react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Get user id from localStorage (user object)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const id = storedUser?.id;
    if (!id) {
      setError("No user id found in localStorage");
      setLoading(false);
      return;
    }
    fetch(`http://localhost:3000/api/v1/auth/user/id/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setForm({
            name: data.user.name,
            email: data.user.email,
            address: data.user.address,
          });
        } else {
          setError("User not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch user info");
        setLoading(false);
      });
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    const stored = JSON.parse(localStorage.getItem("user"));
    const userId = stored?.id;
    fetch(`http://localhost:3000/api/v1/auth/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || form);
        setEditMode(false);
        setSuccess("Profile updated successfully.");
      })
      .catch(() => {
        setError("Failed to update profile");
      });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    const stored = JSON.parse(localStorage.getItem("user"));
    const userId = stored?.id;
    fetch(`http://localhost:3000/api/v1/auth/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors || data.error) {
          setError(data.errors ? data.errors.map(e => e.msg).join(", ") : data.error);
        } else {
          setSuccess("Password updated successfully.");
          setOldPassword("");
          setNewPassword("");
        }
      })
      .catch(() => {
        setError("Failed to update password");
      });
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;

  // Only show profile if user data is present
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Address:</strong> {user?.address}</p>
          <button className="bg-blue-500 text-white px-2 py-1 rounded mt-2" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-2">
          <div>
            <label>Name:</label>
            <input type="text" value={form?.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={form?.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" value={form?.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} className="border px-2 py-1 rounded w-full" />
          </div>
          <button className="bg-green-500 text-white px-2 py-1 rounded" type="submit">Save</button>
          <button className="bg-gray-400 text-white px-2 py-1 rounded ml-2" type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}
      <hr className="my-4" />
      <form onSubmit={handlePasswordUpdate} className="space-y-2">
        <div>
          <label>Old Password:</label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <label>New Password:</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="border px-2 py-1 rounded w-full" />
        </div>
        <button className="bg-purple-500 text-white px-2 py-1 rounded" type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UserProfile;

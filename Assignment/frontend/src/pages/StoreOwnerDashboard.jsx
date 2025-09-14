import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext.jsx";

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    // Use user.id or user.storeId for API call
    if (!user) return;
    const storeId = user.storeId || user.id;
    fetch(`http://localhost:3000/api/store/${storeId}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        setRatings(data.ratings || []);
        setAvgRating(data.avgRating || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      });
  }, [user]);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    fetch(`http://localhost:3000/api/v1/auth/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, oldPassword: password, newPassword: password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors || data.error) {
          setError(data.errors ? data.errors.map(e => e.msg).join(", ") : data.error);
        } else {
          setSuccess("Password updated successfully.");
          setPassword("");
        }
      })
      .catch(() => {
        setError("Failed to update password");
      });
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Store Owner Dashboard</h2>
      <button className="bg-gray-500 text-white px-4 py-2 rounded mb-4" onClick={logout}>Log Out</button>
      <form onSubmit={handlePasswordUpdate} className="mb-6 space-y-2">
        <label className="block font-semibold">Update Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New Password"
          className="border px-3 py-2 rounded w-full"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Update Password</button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mb-4">
        <strong>Average Rating:</strong> {avgRating || "N/A"}
      </div>
      <h3 className="text-xl font-semibold mb-2">Users who rated your store:</h3>
      <ul className="space-y-2">
        {ratings.map((rating) => (
          <li key={rating.id} className="border p-2 rounded">
            User: {rating.userName || rating.userId} | Rating: {rating.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreOwnerDashboard;

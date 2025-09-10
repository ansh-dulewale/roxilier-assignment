import React, { useEffect, useState } from "react";

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with actual store ID and authentication (e.g., from JWT or context)
    const storeId = localStorage.getItem("storeId");
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
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Store Owner Dashboard</h2>
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

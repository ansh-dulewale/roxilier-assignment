import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../AuthContext.jsx";

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const ownedStoreIdsRef = useRef(new Set());

  const fetchOwnerRatings = async (opts = { silent: false }) => {
    if (!user) return;
    if (!opts.silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/store/owner/${user.id}/ratings`);
      if (res.ok) {
        const data = await res.json();
        setRatings(data.ratings || []);
        setAvgRating(data.avgRating ?? null);
        setStores(data.stores || []);
        const ids = new Set((data.stores || []).map((s) => s.id));
        ownedStoreIdsRef.current = ids;
      } else if (res.status === 404) {
        // Fallback path: derive from store list and per-store ratings
        const listRes = await fetch(`http://localhost:3000/api/v1/store/list`);
        const listJson = await listRes.json();
        const owned = (listJson.stores || []).filter((s) => s.owner?.id === user.id);
        setStores(owned);
        ownedStoreIdsRef.current = new Set(owned.map((s) => s.id));
        if (owned.length === 0) {
          setRatings([]);
          setAvgRating(null);
        } else {
          const results = await Promise.all(
            owned.map(async (s) => {
              try {
                const rRes = await fetch(`http://localhost:3000/api/v1/store/${s.id}/ratings`);
                const rJson = await rRes.json();
                return { store: s, ratings: rJson.ratings || [] };
              } catch {
                return { store: s, ratings: [] };
              }
            })
          );
          const mergedRatings = results.flatMap(({ store, ratings }) =>
            ratings.map((r) => ({ ...r, Store: { id: store.id, name: store.name } }))
          );
          setRatings(mergedRatings);
          const avg = mergedRatings.length
            ? mergedRatings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / mergedRatings.length
            : null;
          setAvgRating(avg);
        }
      } else {
        // Other error statuses
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
    } catch (e) {
      if (!opts.silent) setError("Failed to fetch dashboard data");
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    // Initial fetch
    fetchOwnerRatings();

    // Subscribe to SSE for real-time updates
    const es = new EventSource("http://localhost:3000/api/v1/store/ratings/stream");
    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload?.type === "rating:update") {
          // Only refetch if the update is for one of the owner's stores
          if (ownedStoreIdsRef.current.has(payload.storeId)) {
            fetchOwnerRatings({ silent: true });
          }
        }
      } catch (_) {
        // ignore non-JSON or heartbeat messages
      }
    };
    es.onerror = () => {
      // Let EventSource auto-reconnect; polling covers gaps
    };

    // Light polling fallback every 30s
    const interval = setInterval(() => fetchOwnerRatings({ silent: true }), 30000);

    return () => {
      try { es.close(); } catch {}
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Store Owner Dashboard</h2>
      <p className="mb-4 text-gray-600">Real-time ratings across all stores you own.</p>
      <div className="mb-4">
        <strong>Average Rating (all stores):</strong> {avgRating !== null && avgRating !== undefined ? Number(avgRating).toFixed(2) : "N/A"}
      </div>
      <h3 className="text-xl font-semibold mb-2">Users who rated your store(s):</h3>
      {ratings.length === 0 ? (
        <div className="text-gray-600">No ratings yet.</div>
      ) : (
        <ul className="space-y-2">
          {ratings.map((r) => (
            <li key={r.id} className="border p-2 rounded">
              Store: {r.Store?.name || r.storeId} | User: {r.User?.name || r.userId} | Rating: {r.rating}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;

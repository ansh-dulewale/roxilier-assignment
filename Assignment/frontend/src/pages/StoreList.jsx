import React, { useEffect, useMemo, useState } from "react";


const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(1);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch stores and user ratings
  const fetchStoresAndRatings = () => {
    setLoading(true);
    setError(null);
  fetch("http://localhost:3000/api/v1/store/list")
      .then((res) => res.json())
      .then((data) => {
        setStores(data.stores || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch stores");
        setLoading(false);
      });
    // Fetch user's ratings (replace with actual user ID or auth)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    if (userId) {
      fetch(`http://localhost:3000/api/v1/rating/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          // Map storeId to rating value
          const ratingsMap = {};
          (data.ratings || []).forEach(r => {
            ratingsMap[r.storeId] = r.rating;
          });
          setUserRatings(ratingsMap);
        });
    }
  };

  useEffect(() => {
    fetchStoresAndRatings();
  }, []);
  const handleRatingSubmit = (storeId) => {
    setRatingLoading(true);
    setRatingError(null);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    if (!userId) {
      setRatingError("You must be logged in to rate stores.");
      return;
    }
    fetch(`http://localhost:3000/api/v1/rating/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, userId, rating: ratingValue }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.errors ? data.errors.map(e => e.msg).join(", ") : data.error || "Failed to submit rating");
        }
        return data;
      })
      .then((data) => {
        setUserRatings((prev) => ({ ...prev, [storeId]: ratingValue }));
        setSelectedStore(null);
        setRatingLoading(false);
        // Refresh store list after rating
        fetchStoresAndRatings();
      })
      .catch((err) => {
        setRatingError(err.message || "Failed to submit rating");
        setRatingLoading(false);
      });
  };


  const filteredStores = useMemo(() => {
    const nameQ = nameFilter.toLowerCase();
    const locQ = locationFilter.toLowerCase();
    return stores.filter((store) => {
      const matchesName = (store.name || "").toLowerCase().includes(nameQ);
      const locationValue = store.location || store.address || "";
      const matchesLocation = locationValue.toLowerCase().includes(locQ);
      return matchesName && matchesLocation;
    });
  }, [stores, nameFilter, locationFilter]);

  const sortedStores = useMemo(() => [...filteredStores].sort((a, b) => {
    let valA, valB;
    if (sortBy === "name") {
      valA = (a.name || "").toLowerCase();
      valB = (b.name || "").toLowerCase();
    } else if (sortBy === "avgRating") {
      // fallback to store.rating if avgRating is not present
      valA = (a.avgRating ?? a.rating ?? 0);
      valB = (b.avgRating ?? b.rating ?? 0);
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  }), [filteredStores, sortBy, sortOrder]);

  if (loading) return <div>Loading stores...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Store Listing</h2>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Filter by location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="avgRating">Sort by Rating</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <button
        className="bg-gray-200 px-3 py-1 rounded mb-4"
        onClick={fetchStoresAndRatings}
        disabled={loading}
      >
        Refresh
      </button>
      <ul className="space-y-4">
        {sortedStores.map((store) => (
          <li key={store.id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{store.name}</h3>
            <p>{store.description}</p>
            <p>Location: {store.location || store.address || "N/A"}</p>
            <p>Average Rating: {store.avgRating ?? store.rating ?? "N/A"}</p>
            <p>Your Rating: {userRatings[store.id] ? userRatings[store.id] : "Not rated"}</p>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
              onClick={() => {
                setSelectedStore(store.id);
                setRatingValue(userRatings[store.id] || 1);
              }}
            >
              {userRatings[store.id] ? "Modify Rating" : "Submit Rating"}
            </button>
            {selectedStore === store.id && (
              <div className="mt-2">
                <label>
                  Rating (1-5):
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={ratingValue}
                    onChange={e => setRatingValue(Number(e.target.value))}
                    className="border px-2 py-1 rounded ml-2 w-16"
                  />
                </label>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                  onClick={() => handleRatingSubmit(store.id)}
                  disabled={ratingLoading}
                >
                  {userRatings[store.id] ? "Update" : "Submit"}
                </button>
                {ratingError && <div className="text-red-500 mt-1">{ratingError}</div>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreList;

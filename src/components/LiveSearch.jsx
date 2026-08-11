import { Search, MapPin } from "lucide-react";
import { useState } from "react";

export default function LiveSearch() {
  const [search, setSearch] = useState("");

  return (
    <div className="live-search glass-card">

      <div className="live-search-input">

        <Search
          size={20}
          color="#64748b"
        />

        <input
          type="text"
          placeholder="Search by reference number, street, municipality or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <button className="location-btn">

        <MapPin size={18} />

        Current Location

      </button>

    </div>
  );
}
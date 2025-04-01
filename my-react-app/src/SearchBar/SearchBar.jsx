import React, { useState } from "react";
import searchicon from "../assets/search_icon.png";
import { useLocation, useNavigate } from "react-router-dom";

function SearchBar() {
    const [query, setQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    function handleQueryChange(e) {
        const value = e.target.value;
        setQuery(value);

        // Determine the base URL
        const currentPath = location.pathname.includes("product")
            ? "/product"
            : location.pathname.includes("investor")
            ? "/investor"
            : "/";

        // If empty, reset URL to show all data
        if (value.trim() === "") {
            navigate(currentPath);
        } else {
            navigate(`${currentPath}?q=${value}`);
        }
    }

    return (
        <div className="search-box">
            <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={handleQueryChange}
            />
            <img src={searchicon} alt="Search Icon" className="logo" />
        </div>
    );
}

export default SearchBar;
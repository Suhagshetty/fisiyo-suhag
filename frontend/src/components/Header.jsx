import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Loader2, X } from "lucide-react";
import { fetchSuggestions, handleKeyDown } from "../utils/HeaderUtils";
import ProfileSection from "./ProfileSection"; // Add this import


const Header = ({ toggleSidebar, isAuthenticated, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions({
        searchTerm,
        currentUser,
        setSuggestions,
        setIsLoading,
        setShowSuggestions,
        setSelectedIndex,
      });
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [searchTerm, currentUser]);
  
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
    if (e.target.value === "") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user) => {
    setSearchTerm("");
    setShowSuggestions(false);
    navigate(`/n/${user.handle}`, {
      state: { user: currentUser, handle: user.handle },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };
 

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <header className="bg-[#111111]/80 backdrop-blur-xl z-40 flex-shrink-0 sticky top-0">
      <div className="max-w-7xl mx-auto sm:px-6 px-2 py-2 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 sm:max-w-2xl max-w-3xl ml-3 sm:mx-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#818384]" />
            </div>
            <input
              type="text"
              placeholder="Search users, handles..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  suggestions,
                  selectedIndex,
                  setSelectedIndex,
                  handleSuggestionClick
                )
              }
              className="w-full pl-12 pr-10 py-2.5 bg-[#1a1a1a] rounded-full focus:ring-2 focus:ring-[#AD49E1] focus:bg-[#222222] transition-all duration-300 text-sm text-white placeholder-[#818384] shadow-inner"
            />

            {searchTerm && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-10 flex items-center">
                <X size={18} className="text-[#818384] hover:text-white" />
              </button>
            )}

            {isLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Loader2 size={18} className="animate-spin text-[#818384]" />
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a1a] rounded-lg shadow-lg z-50 border border-[#333333] max-h-75 overflow-y-auto">
                {suggestions.length > 0
                  ? suggestions.map((user, index) => (
                      <div
                        key={user._id}
                        onClick={() => handleSuggestionClick(user)}
                        className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${
                          index === selectedIndex
                            ? "bg-[#2a2a2a]"
                            : "hover:bg-[#222222]"
                        }`}>
                        <img
                          src={
                            user.profilePicture
                              ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${user.profilePicture}`
                              : "/default-avatar.png"
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white font-medium">
                            {user.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            @{user.handle}
                          </div>
                        </div>
                      </div>
                    ))
                  : !isLoading &&
                    searchTerm && (
                      <div className="p-4 text-gray-400">No users found</div>
                    )}
              </div>
            )}
          </form>
        </div>

        {/* Profile section */}
        <ProfileSection
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
        />
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// Custom hooks
import useFeedData from "../hooks/useFeedData";

// Components
import Sidebar from "./Sidebar";
import Header from "./Header";
import EmptyState from "./EmptyState";
import PostCard from "./Post";
import Poll from "./Poll";
import FollowerSuggestions from "./FollowerSuggestions";
import MobileNavBar from "./MobileNavBar";

// Utils
import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";

const Feed = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser] = useState(location.state?.user || null);
  const dropdownRef = useRef(null);

  const {
    expandedPosts,
    votedPosts,
    upvoteCounts,
    polls,
    savedPosts,
    downvoteCounts,
    communities,
    posts,
    loading,
    error,
    togglePostExpansion,
    handleSavePost,
    handleVote,
  } = useFeedData(currentUser, user);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const filterOptions = [
    { value: "all", label: "All Posts", icon: "📃" },
    { value: "saved", label: "Saved", icon: "🔖" },
    { value: "upvoted", label: "Upvoted", icon: "👍" },
    { value: "downvoted", label: "Downvoted", icon: "👎" },
  ];

  const selectedOption = filterOptions.find((opt) => opt.value === filter);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreatePost = () => {
    navigate("/compose/post", {
      state: {
        backgroundLocation: location,
        user: currentUser,
      },
    });
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "saved") return savedPosts.has(post._id);
    if (filter === "upvoted") return votedPosts.get(post._id) === "up";
    if (filter === "downvoted") return votedPosts.get(post._id) === "down";
    return true;
  });

  return (
    <div className="h-screen bg-[#0a0a0a] text-[#e1e1e1] flex overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isAuthenticated={isAuthenticated}
        logout={logout}
        navigate={navigate}
        currentUser={currentUser}
        communities={communities}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
        />

        <main
          className="flex-1 bg-[#0a0a0a] overflow-hidden"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <div className="flex h-full justify-around">
            <div className="flex-1 w-[58%] overflow-y-auto sm:p-2">
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent" />
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl p-6 text-red-400 text-center mb-8 backdrop-blur-sm">
                  {error}
                </div>
              )}

              {!loading && posts.length > 0 && (
                <div className="space-y-0 sm:border overflow-hidden rounded-2xl border-[#222]">
                  {/* Premium Filter Dropdown */}
                  <div
                    className="relative mb-2 mt-2 flex justify-end px-2"
                    ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center justify-between text-[#f0f0f0]  py-1  backdrop-blur-sm   text-sm w-full sm:w-25">
                      <div className="flex items-center">
                        <span>{selectedOption?.label}</span>
                      </div>
                      <svg
                        className={`w-5 h-5 ml-2 text-[#AD49E1] transition-transform duration-200 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full sm:w-56 rounded-xl shadow-2xl shadow-[#AD49E1]/10 backdrop-blur-sm overflow-hidden">
                        {filterOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilter(option.value);
                              setDropdownOpen(false);
                            }}
                            className={`flex items-center w-full px-4 py-3 text-sm transition-all z-300 duration-200 ${
                              filter === option.value
                                ? " text-[#AD49E1]"
                                : "text-[#b0b0b0] hover:bg-[#2a2a2a]"
                            }`}>
                            <span>{option.label}</span>
                            {filter === option.value && (
                              <svg
                                className="w-5 h-5 ml-auto text-[#AD49E1]"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {polls.map((poll) => (
                    <Poll
                      key={poll.id}
                      poll={poll}
                      currentUser={currentUser}
                      formatDate={formatDate}
                      truncateText={truncateText}
                      formatVoteCount={formatVoteCount}
                      savedPosts={savedPosts}
                      handleSavePost={handleSavePost}
                    />
                  ))}

                  {/* Filtered Posts */}
                  {filteredPosts.map((post) => {
                    const isExpanded = expandedPosts.has(post._id);
                    const userVote = votedPosts.get(post._id);
                    const upvoteCount = upvoteCounts.get(post._id) || 0;
                    const downvoteCount = downvoteCounts.get(post._id) || 0;

                    return (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        isExpanded={isExpanded}
                        togglePostExpansion={togglePostExpansion}
                        userVote={userVote}
                        upvoteCount={upvoteCount}
                        downvoteCount={downvoteCount}
                        handleVote={handleVote}
                        savedPosts={savedPosts}
                        handleSavePost={handleSavePost}
                        formatDate={formatDate}
                        truncateText={truncateText}
                        formatVoteCount={formatVoteCount}
                        location={location}
                      />
                    );
                  })}

                  {/* Nothing found */}
                  {filteredPosts.length === 0 && (
                    <div className="text-center py-8 text-[#888] text-sm">
                      Nothing found for this filter.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-[30%] bg-[#0a0a0a] p-2 overflow-y-auto hidden sm:block scrollbar scrollbar-thumb-[#AD49E1]/70 scrollbar-track-[#1a1a1a] scrollbar-rounded">
              <div className="rounded-3xl h-full">
                <FollowerSuggestions currentUser={currentUser} />
              </div>
            </div>
          </div>
        </main>

        <MobileNavBar navigate={navigate} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Feed;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, Search, Bell, Menu, X } from "lucide-react";

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

// Util functions
import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";

const Feed = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser] = useState(location.state?.user || null);

  // Custom data hook
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

  // Handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
// console.log(polls);

  const handleCreatePost = () => {
    navigate("/compose/post", {
      state: {
        backgroundLocation: location,
        user: currentUser,
      },
    });
  };

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

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
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
            {/* Main Feed */}
            <div className="flex-1 w-[58%] overflow-y-auto sm:p-2 ">
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

              {/* {!loading && posts.length === 0 && (
                <EmptyState onCreatePost={handleCreatePost} />
              )} */}

              {!loading && posts.length > 0 && (
                <div className="space-y-0 sm:border sm:rounded-2xl overflow-hidden border-[#222]">
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
                  {posts.map((post) => {
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

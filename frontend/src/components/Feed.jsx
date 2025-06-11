import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import FollowerSuggestions from "./FollowerSuggestions";
import {
  Menu,
  X,
  Home,
  Compass,
  Users,
  LogOut,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Share,
  Bookmark,
  ArrowUp,
  ArrowDown,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  User,
  BookOpen,
  GraduationCap,
  Star,
} from "lucide-react";

const Feed = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [votedPosts, setVotedPosts] = useState(new Map());
  const location = useLocation();
  const [upvoteCounts, setUpvoteCounts] = useState(new Map());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [downvoteCounts, setDownvoteCounts] = useState(new Map());
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  // console.log(currentUser);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const togglePostExpansion = (postId) => {
    const newExpandedPosts = new Set(expandedPosts);
    if (newExpandedPosts.has(postId)) {
      newExpandedPosts.delete(postId);
    } else {
      newExpandedPosts.add(postId);
    }
    setExpandedPosts(newExpandedPosts);
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/communities");
        const data = await response.json();
        setCommunities(data);
        // console.log(data);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };

    fetchCommunities();
  }, []);

  const handleSavePost = async (postId) => {
    if (!currentUser?._id) return;

    const isCurrentlySaved = savedPosts.has(postId);
    const newSavedPosts = new Set(savedPosts);

    // Optimistic UI update
    if (isCurrentlySaved) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);

    try {
      const endpoint = isCurrentlySaved
        ? "http://localhost:3000/api/users/unsave-post"
        : "http://localhost:3000/api/users/save-post";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isCurrentlySaved ? "unsave" : "save"} post`
        );
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setSavedPosts(savedPosts);
    }
  };

  // Load user's existing votes when component mounts
  useEffect(() => {
    const loadUserVotes = async () => {
      if (currentUser?._id || user?.sub) {
        try {
          const userId = currentUser?._id || user?.sub;
          const response = await fetch(
            `http://localhost:3000/api/posts/votes/${userId}`
          );
          if (response.ok) {
            const userVotes = await response.json();
            const votesMap = new Map();
            Object.entries(userVotes).forEach(([postId, voteType]) => {
              votesMap.set(postId, voteType);
            });
            setVotedPosts(votesMap);
          }
        } catch (error) {
          console.error("Error loading user votes:", error);
        }
      }
    };

    if (posts.length > 0) {
      loadUserVotes();
    }
  }, [posts, currentUser, user]);

  // Initialize separate upvote and downvote counts when posts load
  useEffect(() => {
    if (posts.length > 0) {
      const initialUpvoteCounts = new Map();
      const initialDownvoteCounts = new Map();

      posts.forEach((post) => {
        initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
        initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
      });

      setUpvoteCounts(initialUpvoteCounts);
      setDownvoteCounts(initialDownvoteCounts);
    }
  }, [posts]);
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (currentUser?._id) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/saved-posts/${currentUser._id}`
          );
          if (response.ok) {
            const saved = await response.json();
            setSavedPosts(new Set(saved.map((post) => post._id)));
          }
        } catch (error) {
          console.error("Error loading saved posts:", error);
        }
      }
    };

    fetchSavedPosts();
  }, [currentUser]);
  // Updated handleVote function to manage separate counts
  const handleVote = async (postId, voteType) => {
    try {
      const currentVote = votedPosts.get(postId);
      const currentUpvotes = upvoteCounts.get(postId) || 0;
      const currentDownvotes = downvoteCounts.get(postId) || 0;

      let newUpvotes = currentUpvotes;
      let newDownvotes = currentDownvotes;
      let newVoteType = voteType;

      // Handle vote logic more carefully
      if (currentVote === voteType) {
        // User is removing their vote (clicking same button)
        newVoteType = null;
        if (voteType === "up") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
      } else if (currentVote && currentVote !== voteType) {
        // User is switching from one vote to another
        if (currentVote === "up" && voteType === "down") {
          // Switching from upvote to downvote
          newUpvotes = Math.max(0, currentUpvotes - 1);
          newDownvotes = currentDownvotes + 1;
        } else if (currentVote === "down" && voteType === "up") {
          // Switching from downvote to upvote
          newDownvotes = Math.max(0, currentDownvotes - 1);
          newUpvotes = currentUpvotes + 1;
        }
      } else {
        // New vote (no previous vote)
        if (voteType === "up") {
          newUpvotes = currentUpvotes + 1;
        } else {
          newDownvotes = currentDownvotes + 1;
        }
      }

      // Store original values for rollback
      const originalUpvotes = currentUpvotes;
      const originalDownvotes = currentDownvotes;
      const originalVote = currentVote;

      // Optimistic UI update
      setUpvoteCounts((prev) => new Map(prev).set(postId, newUpvotes));
      setDownvoteCounts((prev) => new Map(prev).set(postId, newDownvotes));

      const newVotedPosts = new Map(votedPosts);
      if (newVoteType === null) {
        newVotedPosts.delete(postId);
      } else {
        newVotedPosts.set(postId, newVoteType);
      }
      setVotedPosts(newVotedPosts);

      // Send request to backend
      const response = await fetch(
        `http://localhost:3000/api/posts/${postId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voteType: newVoteType,
            userId: currentUser?._id || user?.sub,
          }),
        }
      );

      if (!response.ok) {
        // Revert optimistic update on failure
        setUpvoteCounts((prev) => new Map(prev).set(postId, originalUpvotes));
        setDownvoteCounts((prev) =>
          new Map(prev).set(postId, originalDownvotes)
        );

        const revertedVotedPosts = new Map(votedPosts);
        if (originalVote === null) {
          revertedVotedPosts.delete(postId);
        } else {
          revertedVotedPosts.set(postId, originalVote);
        }
        setVotedPosts(revertedVotedPosts);

        throw new Error("Failed to update vote");
      }

      // Update with actual server response to ensure consistency
      const updatedPost = await response.json();
      setUpvoteCounts((prev) =>
        new Map(prev).set(postId, updatedPost.upvotes?.length || 0)
      );
      setDownvoteCounts((prev) =>
        new Map(prev).set(postId, updatedPost.downvotes?.length || 0)
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCreatePost = () => {
    navigate("/compose/post", {
      state: {
        backgroundLocation: location,
        user: currentUser,
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, wordLimit = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const formatVoteCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/posts");
        const data = await response.json();
        setPosts(data);
        // console.log(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="h-screen bg-[#0a0a0a] text-[#e1e1e1] flex overflow-hidden">
      {/* Sidebar - Fixed 300px width with individual scrolling */}
      <nav
        className={`w-[300px] bg-[#111111] flex flex-col transition-all duration-300 z-30
        lg:block lg:relative lg:translate-x-0
        ${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 translate-x-0 shadow-2xl"
            : "fixed inset-y-0 left-0 -translate-x-full"
        }
        lg:transform-none lg:shadow-none`}
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
        {/* Sidebar Header - Fixed */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h1
              className="text-2xl font-bold text-white flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              FISIYO
            </h1>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-white lg:hidden">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#AD49E1]/60 scrollbar-track-[#1a1a1a]/80">
          <div className="space-y-2 px-2">
            <button
              onClick={() =>
                navigate("/explore", { state: { user: currentUser } })
              }
              className="flex items-center gap-4 text-[#d7dadc] hover:text-white hover:bg-[#1a1a1a] px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium text-sm">
              <Compass size={20} />
              <span>Explore</span>
            </button>

            <button
              onClick={() =>
                navigate("/professors", { state: { user: currentUser } })
              }
              className="flex items-center gap-4 text-[#d7dadc] hover:text-white hover:bg-[#1a1a1a] px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium text-sm">
              <GraduationCap size={20} />
              <span>Professors</span>
            </button>
            <button
              onClick={() =>
                navigate("/community-setup", { state: { user: currentUser } })
              }
              className="flex items-center gap-4 text-[#d7dadc] hover:text-white hover:bg-[#1a1a1a] px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium text-sm">
              <GraduationCap size={20} />
              <span>New Community</span>
            </button>
          </div>

          {/* Communities Section */}
          <div className="mt-8 px-6 py-4">
            <h3 className="text-xs uppercase tracking-wider text-[#818384] mb-3 px-2">
              Popular Communities
            </h3>
            <div className="space-y-1.5">
              {communities.map((community) => (
                <Link
                  key={community._id}
                  to={`/c/${community.name}`}
                  state={{ user: currentUser }}
                  className="flex items-center gap-2 text-[#d7dadc] hover:text-white py-1 rounded-xl transition-all duration-300">
                  {community.avatarUrl ? (
                    <img
                      src={community.avatarUrl}
                      alt={community.name}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    " "
                  )}
                  <div>
                    <div className="font-bold text-sm">c/{community.name}</div>
                    <div className="text-xs text-[#818384]">
                      {community.memberCount} members
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* User Section - Fixed at bottom */}
        {isAuthenticated && (
          <div className="px-6 pb-6 flex-shrink-0">
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="flex items-center gap-4 text-[#d7dadc] hover:text-red-400 hover:bg-[#1a1a1a] w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed */}
        <header className="bg-[#111111]/80 backdrop-blur-xl z-40 flex-shrink-0">
          <div className="max-w-7xl mx-auto sm:px-6 px-2 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-[#d7dadc] hover:text-white lg:hidden">
                <Menu size={24} />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex-1 sm:max-w-2xl max-w-3xl ml-3 sm:mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-[#818384]" />
                </div>
                <input
                  type="text"
                  placeholder="Search Fisiyo"
                  className="w-full pl-12 pr-6 py-2.5 bg-[#1a1a1a] rounded-full focus:ring-2 focus:ring-[#AD49E1] focus:bg-[#222222] transition-all duration-300 text-sm text-white placeholder-[#818384] shadow-inner"
                />
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-0 sm:gap-4">
                <button className="text-[#818384] hover:text-white sm:p-3 px-1 rounded-full hover:bg-[#1a1a1a] transition-all duration-300">
                  <Bell size={20} />
                </button>
                <div
                  className=" cursor-pointer hover:bg-[#1a1a1a] px-2 sm:px-3 py-2 rounded-xl transition-all duration-300"
                  onClick={() =>
                    navigate("/profile", { state: { user: currentUser } })
                  }>
                  <img
                    src={
                      `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser?.profilePicture}` ||
                      "/default-avatar.png"
                    }
                    alt="Profile"
                    className="sm:w-9 sm:h-9 w-7 h-7 rounded-full object-cover"
                  /> 
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Feed Content - Scrollable container */}
        <main
          className="flex-1 bg-[#0a0a0a] overflow-hidden"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {/* Centered Container for Posts and Suggestions */}
          <div className="flex h-full justify-around">
            {/* Posts Section - Individually scrollable */}

            <div className="flex-1 w-[58%] overflow-y-auto  sm:p-2 ">
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent"></div>
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl p-6 text-red-400 text-center mb-8 backdrop-blur-sm mx-4">
                  {error}
                </div>
              )}

              {!loading && posts.length === 0 && (
                <div className="text-center py-24 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#AD49E1]/20 to-[#AD49E1]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-[#AD49E1]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    No posts yet
                  </h3>
                  <p className="text-[#818384] max-w-md mx-auto mb-8 text-lg">
                    Be the first to share your research or academic insights
                    with the community
                  </p>
                  <button
                    onClick={handleCreatePost}
                    className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] hover:from-[#AD49E1] hover:to-[#AD49E1] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 text-sm inline-flex items-center gap-3 shadow-lg hover:shadow-xl">
                    <Plus size={16} />
                    <span>Create First Post</span>
                  </button>
                </div>
              )}

              {!loading && posts.length > 0 && (
                <div className="space-y-0  sm:rounded-2xl overflow-hidden sm:border  border-[#222] ">
                  {posts.map((post) => {
                    const isExpanded = expandedPosts.has(post._id);
                    const userVote = votedPosts.get(post._id);
                    const upvoteCount = upvoteCounts.get(post._id) || 0;
                    const downvoteCount = downvoteCounts.get(post._id) || 0;

                    return (
                      <article
                        key={post._id}
                        className="bg-[#111111] sm:border-b  border-[#222]  overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-3xl "
                        style={{ minHeight: "400px" }}>
                        {/* Post Content */}
                        <div className="pt-3  py-2">
                          {/* Post Header */}
                          <div className="flex items-center justify-between sm:px-6 px-2  mb-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Link
                                key={post.communityHandle}
                                to={`/c/${post.communityHandle}`}
                                state={{ user: currentUser }}>
                                <img
                                  className="w-12 h-12 object-cover object-center"
                                  src={post.community_dp}
                                  alt="community"
                                />
                              </Link>

                              <div>
                                <Link
                                  key={post.communityHandle}
                                  to={`/c/${post.communityHandle}`}
                                  state={{ user: currentUser }}>
                                  <h2 className="text-white font-medium text-[15px]">
                                    c/{post.communityHandle || "Astronomy"}
                                  </h2>
                                </Link>

                                <p className="text-[#818384] text-[12px] flex items-center">
                                  <span>
                                    n/
                                    {(post.userHandle || "anonymous")
                                      .toLowerCase()
                                      .replace(/\s+/g, "")}
                                  </span>
                                  <span className="mx-1.5">•</span>{" "}
                                  {formatDate(post.createdAt)} ago
                                </p>
                              </div>
                            </div>

                            <button className="text-[#a0a2a4] hover:text-white p-2 rounded-full hover:bg-[#1f1f1f] transition-colors duration-200">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                          {/* Post Title */}
                          <Link
                            to={`/post/${post._id}`}
                            state={{
                              post,
                              user: currentUser,
                              backgroundLocation: location,
                            }}
                            className="text-[18px] font-bold text-white mb-4 sm:px-6 px-2 leading-tight cursor-pointer hover:text-[#AD49E1] transition-colors duration-300 block"
                            onClick={() => togglePostExpansion(post._id)}>
                            {post.title || "Research Summary"}
                          </Link>
                          {post.imageUrl?.length > 0 && (
                            // #101010 #0b0b0b
                            <div className="relative mb-4 bg-[#101010] overflow-hidden">
                              <div
                                className="w-full"
                                style={{ minHeight: "300px" }} // prevents collapse before image loads
                              >
                                <img
                                  src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                                  alt="Post content"
                                  className={`mx-auto w-full h-auto max-h-[600px] object-contain cursor-pointer transition-all duration-500 ease-in-out
                                  ${
                                    isExpanded
                                      ? "opacity-100 blur-0"
                                      : "opacity-100 blur-sm"
                                  }`}
                                  style={{
                                    transition:
                                      "filter 0.4s ease, opacity 0.4s ease",
                                  }}
                                  onClick={() => togglePostExpansion(post._id)}
                                  onLoad={(e) => {
                                    e.target.classList.remove("blur-sm");
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Post Content */}
                          <div className="mb-0 text-[#d7dadc] sm:px-6 px-2 leading-relaxed">
                            {isExpanded ? (
                              <p className="text-[14px]">{post.description}</p>
                            ) : (
                              <p className="text-[14px]">
                                {truncateText(post.description)}{" "}
                                {post.description &&
                                  post.description.split(" ").length > 20 && (
                                    <button
                                      onClick={() =>
                                        togglePostExpansion(post._id)
                                      }
                                      className="text-[#d7dadc] hover:text-[#d7dadc] cursor-pointer transition-colors duration-300 font-medium">
                                      Read more
                                    </button>
                                  )}
                              </p>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-6">
                              <Link
                                to={`/post/${post._id}`}
                                state={{
                                  post,
                                  user: currentUser,
                                  backgroundLocation: location,
                                }}
                                className="flex items-center gap-2 text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium">
                                <MessageSquare size={16} />
                                <span>{post.comments.length}</span>
                              </Link>

                              {/* YouTube-style Vote buttons with separate counts */}
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleVote(post._id, "up")}
                                  className={`flex items-center gap-1 px-3 py-2 transition-all duration-200
        ${
          userVote === "up"
            ? "text-red-600"
            : "text-[#818384] hover:text-red-500"
        }`}>
                                  <ChevronUp size={16} />
                                  <span className="text-sm font-medium">
                                    {formatVoteCount(upvoteCount)}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleVote(post._id, "down")}
                                  className={`flex items-center gap-1 px-3 py-2 transition-all duration-200
        ${
          userVote === "down"
            ? "text-[#7193ff]"
            : "text-[#818384] hover:text-[#7193ff]"
        }`}>
                                  <ChevronDown size={16} />
                                  <span className="text-sm font-medium">
                                    {formatVoteCount(downvoteCount)}
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                                <Share size={16} />
                                <span className="hidden sm:inline">Share</span>
                              </button>
                              <button
                                onClick={() => handleSavePost(post._id)}
                                className={`flex items-center gap-2 hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm ${
                                  savedPosts.has(post._id)
                                    ? "text-[#AD49E1] hover:text-[#AD49E1]"
                                    : "text-[#818384] hover:text-white"
                                }`}>
                                <Bookmark
                                  size={16}
                                  fill={
                                    savedPosts.has(post._id)
                                      ? "#AD49E1"
                                      : "none"
                                  }
                                />
                                <span className="hidden sm:inline">
                                  {savedPosts.has(post._id) ? "Saved" : "Save"}
                                </span>
                              </button>

                              {isExpanded && (
                                <button
                                  onClick={() => togglePostExpansion(post._id)}
                                  className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                                  <ChevronUp size={16} />
                                  <span className="hidden sm:inline">
                                    Collapse
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Follower Suggestions - Individually scrollable */}
            <div
              className="w-[33%] bg-[#0a0a0a] p-2 overflow-y-auto hidden sm:block scrollbar scrollbar-thumb-[#AD49E1]/70 scrollbar-track-[#1a1a1a] scrollbar-rounded
">
              <div className="rounded-3xl h-full">
                <FollowerSuggestions currentUser={currentUser} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Feed;

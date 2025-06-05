import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
} from "lucide-react";

const Feed = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [votedPosts, setVotedPosts] = useState(new Map()); // 'up', 'down', or null
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
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

  const handleVote = (postId, voteType) => {
    const newVotedPosts = new Map(votedPosts);
    const currentVote = newVotedPosts.get(postId);

    if (currentVote === voteType) {
      newVotedPosts.delete(postId);
    } else {
      newVotedPosts.set(postId, voteType);
    }

    setVotedPosts(newVotedPosts);
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

  const truncateText = (text, wordLimit = 30) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/posts");
        const data = await response.json();
        setPosts(data);
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
    <div className="min-h-screen bg-[#1a1a1b] text-[#d7dadc] flex">
      {/* Sidebar - Reddit-style dark */}
      <nav
        className={`w-64 bg-[#1a1a1b] border-r border-[#343536] flex flex-col transition-all duration-300 z-30
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
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#343536]">
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-xl font-bold text-white flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              FISIYO
            </h1>
            <button
              onClick={toggleSidebar}
              className="text-[#818384] hover:text-white lg:hidden">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleCreatePost}
            className="w-full bg-[#49D470] hover:bg-[#49D470] text-white font-medium py-2.5 px-4 rounded-full transition-colors text-sm flex items-center justify-center gap-2">
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4">
          <div className="space-y-1 px-2">
            <button className="flex items-center gap-3 text-white bg-[#0079d3]/20 border-r-2 border-[#0079d3] hover:bg-[#272729] px-3 py-2.5 rounded-md transition-colors w-full text-left font-medium text-sm">
              <Home size={20} />
              <span>Home</span>
            </button>

            <button
              onClick={() =>
                navigate("/explore", { state: { user: currentUser } })
              }
              className="flex items-center gap-3 text-[#d7dadc] hover:text-white hover:bg-[#272729] px-3 py-2.5 rounded-md transition-colors w-full text-left font-medium text-sm">
              <Compass size={20} />
              <span>Explore</span>
            </button>
          </div>
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className="p-4 border-t border-[#343536]">
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="flex items-center gap-3 text-[#d7dadc] hover:text-red-400 hover:bg-[#272729] w-full px-3 py-2.5 rounded-md transition-colors font-medium text-sm">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-[#1a1a1b] border-b border-[#343536] sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-[#d7dadc] hover:text-white lg:hidden">
                <Menu size={24} />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-lg mx-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-[#818384]" />
                </div>
                <input
                  type="text"
                  placeholder="Search Fisiyo"
                  className="w-full pl-10 pr-4 py-2 bg-[#272729] border border-[#343536] rounded-full focus:ring-2 focus:ring-[#0079d3] focus:border-[#0079d3] transition-all text-sm text-white placeholder-[#818384]"
                />
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <button className="text-[#818384] hover:text-white p-2 rounded-full hover:bg-[#272729] transition-colors">
                  <Bell size={20} />
                </button>
                <div
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#272729] px-2 py-1.5 rounded-md transition-colors"
                  onClick={() =>
                    navigate("/profile", { state: { user: currentUser } })
                  }>
                  <img
                    src={user?.picture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown size={16} className="text-[#818384]" />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Feed Content */}
        <main
          className="flex-1 overflow-y-auto bg-[#030303]"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <div className="max-w-2xl mx-auto py-6 px-4">
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#49D470] border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="bg-[#ff4500]/10 border border-[#ff4500]/30 rounded-lg p-4 text-[#ff4500] text-center mb-6">
                {error}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#ff4500]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-[#49D470]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-[#818384] max-w-md mx-auto mb-6">
                  Be the first to share your research or academic insights with
                  the community
                </p>
                <button
                  onClick={handleCreatePost}
                  className="bg-[#49D470] hover:bg-[#49D470] text-white font-medium py-2.5 px-6 rounded-full transition-colors text-sm inline-flex items-center gap-2">
                  <Plus size={16} />
                  <span>Create First Post</span>
                </button>
              </div>
            )}

            {!loading && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => {
                  const isExpanded = expandedPosts.has(post._id);
                  const userVote = votedPosts.get(post._id);
                  const upvoteCount =
                    142 +
                    (userVote === "up" ? 1 : userVote === "down" ? -1 : 0);

                  return (
                    <article
                      key={post._id}
                      className="bg-[#1a1a1b] border border-[#343536] rounded-md hover:border-[#818384] transition-colors">
                      <div className="flex">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center py-2 px-2 bg-[#161617] rounded-l-md border-r border-[#343536]">
                          <button
                            onClick={() => handleVote(post._id, "up")}
                            className={`p-1 rounded hover:bg-[#ff4500]/20 transition-colors ${
                              userVote === "up"
                                ? "text-[#49D470]"
                                : "text-[#818384] hover:text-[#49D470]"
                            }`}>
                            <ArrowUp size={20} />
                          </button>
                          <span
                            className={`text-xs font-bold py-1 ${
                              userVote === "up"
                                ? "text-[#49D470]"
                                : userVote === "down"
                                ? "text-[#7193ff]"
                                : "text-[#d7dadc]"
                            }`}>
                            {upvoteCount}
                          </span>
                          <button
                            onClick={() => handleVote(post._id, "down")}
                            className={`p-1 rounded hover:bg-[#7193ff]/20 transition-colors ${
                              userVote === "down"
                                ? "text-[#7193ff]"
                                : "text-[#818384] hover:text-[#7193ff]"
                            }`}>
                            <ArrowDown size={20} />
                          </button>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 p-3">
                          {/* Post Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-white font-medium">
                              r/{post.community || "AcademicResearch"}
                            </span>
                            <span className="text-[#818384] text-xs">•</span>
                            <span className="text-xs text-[#818384]">
                              Posted by u/
                              {(
                                post.author?.name ||
                                post.authorName ||
                                "anonymous"
                              )
                                .toLowerCase()
                                .replace(/\s+/g, "")}{" "}
                              {formatDate(post.createdAt)} ago
                            </span>
                            <button className="ml-auto text-[#818384] hover:text-white p-1 rounded">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {/* Post Title */}
                          <h2
                            className="text-lg font-medium text-white mb-2 leading-snug cursor-pointer hover:underline"
                            onClick={() => togglePostExpansion(post._id)}>
                            {post.title || "Research Summary"}
                          </h2>

                          {/* Post Content */}
                          <div className="mb-3">
                            <p className="text-[#d7dadc] text-sm leading-relaxed">
                              {isExpanded
                                ? post.description
                                : truncateText(post.description)}
                            </p>

                            {!isExpanded &&
                              post.description &&
                              post.description.split(" ").length > 30 && (
                                <button
                                  onClick={() => togglePostExpansion(post._id)}
                                  className="text-[#0079d3] hover:underline text-sm mt-1">
                                  Read more
                                </button>
                              )}
                          </div>

                          {/* Post Image */}
                          {post.imageUrls?.length > 0 && (
                            <div className="mb-3">
                              <img
                                src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrls[0]}`}
                                alt="Post content"
                                className="w-full max-h-96 object-cover rounded-md border border-[#343536] cursor-pointer"
                                onClick={() =>
                                  !isExpanded && togglePostExpansion(post._id)
                                }
                              />
                            </div>
                          )}

                          {/* Tags */}
                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(isExpanded
                                ? post.tags
                                : post.tags.slice(0, 3)
                              ).map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-[#0079d3]/20 text-[#0079d3] px-2 py-1 rounded-full text-xs font-medium">
                                  {tag}
                                </span>
                              ))}
                              {!isExpanded && post.tags.length > 3 && (
                                <span className="text-[#818384] text-xs py-1">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Bar */}
                          <div className="flex items-center gap-4 text-[#818384] text-xs font-bold">
                            <button className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition-colors">
                              <MessageSquare size={16} />
                              <span>24 Comments</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition-colors">
                              <Share size={16} />
                              <span>Share</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:bg-[#272729] px-2 py-1.5 rounded transition-colors">
                              <Bookmark size={16} />
                              <span>Save</span>
                            </button>

                            {isExpanded && (
                              <button
                                onClick={() => togglePostExpansion(post._id)}
                                className="ml-auto flex items-center gap-1 hover:bg-[#272729] px-2 py-1.5 rounded transition-colors">
                                <ChevronUp size={16} />
                                <span>Collapse</span>
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
        </main>
      </div>
    </div>
  );
};

export default Feed;

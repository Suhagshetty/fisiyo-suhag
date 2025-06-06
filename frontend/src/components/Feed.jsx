import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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

  const truncateText = (text, wordLimit = 20) => {
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
        console.log(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Mock professor suggestions data
  const professorSuggestions = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      department: "Computer Science",
      expertise: ["AI", "Machine Learning"],
      rating: 4.8,
      publications: 42,
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      department: "Physics",
      expertise: ["Quantum Computing", "Nanotechnology"],
      rating: 4.6,
      publications: 38,
    },
    {
      id: 3,
      name: "Dr. Elena Rodriguez",
      department: "Bioengineering",
      expertise: ["Biomaterials", "Tissue Engineering"],
      rating: 4.9,
      publications: 51,
    },
    {
      id: 4,
      name: "Prof. James Wilson",
      department: "Mathematics",
      expertise: ["Topology", "Algebraic Geometry"],
      rating: 4.7,
      publications: 47,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1] flex">
      {/* Sidebar - Fixed 300px width */}
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
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1
              className="text-2xl font-bold text-white flex items-center gap-2"
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
            className="w-full bg-gradient-to-r from-[#49D470] to-[#3BB863] hover:from-[#3BB863] hover:to-[#49D470] text-white font-medium py-3 px-6 rounded-full transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4">
          <div className="space-y-2 px-4">
            <button className="flex items-center gap-4 text-white bg-gradient-to-r from-[#49D470]/20 to-transparent hover:from-[#49D470]/30 hover:to-transparent px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium text-sm">
              <Home size={20} />
              <span>Home</span>
            </button>

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
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className="p-6">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#111111]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-[#d7dadc] hover:text-white lg:hidden">
                <Menu size={24} />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-[#818384]" />
                </div>
                <input
                  type="text"
                  placeholder="Search Fisiyo"
                  className="w-full pl-12 pr-6 py-3 bg-[#1a1a1a] rounded-full focus:ring-2 focus:ring-[#49D470] focus:bg-[#222222] transition-all duration-300 text-sm text-white placeholder-[#818384] shadow-inner"
                />
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <button className="text-[#818384] hover:text-white p-3 rounded-full hover:bg-[#1a1a1a] transition-all duration-300">
                  <Bell size={20} />
                </button>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:bg-[#1a1a1a] px-3 py-2 rounded-xl transition-all duration-300"
                  onClick={() =>
                    navigate("/profile", { state: { user: currentUser } })
                  }>
                  <img
                    src={user?.picture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#49D470]/20"
                  />
                  <ChevronDown size={16} className="text-[#818384]" />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Feed Content */}
        <main
          className="flex-1 overflow-y-auto bg-[#0a0a0a]"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#49D470] border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl p-6 text-red-400 text-center mb-8 backdrop-blur-sm">
                {error}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-gradient-to-br from-[#49D470]/20 to-[#3BB863]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="w-10 h-10 text-[#49D470]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No posts yet
                </h3>
                <p className="text-[#818384] max-w-md mx-auto mb-8 text-lg">
                  Be the first to share your research or academic insights with
                  the community
                </p>
                <button
                  onClick={handleCreatePost}
                  className="bg-gradient-to-r from-[#49D470] to-[#3BB863] hover:from-[#3BB863] hover:to-[#49D470] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 text-sm inline-flex items-center gap-3 shadow-lg hover:shadow-xl">
                  <Plus size={16} />
                  <span>Create First Post</span>
                </button>
              </div>
            )}

            {!loading && posts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2  gap-15">
                {posts.map((post) => {
                  const isExpanded = expandedPosts.has(post._id);
                  const userVote = votedPosts.get(post._id);
                  const upvoteCount =
                    142 +
                    (userVote === "up" ? 1 : userVote === "down" ? -1 : 0);

                  return (
                    <article
                      key={post._id}
                      className="bg-gradient-to-br from-transparent to-gray-50/10 rounded-3xl overflow-hidden  transition-all duration-500 shadow-2xl hover:shadow-3xl"
                      style={{ minHeight: "400px" }}>
                      {/* Post Image - First */}
                      {post.imageUrl?.length > 0 && (
                        <div className="relative overflow-hidden">
                          <img
                            src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                            alt="Post content"
                            className="w-full h-64 object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                            onClick={() =>
                              !isExpanded && togglePostExpansion(post._id)
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="p-3">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-white bg-[#272b30] px-3 py-1 rounded-full">
                              r/{post.community || "AcademicResearch"}
                            </span>
                            <span className="text-sm text-[#a0a2a4]">
                              e/
                              {(post.userHandle || "anonymous")
                                .toLowerCase()
                                .replace(/\s+/g, "")}{" "}
                              · {formatDate(post.createdAt)} ago
                            </span>
                          </div>

                          <button className="text-[#a0a2a4] hover:text-white p-2 rounded-full hover:bg-[#1f1f1f] transition-colors duration-200">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        {/* Post Title */}
                        {/* <h2
                          className="text-xl font-bold text-white mb-4 leading-tight cursor-pointer hover:text-[#49D470] transition-colors duration-300"
                          onClick={() => togglePostExpansion(post._id)}>
                          {post.title || "Research Summary"}
                        </h2> */}

                        <Link
                          to={`/post/${post._id}`}
                          state={{
                            post,
                            user: currentUser,
                            backgroundLocation: location,
                          }}
                          className="text-base font-bold text-white mb-4 leading-tight cursor-pointer hover:text-[#49D470] transition-colors duration-300"
                          onClick={() => togglePostExpansion(post._id)}>
                          {post.title || "Research Summary"}
                        </Link>

                        {/* Post Content */}
                        <div className="mb-6 text-[#d7dadc] leading-relaxed">
                          {isExpanded ? (
                            <p className="text-[12.5px]">{post.description}</p>
                          ) : (
                            <p className="text-[12.5px]">
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

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-1">
                            {(isExpanded
                              ? post.tags
                              : post.tags.slice(0, 3)
                            ).map((tag) => (
                              <span
                                key={tag}
                                className=" text-[#49D470] px-3 rounded-full  text-[11px] font-medium  cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                            {!isExpanded && post.tags.length > 3 && (
                              <span className="text-[#818384] text-sm py-1.5 px-2">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <Link
                              to={`/post/${post._id}`}
                              state={{
                                post,
                                user: currentUser,
                                backgroundLocation: location,
                              }}
                              className="flex items-center gap-2 text-[#818384] hover:text-[#49D470] hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium">
                              <MessageSquare size={16} />
                              <span>{post.comments.length}</span>
                            </Link>

                            {/* Vote buttons moved here */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVote(post._id, "up")}
                                className={`p-2 rounded-full transition-all duration-300 ${
                                  userVote === "up"
                                    ? "text-[#49D470] bg-[#49D470]/20"
                                    : "text-[#818384] hover:text-[#49D470] hover:bg-[#1a1a1a]"
                                }`}>
                                <ArrowUp size={16} />
                              </button>
                              <span
                                className={`text-sm font-bold px-2 ${
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
                                className={`p-2 rounded-full transition-all duration-300 ${
                                  userVote === "down"
                                    ? "text-[#7193ff] bg-[#7193ff]/20"
                                    : "text-[#818384] hover:text-[#7193ff] hover:bg-[#1a1a1a]"
                                }`}>
                                <ArrowDown size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                              <Share size={16} />
                              <span className="hidden sm:inline">Share</span>
                            </button>
                            <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                              <Bookmark size={16} />
                              <span className="hidden sm:inline">Save</span>
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
        </main>
      </div>
    </div>
  );
};

export default Feed;

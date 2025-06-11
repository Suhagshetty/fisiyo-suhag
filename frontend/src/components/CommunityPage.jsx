import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  MessageSquare,
  Share,
  Bookmark,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Plus,
  FileText,
  BarChart2,
  HelpCircle,
} from "lucide-react";

const CommunityPage = () => {
  const { name } = useParams();
  const { logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [votedPosts, setVotedPosts] = useState(new Map());
  const [upvoteCounts, setUpvoteCounts] = useState(new Map());
  const [downvoteCounts, setDownvoteCounts] = useState(new Map());

  // Handle navigation
  const navigateTo = (path) => {
    navigate(path, { state: { user: currentUser } });
  };

  // Fetch community data
  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        setIsLoading(true);
        const communityResponse = await axios.get(
          `http://localhost:3000/api/communities/name/${name}`
        );
        const communityData = communityResponse.data;

        // Fetch full posts data
        const postsResponse = await axios.get(
          `http://localhost:3000/api/posts/by-communities?ids=${communityData._id}`
        );

        setCommunity({
          ...communityData,
          posts: postsResponse.data,
        });

        setIsLoading(false);

        // Initialize vote counts
        const initialUpvoteCounts = new Map();
        const initialDownvoteCounts = new Map();

        postsResponse.data.forEach((post) => {
          initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
          initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
        });

        setUpvoteCounts(initialUpvoteCounts);
        setDownvoteCounts(initialDownvoteCounts);
      } catch (err) {
        setError("Failed to load community");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchCommunityAndPosts();
  }, [name]);

  // Load user's existing votes
  useEffect(() => {
    const loadUserVotes = async () => {
      if (currentUser?._id || user?.sub) {
        try {
          const userId = currentUser?._id || user?.sub;
          const response = await axios.get(
            `http://localhost:3000/api/posts/votes/${userId}`
          );
          if (response.data) {
            const votesMap = new Map();
            Object.entries(response.data).forEach(([postId, voteType]) => {
              votesMap.set(postId, voteType);
            });
            setVotedPosts(votesMap);
          }
        } catch (error) {
          console.error("Error loading user votes:", error);
        }
      }
    };

    if (community?.posts && community.posts.length > 0) {
      loadUserVotes();
    }
  }, [community, currentUser, user]);

  const handleVote = async (postId, voteType) => {
    try {
      const currentVote = votedPosts.get(postId);
      const currentUpvotes = upvoteCounts.get(postId) || 0;
      const currentDownvotes = downvoteCounts.get(postId) || 0;

      let newUpvotes = currentUpvotes;
      let newDownvotes = currentDownvotes;
      let newVoteType = voteType;

      if (currentVote === voteType) {
        newVoteType = null;
        if (voteType === "up") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
      } else if (currentVote && currentVote !== voteType) {
        if (currentVote === "up" && voteType === "down") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
          newDownvotes = currentDownvotes + 1;
        } else if (currentVote === "down" && voteType === "up") {
          newDownvotes = Math.max(0, currentDownvotes - 1);
          newUpvotes = currentUpvotes + 1;
        }
      } else {
        if (voteType === "up") {
          newUpvotes = currentUpvotes + 1;
        } else {
          newDownvotes = currentDownvotes + 1;
        }
      }

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
      const response = await axios.post(
        `http://localhost:3000/api/posts/${postId}/vote`,
        {
          voteType: newVoteType,
          userId: currentUser?._id || user?.sub,
        }
      );

      // Update with server response
      setUpvoteCounts((prev) =>
        new Map(prev).set(postId, response.data.upvotes?.length || 0)
      );
      setDownvoteCounts((prev) =>
        new Map(prev).set(postId, response.data.downvotes?.length || 0)
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const togglePostExpansion = (postId) => {
    const newExpandedPosts = new Set(expandedPosts);
    if (newExpandedPosts.has(postId)) {
      newExpandedPosts.delete(postId);
    } else {
      newExpandedPosts.add(postId);
    }
    setExpandedPosts(newExpandedPosts);
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

  const handleCreateOption = (type) => {
    setShowCreateMenu(false);
    navigate(`/compose/${type}`, {
      state: {
        backgroundLocation: location,
        user: currentUser,
        community: {
          name: community.name,
          url: community.avatarUrl,
          id: community._id,
        },
      },
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#AD49E1] mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-white">
            Loading Community Data
          </h2>
          <p className="text-[#818384]">Analyzing scientific parameters...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !community) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="bg-[#111111] p-8 rounded-3xl max-w-md w-full shadow-2xl border border-[#272b30]">
          <div className="text-center">
            <div className="bg-red-500/20 p-4 rounded-full inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">
              Community Not Found
            </h2>
            <p className="text-[#818384] mt-2">
              The community <span className="font-mono">c/{name}</span> could
              not be located in our scientific archives.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white font-medium py-2 px-6 rounded-full transition-all duration-300">
              Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1]">
      {/* Banner */}
      <div className="relative ">
        <div
          className="sm:h-64 h-30 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(
              to top right,
              ${
                community.colorPrimary || "#AD49E1"
              }CC 0%,     
              ${
                community.colorPrimary || "#AD49E1"
              }99 30%,   
              ${
                community.colorPrimary || "#AD49E1"
              }66 60%,   
              transparent 100%                                   
            ), url(${
              community.bannerUrl ||
              "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1792&q=80"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div className="absolute inset-0 flex sm:items-end items-start justify-start">
            <div className="container mx-auto sm:px-4 px-0 sm:pb-6 pb-0">
              <div className="flex sm:items-end items-center sm:gap-6 gap-4">
                <div className="sm:w-68 sm:h-50 w-35 h-28 rounded-full overflow-visible">
                  {community.avatarUrl ? (
                    <img
                      src={community.avatarUrl}
                      alt={community.title}
                      className="w-full h-full object-contain"
                      style={{
                        filter: "drop-shadow(5px 30px 10px rgba(0, 0, 0, 0.1))",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-bold bg-gray-600"
                      style={{
                        filter: "drop-shadow(0 20px 15px rgba(0, 0, 0, 0.4))",
                        transform: "translateY(-10px)",
                      }}>
                      {community.title.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Title and Info */}
                <div className="text-white">
                  <h1
                    className="sm:text-5xl text-xs sm:mb-3  font-bold"
                    style={{
                      color: community.colorSecondary || "#ffffff",
                    }}>
                    {community.title}
                  </h1>

                  <p
                    className="sm:text-xl  text-xs opacity-90 sm:mt-1"
                    style={{
                      color: community.colorSecondary || "#ffffff",
                    }}>
                    {" "}
                    c/{community.name}
                  </p>
                  <p
                    className="sm:mt-3  sm:text-base  text-xs text-[#d7dadc] max-w-2xl"
                    style={{
                      color: community.colorSecondary || "#ffffff",
                    }}>
                    {community.description}
                  </p>

                  <div className="flex items-center gap-6 sm:mt-4 ">
                    <div
                      className="flex items-center sm:text-base  text-xs text-[#d7dadc]"
                      style={{
                        color: community.colorSecondary || "#ffffff",
                      }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="sm:h-5 sm:w-5 w-3 h-3 mr-2 "
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        {community.memberCount.toLocaleString()} members
                      </span>
                    </div>

                    <div
                      className="flex items-center text-[#d7dadc]"
                      style={{
                        color: community.colorSecondary || "#ffffff",
                      }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="sm:h-5 sm:w-5 w-3 h-3 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium sm:text-base  text-xs">
                        {community.postCount.toLocaleString()} research posts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Button */}
      {isAuthenticated && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none">
              <Plus size={24} />
            </button>

            {showCreateMenu && (
              <div className="absolute bottom-full right-0 mb-4 w-56 bg-[#1f1f1f] rounded-xl shadow-2xl border border-[#333] overflow-hidden animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => handleCreateOption("post")}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
                  <FileText size={16} className="text-[#AD49E1]" />
                  <span>Create Post</span>
                </button>
                <button
                  onClick={() => handleCreateOption("poll")}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
                  <BarChart2 size={16} className="text-[#AD49E1]" />
                  <span>Create Poll</span>
                </button>
                <button
                  onClick={() => handleCreateOption("discussion")}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
                  <MessageSquare size={16} className="text-[#AD49E1]" />
                  <span>New Discussion</span>
                </button>
                <button
                  onClick={() => handleCreateOption("qna")}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white">
                  <HelpCircle size={16} className="text-[#AD49E1]" />
                  <span>Q&A Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        {community.posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[#AD49E1]/20 to-[#AD49E1]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-[#AD49E1]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No posts yet
            </h3>
            <p className="text-[#818384] max-w-md mx-auto mb-8 text-lg">
              Be the first to share in this community
            </p>
            {isAuthenticated && (
              <button
                onClick={() => handleCreateOption("post")}
                className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] hover:from-[#AD49E1] hover:to-[#AD49E1] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 text-sm inline-flex items-center gap-3 shadow-lg hover:shadow-xl">
                <Plus size={16} />
                <span>Create First Post</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {community.posts.map((post) => {
              const isExpanded = expandedPosts.has(post._id);
              const userVote = votedPosts.get(post._id);
              const upvoteCount = upvoteCounts.get(post._id) || 0;
              const downvoteCount = downvoteCounts.get(post._id) || 0;

              return (
                <article
                  key={post._id}
                  className="bg-[#111111] border-b border-[#222] overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-3xl">
                  {/* Post Header */}
                  <div className="flex items-center justify-between sm:px-6 px-2 mb-1 pt-3">
                    <div className="flex items-center gap-3 mb-1">
                      <img
                        className="w-12 h-12 object-cover object-center"
                        src={post.community_dp}
                        alt="community"
                      />
                      <div>
                        <h2 className="text-white font-medium text-[15px]">
                          c/{post.communityHandle || "Astronomy"}
                        </h2>
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

                  {/* Post Image */}
                  {post.imageUrl?.length > 0 && (
                    <div className="relative mb-4 bg-[#101010] overflow-hidden">
                      <div className="w-full" style={{ minHeight: "300px" }}>
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
                            transition: "filter 0.4s ease, opacity 0.4s ease",
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
                              onClick={() => togglePostExpansion(post._id)}
                              className="text-[#d7dadc] hover:text-[#d7dadc] cursor-pointer transition-colors duration-300 font-medium">
                              Read more
                            </button>
                          )}
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 pb-3 sm:px-6 px-2">
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

                      {/* Vote buttons */}
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
                      <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                        <Bookmark size={16} />
                        <span className="hidden sm:inline">Save</span>
                      </button>

                      {isExpanded && (
                        <button
                          onClick={() => togglePostExpansion(post._id)}
                          className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                          <ChevronUp size={16} />
                          <span className="hidden sm:inline">Collapse</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;

// src/pages/CommunityPage.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Menu,
  X,
  Home,
  Compass,
  Users,
  LogOut,
  ChevronDown,
  Calendar,
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

const CommunityPage = () => {
  const { name } = useParams();
  const { logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [votedPosts, setVotedPosts] = useState(new Map());
  const [upvoteCounts, setUpvoteCounts] = useState(new Map());
  const [downvoteCounts, setDownvoteCounts] = useState(new Map());
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Format date
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

  // Truncate text
  const truncateText = (text, wordLimit = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Format vote count
  const formatVoteCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  // Handle post creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsCreatingPost(true);

    try {
      // In a real app, you would upload the image and create the post
      const postData = {
        ...newPost,
        author: "current_user", // Replace with actual user
        upvotes: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        community: name,
      };

      setPosts([postData, ...posts]);

      // Reset form
      setNewPost({ title: "", content: "", image: null });

      // Update community stats
      if (community) {
        setCommunity({
          ...community,
          postCount: community.postCount + 1,
          lastActivityAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Handle navigation
  const navigateTo = (path) => {
    navigate(path, { state: { user: currentUser } });
  };

  // Handle vote
  const handleVote = async (postId, voteType) => {
    try {
      const currentVote = votedPosts.get(postId);
      const currentUpvotes = upvoteCounts.get(postId) || 0;
      const currentDownvotes = downvoteCounts.get(postId) || 0;

      let newUpvotes = currentUpvotes;
      let newDownvotes = currentDownvotes;
      let newVoteType = voteType;

      // Handle vote logic
      if (currentVote === voteType) {
        // User is removing their vote
        newVoteType = null;
        if (voteType === "up") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
      } else if (currentVote && currentVote !== voteType) {
        // User is switching vote
        if (currentVote === "up" && voteType === "down") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
          newDownvotes = currentDownvotes + 1;
        } else if (currentVote === "down" && voteType === "up") {
          newDownvotes = Math.max(0, currentDownvotes - 1);
          newUpvotes = currentUpvotes + 1;
        }
      } else {
        // New vote
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
      const response = await axios.post(
        `http://localhost:3000/api/posts/${postId}/vote`,
        {
          voteType: newVoteType,
          userId: currentUser?._id || user?.sub,
        }
      );

      if (!response.data.success) {
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

      // Update with actual server response
      const updatedPost = response.data.post;
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

  // Create new post
  const createNewPost = () => {
    navigate("/compose/post", {
      state: {
        backgroundLocation: location,
        user: currentUser,
      },
    });
  };

  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/communities/name/${name}`
        );
        setCommunity(response.data);

        // Fetch posts for this community
        // const postsResponse = await axios.get(
        //   `http://localhost:3000/api/posts/community/${response.data._id}`
        // );
        // setPosts(postsResponse.data);

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load community");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchCommunity();
  }, [name]);

  // Initialize vote counts
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" >
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
              The community <span className="font-mono">r/{name}</span> could
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1] flex">
      {/* Left Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}

        {/* Community Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-screen mx-auto ">
            {/* Community Header */}
            <div className="relative mb-8">
              {/* Banner */}

              {/* Banner */}
              <div
                className="h-64 overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to top right, ${
                    community.colorPrimary || "#AD49E1"
                  }CC 30%, transparent 60%), url(${
                    community.bannerUrl ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1792&q=80"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                <div className="absolute inset-0 flex items-end">
                  <div className="container mx-auto px-4 pb-6">
                    <div className="flex items-end gap-6">
                      {/* Avatar */}
                      <div
                        className="w-60 h-50 rounded-full"
                       >
                        {community.avatarUrl ? (
                          <img
                            src={community.avatarUrl}
                            alt={community.title}
                            className="w-full h-full  object-contain"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                            {community.title.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Title and Info */}
                      <div className="text-white">
                        <h1
                          className="text-4xl font-bold"
                          style={{ 
                            color: community.colorSecondary || "#ffffff", // fallback if colorSecondary is not set
                          }}>
                          {community.title}
                        </h1>

                        <p className="text-xl opacity-90 mt-1">
                          r/{community.name}
                        </p>
                        <p className="mt-3 text-[#d7dadc] max-w-2xl">
                          {community.description}
                        </p>

                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center text-[#d7dadc]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 "
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

                          <div className="flex items-center text-[#d7dadc]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium">
                              {community.postCount.toLocaleString()} research
                              posts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row px-2 pb-6 gap-8">
              {/* Main Content */}
              <div className="lg:w-2/3">
                {/* Create Post Card */}

                {/* Posts Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Latest Research
                    </h2>
                    <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-[#272b30] overflow-hidden">
                      <button className="px-4 py-2 text-sm font-medium text-[#818384] hover:text-white hover:bg-[#222222] transition-colors">
                        Hot
                      </button>
                      <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#AD49E1]/30 to-[#AD49E1]/30 text-white border-l border-r border-[#272b30]">
                        New
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-[#818384] hover:text-white hover:bg-[#222222] transition-colors">
                        Top
                      </button>
                    </div>
                  </div>

                  {/* Posts List */}
                  {posts.length === 0 ? (
                    <div className="bg-[#111111] rounded-3xl shadow-2xl border border-[#272b30] p-12 text-center">
                      <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-[#AD49E1]/20 to-[#AD49E1]/20 rounded-full mb-6">
                        <GraduationCap className="h-16 w-16 text-[#AD49E1]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        No Research Yet
                      </h3>
                      <p className="text-[#818384] max-w-md mx-auto mb-8">
                        This scientific community is awaiting its first
                        breakthrough. Be the pioneer to share your research and
                        ignite discovery.
                      </p>
                      <button
                        onClick={() =>
                          document
                            .querySelector("form")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] hover:from-[#AD49E1] hover:to-[#AD49E1] text-white font-medium py-2 px-6 rounded-full transition-all duration-300">
                        Share Your Research
                      </button>
                    </div>
                  ) : (
                    posts.map((post) => {
                      const userVote = votedPosts.get(post._id);
                      const upvoteCount = upvoteCounts.get(post._id) || 0;
                      const downvoteCount = downvoteCounts.get(post._id) || 0;

                      return (
                        <div
                          key={post._id}
                          className="bg-gradient-to-br from-transparent to-[#1a1a1a] rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-3xl mb-6">
                          {/* Post Image */}
                          {post.imageUrl?.length > 0 && (
                            <div className="relative overflow-hidden">
                              <img
                                src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                                alt="Post content"
                                className="w-full h-64 object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          )}

                          {/* Post Content */}
                          <div className="p-6">
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
                            <Link
                              to={`/post/${post._id}`}
                              state={{
                                post,
                                user: currentUser,
                                backgroundLocation: location,
                              }}
                              className="text-lg font-bold text-white mb-4 leading-tight cursor-pointer hover:text-[#AD49E1] transition-colors duration-300 block">
                              {post.title || "Research Summary"}
                            </Link>

                            {/* Post Content */}
                            <div className="mb-6 text-[#d7dadc] leading-relaxed">
                              <p className="text-sm">
                                {truncateText(post.description, 30)}
                              </p>
                            </div>

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
                                  className="flex items-center gap-2 text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium">
                                  <MessageSquare size={16} />
                                  <span>{post.comments.length}</span>
                                </Link>

                                {/* Vote buttons */}
                                <div className="flex items-center bg-[#272b30] rounded-full">
                                  <button
                                    onClick={() => handleVote(post._id, "up")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-l-full transition-all duration-300 ${
                                      userVote === "up"
                                        ? "text-[#AD49E1] bg-[#AD49E1]/20"
                                        : "text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a]"
                                    }`}>
                                    <ArrowUp size={16} />
                                    <span className="text-sm font-medium">
                                      {formatVoteCount(upvoteCount)}
                                    </span>
                                  </button>

                                  <div className="w-px h-8 bg-[#3a3a3a]"></div>

                                  <button
                                    onClick={() => handleVote(post._id, "down")}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-r-full transition-all duration-300 ${
                                      userVote === "down"
                                        ? "text-[#7193ff] bg-[#7193ff]/20"
                                        : "text-[#818384] hover:text-[#7193ff] hover:bg-[#1a1a1a]"
                                    }`}>
                                    <ArrowDown size={16} />
                                    <span className="text-sm font-medium">
                                      {formatVoteCount(downvoteCount)}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                                  <Share size={16} />
                                  <span className="hidden sm:inline">
                                    Share
                                  </span>
                                </button>
                                <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
                                  <Bookmark size={16} />
                                  <span className="hidden sm:inline">Save</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3">
                {/* About Card */}
                <div className="bg-[#111111] rounded-3xl shadow-2xl border border-[#272b30] p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                    <BookOpen className="mr-2 text-[#AD49E1]" />
                    Research Collective Details
                  </h2>

                  <p className="text-[#d7dadc] mb-6">{community.description}</p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-[#AD49E1]/20 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-[#AD49E1]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#818384]">
                          Research Members
                        </p>
                        <p className="font-bold text-white">
                          {community.memberCount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-[#AD49E1]/20 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-[#AD49E1]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#818384]">Established</p>
                        <p className="font-bold text-white">
                          {new Date(community.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] hover:from-[#AD49E1] hover:to-[#AD49E1] text-white font-medium py-3 px-4 rounded-full transition-all duration-300">
                    Join Research Collective
                  </button>
                </div>

                {/* Rules Card */}
                <div className="bg-[#111111] rounded-3xl shadow-2xl border border-[#272b30] p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                    <Star className="mr-2 text-[#AD49E1]" />
                    Scientific Conduct Protocol
                  </h2>

                  <ol className="space-y-4">
                    {community.rules.map((rule, index) => (
                      <li key={index} className="flex">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#AD49E1]/20 flex items-center justify-center mr-3">
                          <span className="font-bold text-[#AD49E1]">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{rule.title}</h3>
                          <p className="text-[#818384] text-sm">
                            {rule.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Moderators Card */}
                <div className="bg-[#111111] rounded-3xl shadow-2xl border border-[#272b30] p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                    <GraduationCap className="mr-2 text-[#AD49E1]" />
                    Research Moderators
                  </h2>

                  {community.moderators.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center p-4 bg-[#1a1a1a] rounded-full mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-[#818384]"
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
                      <p className="text-[#818384]">
                        No moderators assigned yet
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {community.moderators.map((mod, index) => (
                        <li
                          key={index}
                          className="flex items-center p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222222] transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-white">
                              M
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">Dr. {mod}</p>
                            <p className="text-xs text-[#818384]">
                              Lead Researcher
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityPage;

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Share,
  Bookmark,
  ChevronUp,
  ChevronDown,
  User,
  X,
  Loader2,
  Send,
} from "lucide-react";

const PostDetail = ({ isModal = false, backgroundLocation = null }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(state?.post || null);
  const [user, setUser] = useState(state?.user || null);
  console.log(user);
  
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const currentUserId = user?._id || user?.sub;

  
  const [loading, setLoading] = useState(!post);
  const [voted, setVoted] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [replyContent, setReplyContent] = useState("");
  const [commentVotes, setCommentVotes] = useState({});
  const [simulationActive, setSimulationActive] = useState(false);
  const hoverTimeoutRef = useRef(null);
const [isHoveringCard, setIsHoveringCard] = useState(false);

useEffect(() => {
  return () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };
}, []);
  const UserProfileCard = ({ user, position }) => {
    if (!user) return null;

    return (
      <div
        className="fixed z-50 bg-[#161617] border border-[#1E1E1E] rounded-xl p-4 w-64 shadow-lg pointer-events-none"
        style={{
          top: position.top + 10,
          left: Math.max(10, Math.min(position.left, window.innerWidth - 270)),
        }}
        onMouseEnter={() => {
          setIsHoveringCard(true);
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
        }}
        onMouseLeave={() => {
          setIsHoveringCard(false);
          hoverTimeoutRef.current = setTimeout(() => {
            setHoveredUser(null);
          }, 300);
        }}>
        
        <div className="flex flex-col items-center">
          <img
            className="w-16 h-16 rounded-full mb-3"
            src={
              user.userDp
                ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${user.userDp}`
                : "/default-avatar.png"
            }
            alt="avatar"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <h3 className="text-white font-medium">n/{user.handle}</h3>
          <button
            onClick={() => console.log(`followed ${user.handle}`)}
            className="mt-3 w-full py-1  text-white rounded-l border border-white font-medium hover:bg-[#AD49E1]/90 transition-colors pointer-events-auto">
            Follow
          </button>
        </div>
      </div>
    );
  };

  // Fetch post and comments
  useEffect(() => {
    const fetchData = async () => {
      if (!post && postId) {
        try {
          setLoading(true);

          // Fetch post
          const postRes = await fetch(
            `http://localhost:3000/api/posts/${postId}`
          );
          if (!postRes.ok) throw new Error("Failed to fetch post");
          const postData = await postRes.json();
          setPost(postData);

          // Fetch comments
          const commentsRes = await fetch(
            `http://localhost:3000/api/posts/${postId}/comments`
          );
          if (!commentsRes.ok) throw new Error("Failed to fetch comments");
          const commentsData = await commentsRes.json();
          console.log(commentsData);

          setComments(commentsData);
          setVoteCount(postData.upvotes - postData.downvotes);
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [post, postId]);

  useEffect(() => {
    if (!simulationActive) return;

    const intervalTime = 5000;
    let simulationInterval;

    const startSimulation = async () => {
      await simulateComment();
      simulationInterval = setInterval(simulateComment, intervalTime);
    };

    startSimulation();

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationActive]);

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

  const handleDeleteComment = async (commentId, userHandle) => {
    // if (!window.confirm("Delete this comment and all its replies?")) return;

    setDeletingCommentId(commentId);
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ handle: userHandle }),
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      await fetchComments();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };
  

  const simulateComment = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/simulate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Simulation failed");

      const data = await res.json();
      console.log("Simulated comment:", data.comment.body);

      fetchComments();

      return data.comment;
    } catch (error) {
      console.error("Simulate comment error:", error);
      return null;
    }
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

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim() || !user || !post) return;

    try {
      const replyData = {
        body: replyContent,
        author: user._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
        userDp: user.profilePicture,
      };

      const response = await fetch(
        `http://localhost:3000/api/comments/${parentCommentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(replyData),
        }
      );

      if (!response.ok) throw new Error("Failed to post reply");

      await fetchComments();
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const commentsRes = await fetch(
        `http://localhost:3000/api/posts/${postId}/comments`
      );
      if (!commentsRes.ok) throw new Error("Failed to fetch comments");
      const commentsData = await commentsRes.json();
      console.log(commentsData);

      setComments(commentsData);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  const renderComment = (comment, depth = 0) => {
    const isReplying = replyingTo === comment._id;

    return (
      <div
        key={comment._id}
        className={`pl-2 mt-3 ${
          depth > 0 ? "border-l border-[#1E1E1E]" : ""
        } transition-colors duration-200`}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-0.5">
              <Link
                to={`/n/${comment.handle}`}
                state={{ user: user, handle: comment.handle }}
                className="">
                <img
                  className="w-8 h-8 rounded-full"
                  src={
                    comment.userDp
                      ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${comment.userDp}`
                      : "/default-avatar.png"
                  }
                  alt="avatar"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </Link>
              <div>
                <Link
                  to={`/n/${comment.handle}`}
                  state={{ user: user, handle: comment.handle }}>
                  <span
                    className="text-sm font-medium text-white hover:underline cursor-pointer"
                    onMouseEnter={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setHoveredUser({
                        handle: comment.handle,
                        userDp: comment.userDp,
                      });
                      setHoverPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                      });

                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isHoveringCard) {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredUser(null);
                        }, 300);
                      }
                    }}>
                    n/{comment.handle || "Anonymous"}
                  </span>
                </Link>
                <span className="text-xs text-[#818384] ml-2">
                  {new Date(comment.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>

            <p className="text-[#d7dadc] pl-11 mb-0.5 mr-2">{comment.body}</p>

            <div className="pl-11">
              <div className="pl-0 flex items-center gap-4 mt-0 text-sm text-[#818384]">
                <button
                  onClick={() =>
                    setReplyingTo((prev) =>
                      prev === comment._id ? null : comment._id
                    )
                  }
                  className="hover:text-[#AD49E1] font-medium">
                  {isReplying ? "Cancel" : "Reply"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCommentVote(comment._id, "up")}
                    className={`p-1.5 rounded-full transition-colors ${
                      commentVotes[comment._id] === "up"
                        ? "text-[#AD49E1] bg-[#AD49E1]/10"
                        : "hover:bg-[#AD49E1]/10 hover:text-[#AD49E1]"
                    }`}>
                    <ChevronUp size={18} />
                  </button>
                  <span className="text-xs font-bold text-[#d7dadc]">
                    {comment.voteCount || 0}
                  </span>
                  <button
                    onClick={() => handleCommentVote(comment._id, "down")}
                    className={`p-1.5 rounded-full transition-colors ${
                      commentVotes[comment._id] === "down"
                        ? "text-[#7193ff] bg-[#7193ff]/10"
                        : "hover:bg-[#7193ff]/10 hover:text-[#7193ff]"
                    }`}>
                    <ChevronDown size={18} />
                  </button>
                </div>

                {currentUserId === comment.author && (
                  <button
                    onClick={() => handleDeleteComment(comment._id, user.handle)}
                    disabled={deletingCommentId === comment._id}
                    className={`text-[#818384] hover:text-red-500 font-medium transition-colors ${
                      deletingCommentId === comment._id ? "animate-pulse" : ""
                    }`}>
                    {deletingCommentId === comment._id ? (
                      <Loader2 className="animate-spin h-4 w-4 inline mr-1" />
                    ) : null}
                    Delete
                  </button>
                )}
              </div>

              {isReplying && (
                <div className="mt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-3 text-white placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors"
                    placeholder="Write a reply..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleReplySubmit(comment._id)}
                      disabled={!replyContent.trim()}
                      className={`flex items-center gap-2 font-medium py-1.5 px-5 rounded-full text-sm transition-all ${
                        !replyContent.trim()
                          ? "bg-[#AD49E1]/50 cursor-not-allowed"
                          : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                      }`}>
                      <Send size={14} />
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    try {
      setIsCommenting(true);
      const commentData = {
        body: newComment,
        author: user?._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
        userDp: user.profilePicture,
      };

      const response = await fetch(
        `http://localhost:3000/api/posts/${post._id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const savedComment = await response.json();
      setComments((prev) => [
        {
          ...savedComment,
          voteCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user || !post) return;

    try {
      const currentVote = voted;
      const currentCount = voteCount;
      let newCount = currentCount;
      let newVoteType = null;

      if (currentVote === "up" && voteType === "up") {
        newCount = currentCount - 1;
      } else if (currentVote === "up" && voteType === "down") {
        newCount = currentCount - 2;
        newVoteType = "down";
      } else if (currentVote === "down" && voteType === "up") {
        newCount = currentCount + 2;
        newVoteType = "up";
      } else if (currentVote === "down" && voteType === "down") {
        newCount = currentCount + 1;
      } else if (!currentVote && voteType === "up") {
        newCount = currentCount + 1;
        newVoteType = "up";
      } else if (!currentVote && voteType === "down") {
        newCount = currentCount - 1;
        newVoteType = "down";
      }

      setVoteCount(newCount);
      setVoted(newVoteType);

      await fetch(`http://localhost:3000/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voteType: newVoteType,
          userId: user?._id || user?.sub,
        }),
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCommentVote = (commentId, voteType) => {
    setCommentVotes((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === voteType ? null : voteType,
    }));
  };

  const handleClose = () => {
    if (isModal && backgroundLocation) {
      navigate(backgroundLocation.pathname + backgroundLocation.search, {
        state: backgroundLocation.state,
      });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] ${
          isModal ? "backdrop-blur-sm" : ""
        }`}>
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-[#AD49E1] h-10 w-10" />
          <p className="mt-4 text-[#d7dadc]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] ${
          isModal ? "backdrop-blur-sm" : ""
        }`}>
        <div className="bg-[#161617] p-8 rounded-2xl text-center">
          <p className="text-xl text-[#d7dadc] mb-4">Post not found</p>
          <button
            onClick={handleClose}
            className="bg-[#AD49E1] hover:bg-[#AD49E1]/90 text-white font-medium py-2 px-6 rounded-full transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 z-50 overflow-y-auto"
          : "min-h-screen bg-[#030303]"
      }`}>
      {isModal && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-[#AD49E1]/20 backdrop-blur-xs transition-opacity"
        />
      )}

      <div
        className={`relative ${
          isModal
            ? "flex items-center justify-center min-h-screen sm:pt-20 pt-0"
            : ""
        }`}>
        <div
          className={`bg-[#0A0A0A] sm:rounded-2xl overflow-hidden border border-[#1E1E1E] shadow-2xl ${
            isModal ? "w-full max-w-4xl" : "max-w-4xl mx-auto my-8"
          }`}>
          {/* Header */}
          <div className="sm:p-6 p-2 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-0">
                <img
                  className="w-12 h-12 object-cover object-center"
                  src={post.community_dp}
                  alt="community"
                />
                <div>
                  <h2 className="text-white sm:text-base text-sm font-medium">
                    c/{post.communityHandle || "Astronomy"}
                  </h2>
                  <p className="text-[#818384] sm:text-sm text-sm flex items-center">
                    <span>
                      n/
                      {(post.userHandle || "anonymous")
                        .toLowerCase()
                        .replace(/\s+/g, "")}
                    </span>
                    <span className="mx-1.5">·</span>
                    {formatDate(post.createdAt)} ago
                  </p>
                </div>
              </div>
              <h1 className="sm:text-2xl text-lg font-bold px-1 text-white mt-4 leading-tight">
                {post.title || "Research Summary"}
              </h1>
            </div>

            {isModal && (
              <button
                onClick={handleClose}
                className="text-[#818384] hover:text-white p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="">
            <div className="mb-6 sm:px-6 px-3 text-[#d7dadc] sm:text-lg text-sm leading-relaxed">
              <p className="whitespace-pre-line">{post.description}</p>
            </div>

            {post.imageUrl?.length > 0 && (
              <div className="sm:mb-8 mb-2 sm:px-6 px-0 overflow-hidden sm:rounded-xl bg-black">
                <img
                  src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                  alt="Post content"
                  className="w-full max-h-[70vh] object-contain"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 py-1 sm:mb-8 mb-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#AD49E1]/10 text-[#AD49E1] px-3 py-1.5 rounded-full sm:text-sm text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex items-center gap-4 text-[#818384] border-t border-[#1E1E1E] pt-5">
              <div className="flex items-center bg-[#161617] rounded-full">
                <button
                  onClick={() => handleVote("up")}
                  className={`p-2 rounded-l-full transition-colors ${
                    voted === "up"
                      ? "text-[#AD49E1] bg-[#AD49E1]/10"
                      : "hover:bg-[#AD49E1]/10 hover:text-[#AD49E1]"
                  }`}>
                  <ChevronUp size={20} />
                </button>
                <span
                  className={`px-2 text-sm font-bold ${
                    voted === "up"
                      ? "text-[#AD49E1]"
                      : voted === "down"
                      ? "text-[#7193ff]"
                      : "text-[#d7dadc]"
                  }`}>
                  {voteCount}
                </span>
                <button
                  onClick={() => handleVote("down")}
                  className={`p-2 rounded-r-full transition-colors ${
                    voted === "down"
                      ? "text-[#7193ff] bg-[#7193ff]/10"
                      : "hover:bg-[#7193ff]/10 hover:text-[#7193ff]"
                  }`}>
                  <ChevronDown size={20} />
                </button>
              </div>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare size={18} />
                <span className="text-sm">{comments.length} Comments</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Share size={18} />
                <span className="text-sm">Share</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                <Bookmark size={18} />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-[#1E1E1E]">
            <h3 className="text-xl font-semibold text-white mb-2">
              Add a comment
            </h3>
            <div className="relative mb-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-4 text-white min-h-[120px] placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors"
                placeholder="Share your thoughts..."
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSubmitComment}
                  disabled={isCommenting || !newComment.trim()}
                  className={`flex items-center gap-2 font-medium cursor-pointer py-2 px-6 rounded-full transition-all ${
                    isCommenting || !newComment.trim()
                      ? "bg-[#AD49E1]/50 cursor-not-allowed"
                      : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                  }`}>
                  {isCommenting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t p-3 border-[#1E1E1E]">
            {comments.length > 0 ? (
              <div className="divide-y divide-[#1E1E1E]">
                {comments.map((comment) => renderComment(comment))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="inline-block p-4 rounded-full bg-[#161617] mb-4">
                  <MessageSquare className="text-[#818384] w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-white">
                  No Comments Yet
                </h4>
                <p className="text-[#818384] mt-2">
                  Be the first to share your thoughts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Card - positioned at the end */}
      {hoveredUser && (
        <UserProfileCard user={hoveredUser} position={hoverPosition} />
      )}
    </div>
  );
};

export default PostDetail;

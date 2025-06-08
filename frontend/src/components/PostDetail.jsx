import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [loading, setLoading] = useState(!post);
  const [voted, setVoted] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentVotes, setCommentVotes] = useState({});

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
    const fetchComments = async () => {
      try {
        const commentsRes = await fetch(
          `http://localhost:3000/api/posts/${postId}/comments`
        );
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    if (postId) fetchComments();
  }, [postId]);

  // Submit comment handler
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;

    try {
      setIsCommenting(true);
      const commentData = {
        body: newComment,
        author: user?._id || user?.sub,
        handle: user?.handle || user?.userHandle || "Anonymous",
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

  // Vote handler
  const handleVote = async (voteType) => {
    if (!user || !post) return;

    try {
      const currentVote = voted;
      const currentCount = voteCount;
      let newCount = currentCount;
      let newVoteType = null;

      // Vote calculation logic
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

      // Optimistic update
      setVoteCount(newCount);
      setVoted(newVoteType);

      // API call
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

  // Comment vote handler
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
          className="fixed inset-0 bg-[#AD49E1]/20 backdrop-blur-xs transition-opacity"
          onClick={handleClose}
        />
      )}

      <div
        className={`relative ${
          isModal ? "flex items-center justify-center min-h-screen pt-20" : ""
        }`}>
        <div
          className={`bg-[#0A0A0A] rounded-2xl overflow-hidden border border-[#1E1E1E] shadow-2xl ${
            isModal ? "w-full max-w-3xl" : "max-w-3xl mx-auto my-8"
          }`}>
          {/* Header */}
          <div className="p-6 border-b border-[#1E1E1E] flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  className="w-12 h-12  object-cover object-center"
                  src="https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/10145465.png"
                  alt="community"
                />
                <div>
                  <h2 className="text-white font-medium">
                    c/{post.community || "Astronomy"}
                  </h2>
                  <p className="text-[#818384] text-sm flex items-center">
                    <span>
                      e/
                      {(post.userHandle || "anonymous")
                        .toLowerCase()
                        .replace(/\s+/g, "")}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>51m ago</span>
                  </p>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mt-4 leading-tight">
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
          <div className="p-6">
            <div className="mb-6 text-[#d7dadc] text-lg leading-relaxed">
              <p className="whitespace-pre-line">{post.description}</p>
            </div>

            {post.imageUrl?.length > 0 && (
              <div className="mb-8 overflow-hidden rounded-xl border border-[#1E1E1E] bg-black">
                <img
                  src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                  alt="Post content"
                  className="w-full max-h-[70vh] object-contain"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#AD49E1]/10 text-[#AD49E1] px-3 py-1.5 rounded-full text-sm font-medium">
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
          <div className="p-6 border-t border-[#1E1E1E]">
            <h3 className="text-xl font-semibold text-white mb-4">
              Add a comment
            </h3>
            <div className="relative mb-2">
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
                  className={`flex items-center gap-2 font-medium py-2 px-6 rounded-full transition-all ${
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
          <div className="border-t border-[#1E1E1E]">
            {comments.length > 0 ? (
              <div className="divide-y divide-[#1E1E1E]">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-6 hover:bg-[#0F0F0F] transition-colors duration-200">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleCommentVote(comment._id, "up")}
                          className={`p-1.5 rounded-full transition-colors ${
                            commentVotes[comment._id] === "up"
                              ? "text-[#AD49E1] bg-[#AD49E1]/10"
                              : "hover:bg-[#AD49E1]/10 hover:text-[#AD49E1]"
                          }`}>
                          <ChevronUp size={18} />
                        </button>
                        <span className="text-xs font-bold my-1 text-[#d7dadc]">
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

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-[#343536] flex items-center justify-center">
                            <User size={16} className="text-[#818384]" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">
                              {comment.handle || "Anonymous"}
                            </span>
                            <span className="text-xs text-[#818384] ml-2">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-[#d7dadc] pl-11">{comment.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default PostDetail;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  MessageSquare,
  Share,
  Bookmark,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  User,
  X,
} from "lucide-react";

const PostDetail = ({ isModal = false, backgroundLocation = null }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(state?.post || null);
  const [user, setUser] = useState(state?.user || null);
  const [loading, setLoading] = useState(!post);
  const [voted, setVoted] = useState(null);
  const [commentVotes, setCommentVotes] = useState({});
  const [comments, setComments] = useState([]);

  // Fetch post data if not provided via state (direct URL access)
  useEffect(() => {
    if (!post && postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/posts/${postId}`
          );
          const data = await response.json();
          setPost(data);
          setComments(
            (data.comments || []).map((comment) => ({
              ...comment,
              voteCount: Math.floor(Math.random() * 100) + 1,
            }))
          );
        } catch (err) {
          console.error("Error fetching post:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    } else if (post) {
      setComments(
        (post.comments || []).map((comment) => ({
          ...comment,
          voteCount: Math.floor(Math.random() * 100) + 1,
        }))
      );
      setLoading(false);
    }
  }, [post, postId]);

  const handleClose = () => {
    if (isModal && backgroundLocation) {
      navigate(backgroundLocation.pathname + backgroundLocation.search, {
        state: backgroundLocation.state,
      });
    } else {
      navigate(-1);
    }
  };

  const handleVote = (type) => {
    if (voted === type) {
      setVoted(null);
    } else {
      setVoted(type);
    }
  };

  const handleCommentVote = (commentId, voteType) => {
    setCommentVotes((prev) => {
      const newVotes = { ...prev };
      if (newVotes[commentId] === voteType) {
        delete newVotes[commentId];
      } else {
        newVotes[commentId] = voteType;
      }
      return newVotes;
    });
  };

  if (loading) {
    return (
      <div
        className={`${
          isModal
            ? "fixed inset-0 z-50 flex items-center justify-center"
            : "min-h-screen"
        } bg-[#1a1a1b] text-[#d7dadc]`}>
        {isModal && (
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#49D470] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`${
          isModal
            ? "fixed inset-0 z-50 flex items-center justify-center"
            : "min-h-screen"
        } bg-[#1a1a1b] text-[#d7dadc]`}>
        {isModal && (
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
        <div className="flex items-center justify-center">
          <p>Post not found</p>
        </div>
      </div>
    );
  }

  const voteCount = 142 + (voted === "up" ? 1 : voted === "down" ? -1 : 0);

  const content = (
    <div
      className={`${
        isModal ? "w-full max-w-4xl m-4" : "max-w-4xl mx-auto"
      } p-4`}>
      {/* <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-[#818384] hover:text-white">
          <ArrowLeft size={20} />
          {isModal ? "Close" : "Back to Feed"}
        </button>
        {isModal && (
          <button
            onClick={handleClose}
            className="text-[#818384] hover:text-white p-2 rounded-full hover:bg-[#272729]">
            <X size={20} />
          </button>
        )}
      </div> */}

      {/* Post Content */}
      <div className="bg-[#0A0A0A]  rounded-2xl">
        <div className="p-2">
          <div className="mb-4 flex justify-between">
            <div>
              <span className="text-xl text-white font-medium">
                c/{post.community || "Astronomy"}
              </span>
              <br />
              <span className="text-base text-[#818384]">
                 e/
                {(post.userHandle || "anonymous")
                  .toLowerCase()
                  .replace(/\s+/g, "")}
              </span>
                  <span className="text-[#818384] text-sm mx-2">• 51m ago</span>
            </div>
            {isModal && (
              <button
                onClick={handleClose}
                className="text-[#818384] hover:text-white p-2 rounded-full cursor-pointer">
                <X size={20} />
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {post.title || "Research Summary"}
          </h1>

          <div className="mb-6 text-[#d7dadc]">
            <p className="whitespace-pre-line">{post.description}</p>
          </div>

          {post.imageUrl?.length > 0 && (
            <div className="mb-6">
              <img
                src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                alt="Post content"
                className="w-full max-h-[70vh] object-contain rounded-md border border-[#343536]"
              />
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#49D470]/10 text-[#49D470] px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Horizontal Vote Bar */}
          <div className="flex items-center gap-4 text-[#818384] text-sm font-bold border-t border-[#343536] pt-4">
            <div className="flex items-center gap-1 bg-[#161617] rounded-full">
              <button
                onClick={() => handleVote("up")}
                className={`p-1.5 rounded-l-full hover:bg-[#ff4500]/20 transition-colors ${
                  voted === "up"
                    ? "text-[#49D470]"
                    : "text-[#818384] hover:text-[#49D470]"
                }`}>
                <ChevronUp size={18} />
              </button>
              <span
                className={`text-xs font-bold px-1 ${
                  voted === "up"
                    ? "text-[#49D470]"
                    : voted === "down"
                    ? "text-[#7193ff]"
                    : "text-[#d7dadc]"
                }`}>
                {voteCount}
              </span>
              <button
                onClick={() => handleVote("down")}
                className={`p-1.5 rounded-r-full hover:bg-[#7193ff]/20 transition-colors ${
                  voted === "down"
                    ? "text-[#7193ff]"
                    : "text-[#818384] hover:text-[#7193ff]"
                }`}>
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <MessageSquare size={18} />
              <span>{comments.length} Comments</span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <Share size={18} />
              <span>Share</span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <Bookmark size={18} />
              <span>Save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-2">
        <div className="mt-4 bg-[#0A0A0A] p-6 rounded-2xl border border-[#3e3e3f] shadow-md">
          <h3 className="text-xl font-semibold text-white mb-3">
            Add a comment
          </h3>
          <div className="relative">
            <textarea
              className="w-full bg-[#0A0A0A] border border-[#0A0A0A] rounded-xl p-4 text-white min-h-[120px] placeholder-[#818384] focus:outline-none "
              placeholder="What are your thoughts?"></textarea>

            <div className="absolute bottom-3 right-4">
              <button className="bg-[#49D470] hover:bg-[#49D470]/90 text-white font-semibold py-1.5 px-5 rounded-full shadow-sm transition-colors">
                Comment
              </button>
            </div>
          </div>
        </div>

        {/* <h2 className="text-xl font-semibold text-white mb-6">Comments</h2> */}
        {/* Add Comment Form */}

        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => {
              const userVote = commentVotes[comment.id];
              const voteCount =
                userVote === "up"
                  ? comment.voteCount + 1
                  : userVote === "down"
                  ? comment.voteCount - 1
                  : comment.voteCount;

              return (
                <div
                  key={comment.id}
                  className="flex bg-[#1a1a1b] rounded-md border border-[#343536]">
                  {/* Comment Vote Section */}
                  <div className="flex flex-col items-center py-2 px-2 bg-[#161617] rounded-l-md border-r border-[#343536]">
                    <button
                      onClick={() => handleCommentVote(comment.id, "up")}
                      className={`p-1 rounded hover:bg-[#ff4500]/20 transition-colors ${
                        userVote === "up"
                          ? "text-[#49D470]"
                          : "text-[#818384] hover:text-[#49D470]"
                      }`}>
                      <ChevronUp size={18} />
                    </button>
                    <span
                      className={`text-xs font-bold py-1 ${
                        userVote === "up"
                          ? "text-[#49D470]"
                          : userVote === "down"
                          ? "text-[#7193ff]"
                          : "text-[#d7dadc]"
                      }`}>
                      {voteCount}
                    </span>
                    <button
                      onClick={() => handleCommentVote(comment.id, "down")}
                      className={`p-1 rounded hover:bg-[#7193ff]/20 transition-colors ${
                        userVote === "down"
                          ? "text-[#7193ff]"
                          : "text-[#818384] hover:text-[#7193ff]"
                      }`}>
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#343536] flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-[#818384] ml-2">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[#d7dadc]">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-[#818384]  rounded-md">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50/10 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={handleClose} />
        <div className="min-h-full flex items-start justify-center py-16">
          <div className="relative bg-[#0A0A0A] rounded-2xl shadow-2xl">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#d7dadc]">{content}</div>
  );
};

export default PostDetail;

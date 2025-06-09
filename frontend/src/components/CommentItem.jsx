import React, { useState, useEffect, useMemo } from "react";
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
  CornerDownLeft,
} from "lucide-react";

// Recursive Comment Component
const CommentItem = ({
  comment,
  depth = 0,
  onReply,
  user,
  handleCreateComment,
  postId,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplyingInProgress, setIsReplyingInProgress] = useState(false);
  const [commentVotes, setCommentVotes] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  const handleReplyClick = () => {
    setIsReplying(!isReplying);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !user) return;
    setIsReplyingInProgress(true);
    try {
      await handleCreateComment(replyText, comment._id);
      setReplyText("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsReplyingInProgress(false);
    }
  };

  const handleCommentVote = (voteType) => {
    setCommentVotes((prev) => ({
      ...prev,
      [comment._id]: prev[comment._id] === voteType ? null : voteType,
    }));
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

  const indentStyle = {
    marginLeft: depth > 0 ? `${depth * 1.5}rem` : "0",
    borderLeft: depth > 0 ? "1px solid #2D2D2D" : "none",
    paddingLeft: depth > 0 ? "1.5rem" : "0",
  };

  return (
    <div className="mb-4" style={indentStyle}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleCommentVote("up")}
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
            onClick={() => handleCommentVote("down")}
            className={`p-1.5 rounded-full transition-colors ${
              commentVotes[comment._id] === "down"
                ? "text-[#7193ff] bg-[#7193ff]/10"
                : "hover:bg-[#7193ff]/10 hover:text-[#7193ff]"
            }`}>
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {comment.userDp ? (
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${comment.userDp}`}
                alt={comment.handle}
              />
            ) : (
              <div className="bg-gray-700 rounded-full p-1.5">
                <User size={16} className="text-gray-400" />
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-white">
                {comment.handle || "Anonymous"}
              </span>
              <span className="text-xs text-[#818384] ml-2">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
          <p className="text-[#d7dadc]">{comment.body}</p>

          <div className="flex items-center gap-3 mt-3 text-[#818384]">
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 hover:text-white transition-colors text-sm">
              <CornerDownLeft size={14} />
              <span>Reply</span>
            </button>
            {comment.replies?.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 hover:text-white transition-colors text-sm">
                {isExpanded
                  ? "Hide replies"
                  : `Show replies (${comment.replies.length})`}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-3 text-white min-h-[40px] placeholder-[#818384] focus:outline-none focus:border-[#AD49E1]/50 transition-colors text-sm"
                placeholder="Write your reply..."
                rows={1}
              />
              <button
                onClick={handleSubmitReply}
                disabled={isReplyingInProgress || !replyText.trim()}
                className={`h-10 px-4 flex items-center justify-center rounded-full transition-all ${
                  isReplyingInProgress || !replyText.trim()
                    ? "bg-[#AD49E1]/50 cursor-not-allowed"
                    : "bg-[#AD49E1] hover:bg-[#AD49E1]/90"
                }`}>
                {isReplyingInProgress ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && comment.replies?.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              user={user}
              handleCreateComment={handleCreateComment}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

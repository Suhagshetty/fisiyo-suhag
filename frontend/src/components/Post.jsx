// src/components/PostCard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Share,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

const PostCard = ({
  post,
  currentUser,
  isExpanded,
  togglePostExpansion,
  userVote,
  upvoteCount,
  downvoteCount,
  handleVote,
  savedPosts,
  handleSavePost,
  formatDate,
  truncateText,
  formatVoteCount,
  location,
}) => {
  // Local state for optimistic UI updates
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [localUpvoteCount, setLocalUpvoteCount] = useState(upvoteCount);
  const [localDownvoteCount, setLocalDownvoteCount] = useState(downvoteCount);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!hasVoted) {
      setLocalUserVote(userVote);
      setLocalUpvoteCount(upvoteCount);
      setLocalDownvoteCount(downvoteCount);
    }
  }, [userVote, upvoteCount, downvoteCount, hasVoted]);

  // Sync local state when props change
  useEffect(() => {
    setLocalUserVote(userVote);
    setLocalUpvoteCount(upvoteCount);
    setLocalDownvoteCount(downvoteCount);
    setHasVoted(false);
  }, [post._id]);

  const handleLocalVote = (postId, voteType) => {
    setHasVoted(true);
    const prevVote = localUserVote;
    const prevUpvotes = localUpvoteCount;
    const prevDownvotes = localDownvoteCount;

    let newUpvotes = localUpvoteCount;
    let newDownvotes = localDownvoteCount;
    let newVote = prevVote;

    if (voteType === "up") {
      if (prevVote === "up") {
        newUpvotes--;
        newVote = null;
      } else {
        newUpvotes++;
        if (prevVote === "down") newDownvotes--;
        newVote = "up";
      }
    } else {
      if (prevVote === "down") {
        newDownvotes--;
        newVote = null;
      } else {
        newDownvotes++;
        if (prevVote === "up") newUpvotes--;
        newVote = "down";
      }
    }

    setLocalUserVote(newVote);
    setLocalUpvoteCount(newUpvotes);
    setLocalDownvoteCount(newDownvotes);

    handleVote(postId, voteType, () => {
      setLocalUserVote(prevVote);
      setLocalUpvoteCount(prevUpvotes);
      setLocalDownvoteCount(prevDownvotes);
    });
  };

  return (
    <article className="bg-[#111111]  overflow-hidden shadow-lg hover:shadow-xl border-b  border-[#222] transition-all duration-300 ">
      {/* Post Header */}
      <div className="flex items-center justify-between sm:p-2 pt-2 sm:pb-1">
        <div className="flex items-center sm:gap-3 gap-1">
          <Link to={`/c/${post.communityHandle}`} state={{ user: currentUser }}>
            <img
              className="sm:w-12 h-10 sm:h-12 w-10 object-cover object-center rounded-full"
              src={post.community_dp}
              alt="community"
            />
          </Link>
          <div>
            <Link
              to={`/c/${post.communityHandle}`}
              state={{ user: currentUser }}>
              <h2 className="text-white font-medium text-sm hover:text-[#AD49E1] transition-colors">
                c/{post.communityHandle || "Astronomy"}
              </h2>
            </Link>
            <p className="text-[#818384] text-xs flex items-center">
              <span>
                n/
                {(post.userHandle || "anonymous")
                  .toLowerCase()
                  .replace(/\s+/g, "")}
              </span>
              <span className="mx-1.5">•</span>
              {formatDate(post.createdAt)} ago
            </p>
          </div>
        </div>
        <button className="text-[#a0a2a4] hover:text-white p-2 rounded-full hover:bg-[#1f1f1f] transition-colors duration-200">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Post Image with Title Overlay */}
      {post.imageUrl?.length > 0 ? (
        <div className="relative aspect-video bg-[#111111] overflow-hidden cursor-pointer">
          <img
            src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
            alt="Post content"
            className="w-full p-2 rounded-2xl h-full object-cover"
            onClick={() =>
              navigate(`/post/${post._id}`, {
                state: {
                  post,
                  user: currentUser,
                  backgroundLocation: location,
                },
              })
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/20 rounded-2xl to-transparent flex items-end p-4">
            <Link
              to={`/post/${post._id}`}
              state={{
                post,
                user: currentUser,
                backgroundLocation: location,
              }}
              className="text-white font-bold text-lg leading-tight hover:text-[#AD49E1] transition-colors duration-300 line-clamp-2">
              {post.title || "Research Summary"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 pt-0">
          <Link
            to={`/post/${post._id}`}
            state={{
              post,
              user: currentUser,
              backgroundLocation: location,
            }}
            className="text-white font-bold text-lg leading-tight hover:text-[#AD49E1] transition-colors duration-300 block mb-3">
            {post.title || "Research Summary"}
          </Link>
        </div>
      )}

      {/* Post Description */}
      <div className="p-4 pt-3">
        <div className="text-[#d7dadc] text-sm leading-relaxed mb-2">
          {isExpanded ? (
            <p>{post.description}</p>
          ) : (
            <p>
              {truncateText(post.description)}{" "}
              {post.description && post.description.split(" ").length > 20 && (
                <button
                  onClick={() => togglePostExpansion(post._id)}
                  className="text-[#AD49E1] hover:text-[#AD49E1] cursor-pointer transition-colors duration-300 font-medium">
                  Read more
                </button>
              )}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
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
              <span>{post.comments?.length || 0}</span>
            </Link>

            {/* Vote buttons */}
            <div className="flex items-center">
              <button
                onClick={() => handleLocalVote(post._id, "up")}
                className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-200 ${
                  localUserVote === "up"
                    ? "text-[#AD49E1] bg-[#AD49E1]/10"
                    : "text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a]"
                }`}>
                <ChevronUp size={16} />
                <span className="text-sm font-medium">
                  {formatVoteCount(localUpvoteCount)}
                </span>
              </button>

              <button
                onClick={() => handleLocalVote(post._id, "down")}
                className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-200 ${
                  localUserVote === "down"
                    ? "text-red-500 bg-red-500/10"
                    : "text-[#818384] hover:text-red-500 hover:bg-[#1a1a1a]"
                }`}>
                <ChevronDown size={16} />
                <span className="text-sm font-medium">
                  {formatVoteCount(localDownvoteCount)}
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
                fill={savedPosts.has(post._id) ? "#AD49E1" : "none"}
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
                <span className="hidden sm:inline">Collapse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;

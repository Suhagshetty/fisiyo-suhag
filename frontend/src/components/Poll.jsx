import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Share, Bookmark, MoreHorizontal } from "lucide-react";

const Poll = ({
  poll,
  currentUser,
  formatDate,
  truncateText,
  formatVoteCount,
  handleSavePost,
  savedPosts,
}) => {
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [localOptions, setLocalOptions] = useState(poll.options);
  const [localTotalVotes, setLocalTotalVotes] = useState(poll.totalVotes);
  const [error, setError] = useState(null);

  const now = new Date();
  const expiration = new Date(poll.expiresAt);
  const hasExpired = expiration < now;
  const currentUserHasVoted = poll.votedUsers.includes(currentUser?._id);
  console.log(
    " hasExpired    ",
    hasExpired,
    "poll.showVotesBeforeExpire",
    poll.showVotesBeforeExpir,
    " hasVoted",
    hasVoted,
    "currentUserHasVoted",
    currentUserHasVoted
  );
  

  // Calculate time remaining
  const timeRemaining = hasExpired
    ? "Ended"
    : `${Math.ceil((expiration - now) / (1000 * 60 * 60))}h remaining`;

  // Calculate percentages for each option
  const calculatePercentage = (votes) => {
    return localTotalVotes > 0
      ? Math.round((votes / localTotalVotes) * 100)
      : 0;
  };

  // Handle voting
  const handlePollVote = async (optionIndex) => {
    if (hasVoted || currentUserHasVoted || !currentUser) {
      console.log("has voted");
      
      return;
    }
    setError(null);

    try {
      // Optimistic UI update
      console.log("voted");
      
      const originalOptions = [...localOptions];
      const originalTotalVotes = localTotalVotes;

      setSelectedOption(optionIndex);
      setHasVoted(true);

      const updatedOptions = [...localOptions];
      updatedOptions[optionIndex].votes += 1;

      setLocalOptions(updatedOptions);
      setLocalTotalVotes(localTotalVotes + 1);

      // API call to submit vote
      const response = await fetch(
        `http://localhost:3000/api/polls/${poll._id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser._id,
            selectedOption: optionIndex,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Voting failed");
      }

      const updatedPoll = await response.json();
      setLocalOptions(updatedPoll.options);
      setLocalTotalVotes(updatedPoll.totalVotes);
    } catch (err) {
      console.error("Voting error:", err);
      setError(err.message);

      // Revert optimistic update
      setSelectedOption(null);
      setHasVoted(false);
      setLocalOptions(originalOptions);
      setLocalTotalVotes(originalTotalVotes);
    }
  };

  // Determine if we should show results
  const showResults =
    hasExpired || poll.showVotesBeforeExpire || hasVoted || currentUserHasVoted;

  return (
    <article className="bg-[#111111] overflow-hidden shadow-lg hover:shadow-xl border-b border-[#222] transition-all duration-300">
      {/* Poll Header */}
      <div className="flex items-center justify-between sm:p-2 pt-2 sm:pb-1">
        <div className="flex items-center sm:gap-3 gap-1">
          <Link to={`/c/${poll.communityHandle}`} state={{ user: currentUser }}>
            <img
              className="sm:w-12 h-10 sm:h-12 w-10 object-cover object-center  "
              src={poll.community_dp}
              alt="community"
            />
          </Link>
          <div>
            <Link
              to={`/c/${poll.communityHandle}`}
              state={{ user: currentUser }}>
              <h2 className="text-white font-medium text-sm hover:text-[#AD49E1] transition-colors">
                c/{poll.communityHandle || "Astronomy"}
              </h2>
            </Link>
            <p className="text-[#818384] text-xs flex items-center">
              <span>
                n/
                {(poll.userHandle || "anonymous")
                  .toLowerCase()
                  .replace(/\s+/g, "")}
              </span>
              <span className="mx-1.5">•</span>
              {formatDate(poll.createdAt)} ago
            </p>
          </div>
        </div>
        <button className="text-[#a0a2a4] hover:text-white p-2 rounded-full hover:bg-[#1f1f1f] transition-colors duration-200">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Poll Question */}
      <div className="p-4 pt-0">
        <h2 className="text-white font-bold text-lg leading-tight mb-2">
          {poll.question || "Poll Question"}
        </h2>
        <p className="text-[#818384] text-xs">
          {localTotalVotes} votes • {timeRemaining}
        </p>
      </div>

      {/* Poll Options */}
      <div className="px-4 pb-4 space-y-2">
        {localOptions.map((option, index) => {
          const percentage = showResults
            ? calculatePercentage(option.votes || 0)
            : 0;

          const isSelected = selectedOption === index;
          const userVotedThisOption =
            isSelected ||
            (currentUserHasVoted &&
              poll.votes.some(
                (vote) =>
                  vote.userId === currentUser?._id &&
                  vote.selectedOptions.includes(index)
              ));
          return (
            <button
              key={index}
              className={`w-full text-left rounded-lg overflow-hidden transition-all duration-300 ${
                showResults ? "bg-[#1a1a1a]" : "bg-[#1a1a1a] hover:bg-[#222]"
              } ${userVotedThisOption ? "ring-2 ring-[#AD49E1]" : ""}`}
              onClick={() => handlePollVote(index)}
              disabled={showResults || !currentUser}
              >
              <div className="flex justify-between px-3 py-2.5">
                <span className="text-[#d7dadc] text-sm">{option.text}</span>

                {showResults && (
                  <span className="text-[#818384] text-sm">{percentage}%</span>
                )}
              </div>

              {showResults && (
                <div className="h-1.5 bg-[#333] w-full">
                  <div
                    className="h-full bg-[#AD49E1] transition-all duration-700"
                    style={{ width: `${percentage}%` }}></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/poll/${poll.id}`}
              state={{
                poll,
                user: currentUser,
                backgroundLocation: location,
              }}
              className="flex items-center gap-2 text-[#818384] hover:text-[#AD49E1] hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium">
              <MessageSquare size={16} />
              <span>{poll.comments?.length || 0}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-[#818384] hover:text-white hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm">
              <Share size={16} />
            </button>

            <button
              onClick={() => handleSavePost(poll.id)}
              className={`flex items-center gap-2 hover:bg-[#1a1a1a] px-3 py-2 rounded-full transition-all duration-300 text-sm ${
                savedPosts.has(poll.id)
                  ? "text-[#AD49E1] hover:text-[#AD49E1]"
                  : "text-[#818384] hover:text-white"
              }`}>
              <Bookmark
                size={16}
                fill={savedPosts.has(poll.id) ? "#AD49E1" : "none"}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Poll;

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const Poll = ({
  poll,
  currentUser,
  handleVote,
  existingVote,
  pollVoteCounts,
}) => {
  // Check if user has already voted
  const [selectedOptions, setSelectedOptions] = useState(existingVote);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    new Date(poll.expiresAt) - new Date()
  );

  // Derive hasVoted from existingVote prop
  const hasVoted = existingVote.length > 0;

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);

    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
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

  // Handle expiration
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle expiration
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time function remains the same...

  const handleOptionClick = (index) => {
    if (hasVoted || isExpired) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const submitVote = () => {
    if (selectedOptions.length === 0) return;
    handleVote(poll._id, selectedOptions);
  };

  // Get vote counts from parent
  const voteCounts = pollVoteCounts.get(poll._id) || {
    totalVotes: poll.totalVotes,
    optionVotes: poll.options.map((opt) => opt.voteCount),
  };

  return (
    <article className="bg-[#111111] border-b border-[#222] transition-all duration-500 shadow-2xl hover:shadow-3xl">
      <div className="pt-3 py-2">
        {/* ... existing header code ... */}
        <div className="flex items-center justify-between sm:px-6 px-2 mb-2">
          <div className="flex items-center gap-3">
            <img
              src={poll.community_dp}
              alt="Community"
              className="w-10 h-10 object-cover object-center"
            />
            <div>
              <h2 className="text-white font-medium text-sm">
                c/{poll.communityHandle}
              </h2>
              <p className="text-[#818384] text-xs">
                n/{poll.userHandle} • {formatDate(poll.createdAt)} ago
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#818384] text-xs">
            <Clock size={14} />
            {isExpired
              ? "Poll ended"
              : `${formatTimeRemaining(timeLeft)} remaining`}
          </div>
        </div>
        {/* Poll Question */}
        <div className="sm:px-6 px-2 mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">
            {poll.question}
          </h3>

          {poll.options.map((option, index) => {
            const isSelected = selectedOptions.includes(index);
            const votePercentage =
              voteCounts.totalVotes > 0
                ? (voteCounts.optionVotes[index] / voteCounts.totalVotes) * 100
                : 0;

            return (
              <div
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`relative cursor-pointer transition-all duration-200 border border-[#333] rounded-md px-4 py-3 mb-2 ${
                  isSelected ? "bg-[#222] border-[#AD49E1]" : "bg-[#1a1a1a]"
                }`}>
                <p className="text-[#d7dadc] text-sm font-medium">
                  {option.text}
                </p>

                {(hasVoted || poll.showVotesBeforeExpire) && (
                  <>
                    <div className="mt-1 text-xs text-[#818384] flex justify-between">
                      <span>{voteCounts.optionVotes[index]} votes</span>
                      <span>{votePercentage.toFixed(1)}%</span>
                    </div>
                    <div
                      className="absolute left-0 top-0 h-full rounded-md bg-[#AD49E1] opacity-10"
                      style={{ width: `${votePercentage}%` }}
                    />
                  </>
                )}
              </div>
            );
          })}

          {!hasVoted && !isExpired && (
            <button
              onClick={submitVote}
              disabled={selectedOptions.length === 0}
              className={`mt-4 px-4 py-2 rounded-md text-white font-medium text-sm transition ${
                selectedOptions.length === 0
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#AD49E1] hover:bg-[#9a3dd2]"
              }`}>
              Submit Vote
            </button>
          )}

          {(hasVoted || isExpired) && (
            <p className="text-[#818384] text-xs mt-4">
              {voteCounts.totalVotes} total vote
              {voteCounts.totalVotes !== 1 && "s"}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default Poll;
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import useFeedData from "../hooks/useFeedData";
import useCommunityData from "../hooks/useCommunityData";
import loadUserVotes from "../utils/loadUserVotes";
import PostCard from "./Post";
import CreateButton from "../components/CreateButton";
import CommunityBanner from "../components/CommunityBanner";
import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";
import CommunityErrorState from "../components/CommunityErrorState";
import CommunityEmptyState from "../components/CommunityEmptyState";  
import {
  joinCommunity,
  leaveCommunity, 
} from "../api/communityApi";

const CommunityPage = () => {
  const { name } = useParams();
  const { user, isAuthenticated,
    getAccessTokenSilently   } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [localMembership, setLocalMembership] = useState(false);

  const { community, isLoading, error } = useCommunityData(name); 

  const {
    expandedPosts,
    votedPosts,
    upvoteCounts,
    polls,
    savedPosts,
    downvoteCounts,
    communities,
    posts,
    loading: feedLoading,
    error: feedError,
    togglePostExpansion,
    handleSavePost,
    handleVote,
    setVotedPosts,
    setUpvoteCounts,
    setDownvoteCounts,
  } = useFeedData(currentUser, user);


  useEffect(() => {
    if (community && currentUser) {
      const memberStatus = community.members.some(
        (member) => member._id === currentUser._id
      );
      setLocalMembership(memberStatus);
    }
  }, [community, currentUser]);


  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Optimistic UI update
    setLocalMembership(true);

    try {
      const token = await getAccessTokenSilently();
      await joinCommunity(community._id, token);
    } catch (error) {
      console.error("Join error:", error);
      // Revert on error
      setLocalMembership(false);
    }
  };

  const handleLeave = async () => {
    // Optimistic UI update
    setLocalMembership(false);

    try {
      const token = await getAccessTokenSilently();
      await leaveCommunity(community._id, token);
    } catch (error) {
      console.error("Leave error:", error);
      // Revert on error
      setLocalMembership(true);
    }
  };


  // Initialize vote counts
  useEffect(() => {
    if (community?.posts) {
      const initialUpvoteCounts = new Map();
      const initialDownvoteCounts = new Map();

      community.posts.forEach((post) => {
        initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
        initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
      });

      setUpvoteCounts(initialUpvoteCounts);
      setDownvoteCounts(initialDownvoteCounts);
    }
  }, [community, setUpvoteCounts, setDownvoteCounts]);

  // Load user's existing votes
  useEffect(() => {
    const loadVotes = async () => {
      if (!community?.posts || community.posts.length === 0) return;

      const userId = currentUser?._id || user?.sub;
      if (!userId) return;

      const votes = await loadUserVotes(userId, community.posts);
      setVotedPosts(votes);
    };

    loadVotes();
  }, [community, currentUser, user, setVotedPosts]);

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

  // Replace the error state JSX with this component
  if (error || !community) {
    return <CommunityErrorState communityName={name} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1]">
      <CommunityBanner
        community={community}
        isMember={localMembership}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      {isAuthenticated && (
        <CreateButton
          isAuthenticated={isAuthenticated}
          onCreateOption={handleCreateOption}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 ">
        {community.posts.length === 0 ? (
          <CommunityEmptyState
            isAuthenticated={isAuthenticated}
            onCreatePost={() => handleCreateOption("post")}
          />
        ) : (
          <div className="space-y-0 sm:border overflow-hidden border-[#222]">
            {community.posts.map((post) => {
              const isExpanded = expandedPosts.has(post._id);
              const userVote = votedPosts.get(post._id);
              const upvoteCount = upvoteCounts.get(post._id) || 0;
              const downvoteCount = downvoteCounts.get(post._id) || 0;

              return (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  isExpanded={isExpanded}
                  togglePostExpansion={togglePostExpansion}
                  userVote={userVote}
                  upvoteCount={upvoteCount}
                  downvoteCount={downvoteCount}
                  handleVote={handleVote}
                  savedPosts={savedPosts}
                  handleSavePost={handleSavePost}
                  formatDate={formatDate}
                  truncateText={truncateText}
                  formatVoteCount={formatVoteCount}
                  location={location}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;

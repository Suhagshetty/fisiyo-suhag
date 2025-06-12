import { useState, useEffect } from "react";

export default function useFeedData(currentUser, user) {
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [votedPosts, setVotedPosts] = useState(new Map());
  const [upvoteCounts, setUpvoteCounts] = useState(new Map());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [downvoteCounts, setDownvoteCounts] = useState(new Map());
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const togglePostExpansion = (postId) => {
    const newExpandedPosts = new Set(expandedPosts);
    if (newExpandedPosts.has(postId)) {
      newExpandedPosts.delete(postId);
    } else {
      newExpandedPosts.add(postId);
    }
    setExpandedPosts(newExpandedPosts);
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/communities");
        const data = await response.json();
        setCommunities(data);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const loadUserVotes = async () => {
      if (currentUser?._id || user?.sub) {
        try {
          const userId = currentUser?._id || user?.sub;
          const response = await fetch(
            `http://localhost:3000/api/posts/votes/${userId}`
          );
          if (response.ok) {
            const userVotes = await response.json();
            const votesMap = new Map();
            Object.entries(userVotes).forEach(([postId, voteType]) => {
              votesMap.set(postId, voteType);
            });
            setVotedPosts(votesMap);
          }
        } catch (error) {
          console.error("Error loading user votes:", error);
        }
      }
    };

    if (posts.length > 0) {
      loadUserVotes();
    }
  }, [posts, currentUser, user]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (currentUser?._id) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/saved-posts/${currentUser._id}`
          );
          if (response.ok) {
            const saved = await response.json();
            setSavedPosts(new Set(saved.map((post) => post._id)));
          }
        } catch (error) {
          console.error("Error loading saved posts:", error);
        }
      }
    };

    fetchSavedPosts();
  }, [currentUser]);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  // Updated handleVote function to manage separate counts
  const handleVote = async (postId, voteType) => {
    try {
      const currentVote = votedPosts.get(postId);
      const currentUpvotes = upvoteCounts.get(postId) || 0;
      const currentDownvotes = downvoteCounts.get(postId) || 0;

      let newUpvotes = currentUpvotes;
      let newDownvotes = currentDownvotes;
      let newVoteType = voteType;

      // Handle vote logic more carefully
      if (currentVote === voteType) {
        // User is removing their vote (clicking same button)
        newVoteType = null;
        if (voteType === "up") {
          newUpvotes = Math.max(0, currentUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
      } else if (currentVote && currentVote !== voteType) {
        // User is switching from one vote to another
        if (currentVote === "up" && voteType === "down") {
          // Switching from upvote to downvote
          newUpvotes = Math.max(0, currentUpvotes - 1);
          newDownvotes = currentDownvotes + 1;
        } else if (currentVote === "down" && voteType === "up") {
          // Switching from downvote to upvote
          newDownvotes = Math.max(0, currentDownvotes - 1);
          newUpvotes = currentUpvotes + 1;
        }
      } else {
        // New vote (no previous vote)
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
      const response = await fetch(
        `http://localhost:3000/api/posts/${postId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voteType: newVoteType,
            userId: currentUser?._id || user?.sub,
          }),
        }
      );

      if (!response.ok) {
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

      // Update with actual server response to ensure consistency
      const updatedPost = await response.json();
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

  return {
    expandedPosts,
    votedPosts,
    upvoteCounts,
    savedPosts,
    downvoteCounts,
    communities,
    posts,
    loading,
    error,
    togglePostExpansion,
    handleSavePost,
    handleVote,
  };
}

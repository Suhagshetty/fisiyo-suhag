import axios from "axios";

export default async function loadUserVotes(userId, posts) {
  if (!userId || !posts || posts.length === 0) return new Map();

  try {
    const response = await axios.get(
      `http://localhost:3000/api/posts/votes/${userId}`
    );

    if (response.data) {
      const votesMap = new Map();
      Object.entries(response.data).forEach(([postId, voteType]) => {
        votesMap.set(postId, voteType);
      });
      return votesMap;
    }
  } catch (error) {
    console.error("Error loading user votes:", error);
  }

  return new Map();
}

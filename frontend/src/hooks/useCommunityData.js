import { useState, useEffect } from "react";
import axios from "axios";

export default function useCommunityData(name) {
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        setIsLoading(true);
        const communityResponse = await axios.get(
          `http://localhost:3000/api/communities/name/${name}`
        );
        const communityData = communityResponse.data;

        const postsResponse = await axios.get(
          `http://localhost:3000/api/posts/by-communities?ids=${communityData._id}`
        );

        setCommunity({
          ...communityData,
          posts: postsResponse.data,
        });
        setError(null);
      } catch (err) {
        setError("Failed to load community");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityAndPosts();
  }, [name]);

  return { community, isLoading, error, setCommunity };
}

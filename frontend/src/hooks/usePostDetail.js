import { useState, useEffect, useCallback } from "react";

const usePostData = (postId, initialPost, initialUser) => {
  const [post, setPost] = useState(initialPost || null);
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialPost);
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      const commentsRes = await fetch(
        `http://localhost:3000/api/posts/${postId}/comments`
      );
      if (!commentsRes.ok) throw new Error("Failed to fetch comments");
      const commentsData = await commentsRes.json();
      setComments(commentsData);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [postId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!initialPost && postId) {
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
          await fetchComments();
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [postId, initialPost, fetchComments]);

  return {
    post,
    user,
    loading,
    comments,
    setComments,
    fetchComments,
    setPost,
    setUser,
  };
};

export default usePostData;

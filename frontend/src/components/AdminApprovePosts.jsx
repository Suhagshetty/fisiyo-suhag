import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Check, X, Loader } from "lucide-react";

const AdminApprovePosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [disapprovingId, setDisapprovingId] = useState(null);
  const [disapprovalFormId, setDisapprovalFormId] = useState(null);
  const [disapprovalReasons, setDisapprovalReasons] = useState({});
  const [error, setError] = useState("");

  const defaultReasons = [
    "Spam or misleading content",
    "Hate speech or harassment",
    "Violates community guidelines",
    "Inappropriate content",
    "Off-topic for community",
  ];

  useEffect(() => {
    const fetchUnapprovedPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/posts/unapproved",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setPosts(response.data);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        console.error("Error fetching unapproved posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnapprovedPosts();
  }, []);

  const sendNotification = async (
    userId,
    type,
    message,
    relatedPost,
    postTitle,
    imageUrl = ""
  ) => {
    try {
      await axios.post(
        "http://localhost:3000/api/notifications/",
        { userId, type, message, relatedPost, postTitle, imageUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  const handleApprove = async (postId) => {
    setApprovingId(postId);
    try {
      const postToApprove = posts.find((post) => post._id === postId);
      if (!postToApprove) {
        setError("Post not found");
        return;
      }

      await axios.patch(
        `http://localhost:3000/api/posts/${postId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      setPosts(posts.filter((post) => post._id !== postId));

      await sendNotification(
        postToApprove.author,
        "post_approved",
        "Your post has been approved and is now live!",
        postId,
        postToApprove.title,
        postToApprove.imageUrl?.[0] || ""
      );
    } catch (err) {
      setError("Failed to approve post. Please try again.");
      console.error("Error approving post:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleStartDisapprove = (postId) => {
    setDisapprovalFormId(postId);
    setDisapprovalReasons((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const handleReasonSelect = (postId, reason) => {
    setDisapprovalReasons((prev) => ({
      ...prev,
      [postId]: reason,
    }));
  };

  const handleDisapprove = async (postId) => {
    const reason = disapprovalReasons[postId] || "";
    if (!reason.trim()) {
      setError("Please provide a reason for disapproval");
      return;
    }

    setDisapprovingId(postId);
    try {
      const postToDelete = posts.find((post) => post._id === postId);
      if (!postToDelete) {
        setError("Post not found");
        return;
      }

      const imageUrls = postToDelete.imageUrl || [];
      if (imageUrls.length > 0) {
        await axios.post("http://localhost:3000/delete", { imageUrls });
      }

      await axios.delete(
        `http://localhost:3000/api/posts/${postId}/disapprove`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          data: { reason },
        }
      );

      setPosts(posts.filter((post) => post._id !== postId));

      await sendNotification(
        postToDelete.author,
        "post_disapproved",
        `Your post was declined. Reason: ${reason}`,
        postId,
        postToDelete.title,
        ""
      );
    } catch (err) {
      setError("Failed to disapprove post. Please try again.");
      console.error("Error disapproving post:", err);
    } finally {
      setDisapprovingId(null);
      setDisapprovalReasons((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
      setDisapprovalFormId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Post Approval Queue
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts pending approval
            </h3>
            <p className="text-gray-500">
              All posts have been reviewed and approved.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => {
                const isFormOpen = disapprovalFormId === post._id;
                const reason = disapprovalReasons[post._id] || "";

                return (
                  <li key={post._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {post.community_dp ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={post.community_dp}
                                alt={post.communityHandle}
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-600">
                              c/{post.communityHandle}
                            </div>
                            <div className="text-sm text-gray-500">
                              Posted by u/{post.userHandle}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-gray-600">{post.description}</p>
                      </div>
                      {post.imageUrl && post.imageUrl.length > 0 && (
                        <div className="mt-4">
                          <img
                            src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${post.imageUrl[0]}`}
                            alt="Post content"
                            className="max-h-60 rounded-lg object-contain"
                          />
                        </div>
                      )}
                      <div className="mt-4 flex justify-end space-x-2">
                        {isFormOpen ? (
                          <div className="w-full">
                            <div className="mt-4 mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select a reason or specify your own:
                              </label>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {defaultReasons.map((defaultReason) => (
                                  <button
                                    key={defaultReason}
                                    type="button"
                                    onClick={() =>
                                      handleReasonSelect(
                                        post._id,
                                        defaultReason
                                      )
                                    }
                                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                      reason === defaultReason
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}>
                                    {defaultReason}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                placeholder="Type your reason here... (You can edit the selected reason)"
                                value={reason}
                                onChange={(e) =>
                                  setDisapprovalReasons((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                rows="3"
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setDisapprovalFormId(null)}
                                className="px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50">
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDisapprove(post._id)}
                                disabled={
                                  !reason.trim() || disapprovingId === post._id
                                }
                                className={`flex items-center px-4 py-2 text-white text-sm rounded-md transition-colors ${
                                  !reason.trim() || disapprovingId === post._id
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}>
                                {disapprovingId === post._id ? (
                                  <Loader className="animate-spin h-4 w-4 mr-2" />
                                ) : null}
                                Confirm Disapproval
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartDisapprove(post._id)}
                              disabled={
                                approvingId === post._id ||
                                disapprovingId === post._id
                              }
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors">
                              Disapprove
                            </button>
                            <button
                              onClick={() => handleApprove(post._id)}
                              disabled={
                                approvingId === post._id ||
                                disapprovingId === post._id
                              }
                              className={`flex items-center justify-center px-4 py-2 text-white text-sm rounded-md transition-colors ${
                                approvingId === post._id ||
                                disapprovingId === post._id
                                  ? "bg-indigo-400 cursor-not-allowed"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}>
                              {approvingId === post._id ? (
                                <Loader className="animate-spin h-4 w-4" />
                              ) : (
                                "Approve"
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminApprovePosts;

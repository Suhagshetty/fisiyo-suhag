import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const FollowerSuggestions = ({ currentUser }) => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState([]);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        if (!currentUser?._id) return;

        const response = await fetch(
          "http://localhost:3000/api/users/suggestions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              excludeId: currentUser._id,
              limit: 10,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        setSuggestedUsers(data);
      } catch (err) {
        console.error("Error fetching user suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [currentUser]);

  const handleFollow = async (userId) => {
    // Add to following list immediately
    setFollowingUsers((prev) => [...prev, userId]);

    try {
      const response = await fetch("http://localhost:3000/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: currentUser._id,
          followeeId: userId,
        }),
      });

      if (!response.ok) throw new Error("Follow action failed");
    } catch (err) {
      console.error("Error following user:", err);
      // Revert on error
      if (isMounted.current) {
        setFollowingUsers((prev) => prev.filter((id) => id !== userId));
      }
      return;
    }

    // Remove after 1 second
    setTimeout(() => {
      if (isMounted.current) {
        setSuggestedUsers((prev) => prev.filter((user) => user._id !== userId));
        setFollowingUsers((prev) => prev.filter((id) => id !== userId));
      }
    }, 10000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#AD49E1]"></div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) return null;

  return (
    <div className="bg-[#111111] rounded-2xl p-4 mb-6 border border-[#222]">
      <h3 className="text-white text-lg font-semibold mb-4">Who to follow</h3>
      <div className="space-y-4">
        {suggestedUsers.map((user) => {
          const isFollowing = followingUsers.includes(user._id);

          return (
            <div
              key={user._id}
              className={`flex items-center justify-between rounded-xl transition`}>
              <div className="flex items-center gap-3">
                <Link
                  to={`/n/${user.handle}`}
                  state={{ user: currentUser, handle: user.handle }}
                  className="group">
                  <img
                    src={
                      user.profilePicture
                        ? `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${user.profilePicture}`
                        : "/default-avatar.png"
                    }
                    alt={user.handle}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                </Link>
                <div className="flex flex-col">
                  <Link
                    to={`/n/${user.handle}`}
                    state={{ user: currentUser, handle: user.handle }}
                    className="text-base font-medium text-white">
                    n/{user.handle}
                  </Link>
                  <span className="text-sm text-[#818384]">{user.name}</span>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user._id)}
                disabled={isFollowing}
                className={`border text-xs font-semibold px-6 py-1.5  p-2 cursor-pointer  rounded-md transition duration-300`}>
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowerSuggestions;

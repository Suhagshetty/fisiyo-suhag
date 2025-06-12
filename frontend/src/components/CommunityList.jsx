import React from "react";
import { Link } from "react-router-dom";

const CommunityList = ({ communities, currentUser }) => {
  return (
    <div className=" py-3">
      <h3 className="text-xs uppercase tracking-wider text-[#818384] mb-3 px-2">
        Popular Communities
      </h3>
      <div className="space-y-1.5">
        {communities.map((community) => (
          <Link
            key={community._id}
            to={`/c/${community.name}`}
            state={{ user: currentUser }}
            className="flex items-center gap-2 text-[#d7dadc] hover:text-white py-0.5 pl-2 rounded-xl transition-all duration-300">
            {community.avatarUrl ? (
              <img
                src={community.avatarUrl}
                alt={community.name}
                className="w-12 h-12 object-cover"
              />
            ) : (
              " "
            )}
            <div>
              <div className="font-bold text-sm">c/{community.name}</div>
              <div className="text-xs text-[#818384]">
                {community.memberCount} members
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CommunityList;

// Create a new EmptyState.jsx component file
import React from "react";
import { Home, Plus } from "lucide-react";

const EmptyState = ({ onCreatePost }) => {
  return (
    <div className="text-center py-24 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-[#AD49E1]/20 to-[#AD49E1]/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Home className="w-10 h-10 text-[#AD49E1]" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">No posts yet</h3>
      <p className="text-[#818384] max-w-md mx-auto mb-8 text-lg">
        Be the first to share your research or academic insights with the
        community
      </p>
      <button
        onClick={onCreatePost}
        className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] hover:from-[#AD49E1] hover:to-[#AD49E1] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 text-sm inline-flex items-center gap-3 shadow-lg hover:shadow-xl">
        <Plus size={16} />
        <span>Create First Post</span>
      </button>
    </div>
  );
};

export default EmptyState;

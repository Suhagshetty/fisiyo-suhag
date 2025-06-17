// src/components/CommunityErrorState.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityErrorState = ({ communityName }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="bg-[#111111] p-8 rounded-3xl max-w-md w-full shadow-2xl border border-[#272b30]">
        <div className="text-center">
          <div className="bg-red-500/20 p-4 rounded-full inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">
            Community Not Found
          </h2>
          <p className="text-[#818384] mt-2">
            The community <span className="font-mono">c/{communityName}</span> could
            not be located in our scientific archives.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white font-medium py-2 px-6 rounded-full transition-all duration-300"
          >
            Return to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityErrorState;
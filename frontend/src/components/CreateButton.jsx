// src/components/CreateButton.jsx
import React, { useState } from "react";
import {
  Plus,
  FileText,
  BarChart2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

const CreateButton = ({ isAuthenticated, onCreateOption }) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        <button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none">
          <Plus size={24} />
        </button>

        {showCreateMenu && (
          <div className="absolute bottom-full right-0 mb-4 w-56 bg-[#1f1f1f] rounded-xl shadow-2xl border border-[#333] overflow-hidden animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => {
                setShowCreateMenu(false);
                onCreateOption("post");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
              <FileText size={16} className="text-[#AD49E1]" />
              <span>Create Post</span>
            </button>
            <button
              onClick={() => {
                setShowCreateMenu(false);
                onCreateOption("poll");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
              <BarChart2 size={16} className="text-[#AD49E1]" />
              <span>Create Poll</span>
            </button>
            <button
              onClick={() => {
                setShowCreateMenu(false);
                onCreateOption("discussion");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white border-b border-[#333]">
              <MessageSquare size={16} className="text-[#AD49E1]" />
              <span>New Discussion</span>
            </button>
            <button
              onClick={() => {
                setShowCreateMenu(false);
                onCreateOption("qna");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-[#2a2a2a] transition-colors duration-200 text-white">
              <HelpCircle size={16} className="text-[#AD49E1]" />
              <span>Q&A Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateButton;

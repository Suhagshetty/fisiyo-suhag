import React from "react";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import {
  Bookmark,
  Grid3X3,
  Clock,
  Settings,
  MessageCircle,
  Users,
  Award,
  ExternalLink,
  Calendar,
  Link as LinkIcon,
  MapPin,
  BarChart2,
  MoreHorizontal,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth0();
  console.log(user);

  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  console.log(currentUser);

  const mockPosts = [
    {
      title: "Novel Protein Folding Mechanism",
      type: "Research Paper",
      date: "2 days ago",
      engagement: "127 interactions",
      upvotes: 142,
      comments: 23,
    },
    {
      title: "Quantum Computing Applications",
      type: "Collaboration",
      date: "1 week ago",
      engagement: "89 interactions",
      upvotes: 98,
      comments: 15,
    },
    {
      title: "CRISPR Gene Editing Ethics",
      type: "Discussion",
      date: "2 weeks ago",
      engagement: "203 interactions",
      upvotes: 231,
      comments: 42,
    },
    {
      title: "Machine Learning in Drug Discovery",
      type: "Research Paper",
      date: "3 weeks ago",
      engagement: "156 interactions",
      upvotes: 187,
      comments: 29,
    },
    {
      title: "Climate Change Mitigation Strategies",
      type: "Collaboration",
      date: "1 month ago",
      engagement: "178 interactions",
      upvotes: 205,
      comments: 31,
    },
    {
      title: "Neuroscience Research Breakthrough",
      type: "Discussion",
      date: "1 month ago",
      engagement: "94 interactions",
      upvotes: 112,
      comments: 18,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Cover Section - Twitter-inspired */}
      <section className="relative">
        <div
          className="w-full h-48 bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage:
              "url('https://live.staticflickr.com/65535/52259221868_53dae692b6_h.jpg')",
          }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent"></div>
        </div>
      </section>

      {/* Profile Section - Combined Twitter/Reddit */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between">
          {/* Profile Picture - Twitter style with Reddit flair */}
          <div className="absolute sm:relative left-4 sm:left-0 -top-16 sm:-top-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full  shadow-lg overflow-hidden bg-gray-200">
            <img
              src={user?.picture || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#49D470] rounded-full flex items-center justify-center">
              <Award className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Profile Actions - Twitter style */}
          <div className="ml-auto mt-4 sm:mt-0 flex space-x-3">
            <button className="flex items-center space-x-1 px-4 py-2 bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300 text-sm font-medium">
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-1 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-full transition-colors text-sm font-medium">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              <span>Message</span>
            </button>
          </div>
        </div>

        {/* Profile Details - Twitter bio style */}
        <div className="mt-16 sm:mt-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.name || "Dr. Alexandra Chen"}
            </h1>
            <p className="text-gray-600">
              @{user?.nickname || "alexchen_research"}
            </p>
          </div>

          <p className="text-gray-800">
            Principal Investigator specializing in computational biology and
            protein structure prediction. Collaborating with leading researchers
            to advance precision medicine through AI-driven discoveries.
          </p>

          {/* Twitter-style meta info */}
          <div className="flex flex-wrap gap-y-1 text-gray-500 text-sm">
            <div className="flex items-center mr-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Stanford University</span>
            </div>
            <div className="flex items-center mr-4">
              <LinkIcon className="w-4 h-4 mr-1" />
              <a href="#" className="text-blue-500 hover:underline">
                labwebsite.edu
              </a>
            </div>
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Joined September 2015</span>
            </div>
          </div>

          {/* Reddit-style stats */}
          <div className="flex space-x-5 pt-2">
            <div className="flex items-center">
              <span className="font-bold mr-1">24</span>
              <span className="text-gray-600 text-sm">Research Papers</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">2.8k</span>
              <span className="text-gray-600 text-sm">Citations</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">156</span>
              <span className="text-gray-600 text-sm">Collaborators</span>
            </div>
          </div>
        </div>

        {/* Reddit-style tabs */}
        <div className="flex border-b border-gray-200 mt-4">
          {["Posts", "Comments", "Saved", "Upvoted"].map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-3 font-medium text-sm relative ${
                index === 0
                  ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#49D470]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </section>


      

      {/* Content Section - Reddit-style posts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {mockPosts.map((post, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md mb-3 hover:border-gray-300 transition-colors">
            {/* Post voting - Reddit style */}
            <div className="flex">
              <div className="bg-gray-50 p-2 flex flex-col items-center">
                <button className="text-gray-400 hover:text-[#49D470]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className="text-xs font-bold my-1">{post.upvotes}</span>
                <button className="text-gray-400 hover:text-red-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Post content */}
              <div className="p-3 flex-1">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="font-medium text-[#49D470] mr-1">
                    {post.type}
                  </span>
                  <span>
                    • Posted by u/{user?.nickname || "alexchen"} {post.date}
                  </span>
                </div>

                <h3 className="font-medium text-lg mb-2 hover:text-[#49D470] cursor-pointer">
                  {post.title}
                </h3>

                <div className="flex text-xs text-gray-500 space-x-4">
                  <button className="flex items-center hover:bg-gray-100 p-1 rounded">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{post.comments} Comments</span>
                  </button>
                  <button className="flex items-center hover:bg-gray-100 p-1 rounded">
                    <BarChart2 className="w-4 h-4 mr-1" />
                    <span>{post.engagement}</span>
                  </button>
                  <button className="flex items-center hover:bg-gray-100 p-1 rounded">
                    <Bookmark className="w-4 h-4 mr-1" />
                    <span>Save</span>
                  </button>
                  <button className="flex items-center hover:bg-gray-100 p-1 rounded">
                    <MoreHorizontal className="w-4 h-4 mr-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Load more button - Reddit style */}
        <div className="mt-4">
          <button className="w-full py-2 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50">
            View More Posts
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;

import React from "react";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import {
  Bookmark,
  Settings,
  MessageCircle,
  Award,
  Calendar,
  Link as LinkIcon,
  MapPin,
  BarChart2,
  Star,
  Trophy,
  Zap,
  FlaskConical,
  Microscope,
  Cpu,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth0();

  //This is mock user data for frontend development only
  // Will be replaced with real API data once backend is ready
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user,
  );
  console.log(currentUser);
  

  const mockPosts = [
    {
      title: "Advancements in Genomic Sequencing",
      type: "Research Paper",
      date: "2 days ago",
      engagement: "127 interactions",
      upvotes: 142,
      comments: 23,
    },
    {
      title: "Biotech Applications in Agriculture",
      type: "Collaboration",
      date: "1 week ago",
      engagement: "89 interactions",
      upvotes: 98,
      comments: 15,
    },
    {
      title: "AI in Materials Science Research",
      type: "Discussion",
      date: "2 weeks ago",
      engagement: "203 interactions",
      upvotes: 231,
      comments: 42,
    },
  ];

  const joinDate = new Date(currentUser.createdAt);
  const yearsActive = new Date().getFullYear() - joinDate.getFullYear();

  return (
    <div className="min-h-screen bg-white text-black">
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
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between">
          <div className="absolute sm:relative left-4 sm:left-0 -top-16 sm:-top-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-lg overflow-hidden bg-gray-200">
            <img
              src={
                `https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${currentUser?.profilePicture}` ||
                "/default-avatar.png"
              }
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
            {currentUser.isTopUser && (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#AD49E1] rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>

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

        <div className="mt-16 sm:mt-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{currentUser.name}</h1>
            <p className="text-gray-600">
              {currentUser.role.charAt(0).toUpperCase() +
                currentUser.role.slice(1)}{" "}
              | {currentUser.email}
            </p>
          </div>

          <p className="text-gray-800">
            {currentUser.role === "professor"
              ? "Professor specializing in " +
                currentUser.interests.slice(0, 2).join(" and ") +
                ". " +
                `Published researcher with ${yearsActive}+ years of experience in academia.`
              : "Researcher with expertise in " +
                currentUser.interests.slice(0, 3).join(", ") +
                "."}
          </p>

          <div className="flex flex-wrap gap-2">
            {currentUser.interests.map((interest, index) => (
              <span
                key={index}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                {interest === "Genomics" && (
                  <FlaskConical className="w-4 h-4 mr-1" />
                )}
                {interest === "Biotechnology" && (
                  <Microscope className="w-4 h-4 mr-1" />
                )}
                {interest === "Artificial Intelligence" && (
                  <Cpu className="w-4 h-4 mr-1" />
                )}
                {interest === "Materials Science" && (
                  <Zap className="w-4 h-4 mr-1" />
                )}
                {interest}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-y-1 text-gray-500 text-sm">
            <div className="flex items-center mr-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Indian Institute of Science, Bangalore</span>
            </div>
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                Member since{" "}
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex space-x-5 pt-2">
            <div className="flex items-center">
              <span className="font-bold mr-1">12</span>
              <span className="text-gray-600 text-sm">Publications</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">1.2k</span>
              <span className="text-gray-600 text-sm">Citations</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">42</span>
              <span className="text-gray-600 text-sm">Collaborators</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-sm">Reputation</div>
              <div className="font-bold flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {currentUser.reputation}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-sm">Impact Score</div>
              <div className="font-bold">{currentUser.impactScore}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-sm">Level</div>
              <div className="font-bold">{currentUser.level}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-sm">Login Streak</div>
              <div className="font-bold">{currentUser.loginStreak} days</div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mt-4">
          {["Posts", "Publications", "Collaborations", "Saved"].map(
            (tab, index) => (
              <button
                key={index}
                className={`px-4 py-3 font-medium text-sm relative ${
                  index === 0
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#AD49E1]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}>
                {tab}
              </button>
            )
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {mockPosts.map((post, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md mb-3 hover:border-gray-300 transition-colors">
            <div className="flex">
              <div className="bg-gray-50 p-2 flex flex-col items-center">
                <button className="text-gray-400 hover:text-[#AD49E1]">
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

              <div className="p-3 flex-1">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="font-medium text-[#AD49E1] mr-1">
                    {post.type}
                  </span>
                  <span>
                    • Posted by {currentUser.name.split(" ")[0]} {post.date}
                  </span>
                </div>

                <h3 className="font-medium text-lg mb-2 hover:text-[#AD49E1] cursor-pointer">
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
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentUser.challengesCompleted === 0 && (
          <div className="border border-gray-200 rounded-md p-6 text-center mt-6">
            <Trophy className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-lg mb-1">
              No challenges completed yet
            </h3>
            <p className="text-gray-500 text-sm">
              Participate in research challenges to earn badges and boost your
              reputation.
            </p>
            <button className="mt-3 px-4 py-2 bg-[#AD49E1] text-white rounded-md text-sm font-medium hover:bg-[#3DBF5F]">
              Explore Challenges
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;

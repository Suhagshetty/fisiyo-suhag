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
              | {currentUser.handle}
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



// import React, { useState, useEffect } from "react";
// import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
// import { useAuth0 } from "@auth0/auth0-react";
// import PostCard from "./Post";
// import axios from "axios";
// import { formatDate, truncateText, formatVoteCount } from "../utils/feedUtils";
// import useFeedData from "../hooks/useFeedData";
// import { 
//   Bookmark, 
//   Users,
//   FileText, 
// } from "lucide-react";

// const ProfilePage = () => {
//   const { handle } = useParams();
//   const { logout, user, isAuthenticated } = useAuth0();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [currentUser, setCurrentUser] = useState(location.state?.user || null);
//   const [userhandle, setuserhandle] = useState(location.state?.handle || null);
//   const [profileUser, setProfileUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isFollowing, setIsFollowing] = useState(false); 
//   const [loadingSaved, setLoadingSaved] = useState(true);
//   const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'saved'
//   const [userPosts, setUserPosts] = useState([]);
//   const [loadingPosts, setLoadingPosts] = useState(true); 

  
//     const {
//       expandedPosts,
//       votedPosts,
//       upvoteCounts,
//       polls,
//       savedPosts,
//       downvoteCounts,
//       communities,
//       posts,
//       loading: feedLoading,
//       error: feedError,
//       togglePostExpansion,
//       handleSavePost,
//       handleVote,
//       setVotedPosts,
//       setUpvoteCounts,
//       setDownvoteCounts,
//     } = useFeedData(currentUser, user);

//   // Fetch saved posts
//   useEffect(() => {
//     const fetchSavedPosts = async () => {
//       if (currentUser?._id) {
//         try {
//           const response = await fetch(
//             `http://localhost:3000/api/users/saved-posts/${currentUser._id}`
//           );
//           if (response.ok) {
//             const saved = await response.json();
//             setSavedPosts(saved);
//             setLoadingSaved(false);
//           }
//         } catch (error) {
//           console.error("Error loading saved posts:", error);
//           setLoadingSaved(false);
//         }
//       }
//     };

//     fetchSavedPosts();
//   }, [currentUser]);

//   // Fetch user data
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get(
//           `http://localhost:3000/api/users/handle/${userhandle}`
//         );
//         setProfileUser(response.data);
//         setIsLoading(false);
//       } catch (err) {
//         setError("Failed to load profile");
//         setIsLoading(false);
//         console.error(err);
//       }
//     };

//     fetchUserData();
//   }, [handle, currentUser, user]);

//   useEffect(() => {
//     const fetchUserPosts = async () => {
//       // Check if user exists and has posts
//       if (
//         !profileUser?._id ||
//         !profileUser?.posts ||
//         profileUser.posts.length === 0
//       ) {
//         setUserPosts([]);
//         setLoadingPosts(false);
//         return;
//       }

//       try {
//         setLoadingPosts(true);

//         // Convert to comma-separated string
//         const idsString = profileUser.posts.join(",");

//         const response = await axios.get(
//           `http://localhost:3000/api/posts/by-ids?ids=${idsString}` // Use relative path
//         );

//         setUserPosts(response.data);

//         // Initialize vote counts
//         const initialUpvoteCounts = new Map();
//         const initialDownvoteCounts = new Map();

//         response.data.forEach((post) => {
//           initialUpvoteCounts.set(post._id, post.upvotes?.length || 0);
//           initialDownvoteCounts.set(post._id, post.downvotes?.length || 0);
//         });

//         setUpvoteCounts(initialUpvoteCounts);
//         setDownvoteCounts(initialDownvoteCounts);
//       } catch (error) {
//         console.error("Error loading user posts:", error);
//       } finally {
//         setLoadingPosts(false);
//       }
//     };

//     fetchUserPosts();
//   }, [profileUser]);




//   // Render loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#AD49E1] mx-auto mb-4"></div>
//           <h2 className="text-xl font-medium text-white">
//             Loading Profile Data
//           </h2>
//           <p className="text-[#818384]">Analyzing user information...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render error state
//   if (error || !profileUser) {
//     return (
//       <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
//         <div className="bg-[#111111] p-8 rounded-3xl max-w-md w-full shadow-2xl border border-[#272b30]">
//           <div className="text-center">
//             <div className="bg-red-500/20 p-4 rounded-full inline-flex">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-12 w-12 text-red-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-white mt-4">
//               Profile Not Found
//             </h2>
//             <p className="text-[#818384] mt-2">
//               The user <span className="font-mono">u/{handle}</span> could not
//               be located in our database.
//             </p>
//             <button
//               onClick={() => window.history.back()}
//               className="mt-6 bg-gradient-to-r from-[#AD49E1] to-[#AD49E1] text-white font-medium py-2 px-6 rounded-full transition-all duration-300">
//               Return to Previous Page
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render posts list
//   const renderPostsList = (posts, loading) => {
//     if (loading) {
//       return (
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#AD49E1] border-t-transparent"></div>
//         </div>
//       );
//     }

//     if (posts.length === 0) {
//       return (
//         <div className="text-center py-16">
//           <div className="w-20 h-20 bg-gradient-to-br from-[#AD49E1]/20 to-[#AD49E1]/20 rounded-full flex items-center justify-center mx-auto mb-6">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-10 h-10 text-[#AD49E1]"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//               />
//             </svg>
//           </div>
//           <h3 className="text-2xl font-semibold text-white mb-3">
//             No posts yet
//           </h3>
//           <p className="text-[#818384] max-w-md mx-auto mb-8 text-lg">
//             {activeTab === "saved"
//               ? "You haven't saved any posts yet"
//               : "This user hasn't created any posts yet"}
//           </p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-0 sm:border overflow-hidden border-[#222]">
//         {posts.map((post) => {
//           const isExpanded = expandedPosts.has(post._id);
//           const userVote = votedPosts.get(post._id);
//           const upvoteCount = upvoteCounts.get(post._id) || 0;
//           const downvoteCount = downvoteCounts.get(post._id) || 0;

//           return (
//             <PostCard
//               key={post._id}
//               post={post}
//               currentUser={currentUser}
//               isExpanded={isExpanded}
//               togglePostExpansion={togglePostExpansion}
//               userVote={userVote}
//               upvoteCount={upvoteCount}
//               downvoteCount={downvoteCount}
//               handleVote={handleVote}
//               savedPosts={savedPosts}
//               handleSavePost={handleSavePost}
//               formatDate={formatDate}
//               truncateText={truncateText}
//               formatVoteCount={formatVoteCount}
//               location={location}
//             />
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-[#e1e1e1] flex">
//       <div className="flex-1 flex flex-col">
//         {/* Banner */}
//         <div className="relative">
//           <div
//             className="sm:h-64 h-30 overflow-hidden"
//             style={{
//               backgroundImage: `linear-gradient(to top right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%), url("https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1792&q=80")`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}>
//             <div className="absolute inset-0 flex sm:items-end items-center justify-start">
//               <div className="container mx-auto sm:px-4 px-0 sm:pb-6 pb-0">
//                 <div className="flex sm:items-end items-center sm:gap-6 gap-4">
//                   <div className="sm:w-50 sm:h-50 w-25 h-25 rounded-full">
//                     {profileUser.profilePicture ? (
//                       <img
//                         src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${profileUser.profilePicture}`}
//                         alt={profileUser.name}
//                         className="w-full h-full rounded-full object-contain"
//                       />
//                     ) : (
//                       <div className="w-full h-full rounded-xl flex items-center justify-center text-white text-4xl font-bold">
//                         {profileUser.name.charAt(0)}
//                       </div>
//                     )}
//                   </div>

//                   {/* Title and Info */}
//                   <div className="text-white">
//                     <h1
//                       className="sm:text-5xl text-xs sm:mb-3 font-bold"
//                       style={{ color: "#ffffff" }}>
//                       {profileUser.name}
//                     </h1>

//                     <p
//                       className="sm:text-xl text-xs opacity-90 sm:mt-1"
//                       style={{ color: "#ffffff" }}>
//                       n/{profileUser.handle}
//                     </p>

//                     {/* Stats */}
//                     <div className="flex items-center gap-6 sm:mt-4">
//                       <div className="flex items-center sm:text-base text-xs text-[#d7dadc]">
//                         <FileText className="sm:h-5 sm:w-5 w-3 h-3 mr-2" />
//                         <span>{userPosts.length} posts</span>
//                       </div>
//                       <div className="flex items-center sm:text-base text-xs text-[#d7dadc]">
//                         <Bookmark className="sm:h-5 sm:w-5 w-3 h-3 mr-2" />
//                         <span>{savedPosts.length} saved</span>
//                       </div>
//                       <div className="flex items-center sm:text-base text-xs text-[#d7dadc]">
//                         <Users className="sm:h-5 sm:w-5 w-3 h-3 mr-2" />
//                         <span>{profileUser.followersCount} followers</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-[#333] ">
//           <div className="max-w-4xl mx-auto px-4 flex">
//             <button
//               className={`px-4 py-3 font-medium text-sm border-b-2 ${
//                 activeTab === "posts"
//                   ? "border-[#AD49E1] text-white"
//                   : "border-transparent text-[#818384] hover:text-white"
//               }`}
//               onClick={() => setActiveTab("posts")}>
//               Posts
//             </button>
//             <button
//               className={`px-4 py-3 font-medium text-sm border-b-2 ${
//                 activeTab === "saved"
//                   ? "border-[#AD49E1] text-white"
//                   : "border-transparent text-[#818384] hover:text-white"
//               }`}
//               onClick={() => setActiveTab("saved")}>
//               Saved
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="max-w-4xl mx-auto px-4 pb-8 w-full">
//           {activeTab === "posts"
//             ? renderPostsList(userPosts, loadingPosts)
//             : renderPostsList(savedPosts, loadingSaved)}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

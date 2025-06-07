import React, { useState } from "react";
import {
  Search,
  Flame,
  TrendingUp,
  Clock,
  Hash,
  FileText,
  Users,
  MessageCircle ,
  Bookmark,
  Globe,
  Mic,
  BarChart2,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const Explore = () => {
  const { isAuthenticated } = useAuth0();
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for different sections
  const trendingTopics = [
    { name: "CRISPR", posts: 1243, icon: <Mic className="w-4 h-4" /> },
    {
      name: "Quantum Computing",
      posts: 892,
      icon: <BarChart2 className="w-4 h-4" />,
    },
    { name: "Neuroplasticity", posts: 765, icon: <Hash className="w-4 h-4" /> },
    { name: "Climate Models", posts: 621, icon: <Globe className="w-4 h-4" /> },
    { name: "mRNA Vaccines", posts: 587, icon: <Users className="w-4 h-4" /> },
  ];

  const recommendedPapers = [
    {
      title: "Advancements in Protein Folding Prediction",
      author: "Dr. Elena Rodriguez",
      citations: 142,
      field: "Bioinformatics",
    },
    {
      title: "Quantum Algorithms for Optimization Problems",
      author: "Prof. James Chen",
      citations: 89,
      field: "Quantum Physics",
    },
    {
      title: "Neural Correlates of Consciousness",
      author: "Dr. Priya Kapoor",
      citations: 203,
      field: "Neuroscience",
    },
  ];

  const popularDiscussions = [
    {
      title: "Ethics of AI in Medical Diagnosis",
      comments: 142,
      upvotes: 328,
      tags: ["AI", "Medical Ethics"],
    },
    {
      title: "Open Access vs. Traditional Publishing",
      comments: 89,
      upvotes: 215,
      tags: ["Academic Publishing"],
    },
    {
      title: "Reproducibility Crisis in Psychology",
      comments: 203,
      upvotes: 417,
      tags: ["Psychology", "Methodology"],
    },
  ];

  const recentCollaborations = [
    {
      title: "Climate Change Modeling Team",
      members: 24,
      field: "Environmental Science",
    },
    {
      title: "CRISPR Gene Editing Consortium",
      members: 42,
      field: "Genetics",
    },
    {
      title: "Quantum Machine Learning Group",
      members: 18,
      field: "Computer Science",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Explore
          </h1>
          {isAuthenticated && (
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search papers, discussions, or researchers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#AD49E1] focus:border-[#AD49E1]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              {
                id: "trending",
                icon: <Flame className="w-4 h-4" />,
                label: "Trending",
              },
              {
                id: "papers",
                icon: <FileText className="w-4 h-4" />,
                label: "Papers",
              },
              {
                id: "discussions",
                icon: <MessageCircle className="w-4 h-4" />,
                label: "Discussions",
              },
              {
                id: "collaborations",
                icon: <Users className="w-4 h-4" />,
                label: "Collaborations",
              },
              {
                id: "topics",
                icon: <Hash className="w-4 h-4" />,
                label: "Topics",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm flex items-center space-x-2 border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#AD49E1] text-[#AD49E1]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending Section */}
          {activeTab === "trending" && (
            <>
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-[#AD49E1]" />
                    <span>Trending in Your Network</span>
                  </h2>
                  <button className="text-sm text-[#AD49E1] hover:text-[#3bb45d]">
                    See all
                  </button>
                </div>
                <div className="space-y-4">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-gray-100 text-gray-700">
                          {topic.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">#{topic.name}</h3>
                          <p className="text-sm text-gray-500">
                            {topic.posts.toLocaleString()} posts this week
                          </p>
                        </div>
                      </div>
                      <button className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-[#AD49E1]" />
                    <span>Recent Discussions</span>
                  </h2>
                  <button className="text-sm text-[#AD49E1] hover:text-[#3bb45d]">
                    See all
                  </button>
                </div>
                <div className="space-y-4">
                  {popularDiscussions.map((discussion, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg hover:border-[#AD49E1]/30 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">{discussion.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {discussion.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{discussion.upvotes} upvotes</span>
                        <span>{discussion.comments} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Papers Section */}
          {activeTab === "papers" && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium mb-4">Recommended Papers</h2>
                <div className="space-y-4">
                  {recommendedPapers.map((paper, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {paper.author}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{paper.citations} citations</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {paper.field}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Discussions Section */}
          {activeTab === "discussions" && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium mb-4">
                  Popular Discussions
                </h2>
                <div className="space-y-4">
                  {popularDiscussions.map((discussion, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-2">{discussion.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {discussion.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{discussion.upvotes} upvotes</span>
                        <span>{discussion.comments} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Collaborations Section */}
          {activeTab === "collaborations" && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium mb-4">
                  Open Collaborations
                </h2>
                <div className="space-y-4">
                  {recentCollaborations.map((collab, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-medium mb-1">{collab.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {collab.field}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{collab.members} members</span>
                        <button className="text-sm px-3 py-1 rounded-full bg-[#AD49E1] text-white hover:bg-[#3bb45d]">
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Topics Section */}
          {activeTab === "topics" && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium mb-4">Research Topics</h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Artificial Intelligence",
                    "Bioinformatics",
                    "Climate Science",
                    "Quantum Computing",
                    "Neuroscience",
                    "Genetics",
                    "Materials Science",
                    "Robotics",
                    "Data Science",
                    "Biotechnology",
                    "Physics",
                    "Chemistry",
                    "Mathematics",
                    "Psychology",
                    "Engineering",
                  ].map((topic, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm">
                      #{topic}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Recommended Researchers */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Researchers to Follow</h2>
            <div className="space-y-4">
              {[
                {
                  name: "Dr. Maria Chen",
                  field: "Computational Biology",
                  institution: "MIT",
                },
                {
                  name: "Prof. James Wilson",
                  field: "Quantum Physics",
                  institution: "Stanford",
                },
                {
                  name: "Dr. Priya Kapoor",
                  field: "Neuroscience",
                  institution: "Oxford",
                },
              ].map((researcher, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{researcher.name}</h3>
                    <p className="text-sm text-gray-600">
                      {researcher.field} • {researcher.institution}
                    </p>
                  </div>
                  <button className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {[
                {
                  title: "AI in Healthcare Symposium",
                  date: "May 15, 2023",
                  location: "Virtual",
                },
                {
                  title: "Quantum Computing Workshop",
                  date: "June 2, 2023",
                  location: "Stanford, CA",
                },
                {
                  title: "Neuroscience Annual Conference",
                  date: "July 10-12, 2023",
                  location: "Boston, MA",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Quick Links</h2>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-[#AD49E1]">
                <Hash className="w-4 h-4" />
                <span>Research Methodology Guidelines</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-[#AD49E1]">
                <Hash className="w-4 h-4" />
                <span>Open Access Resources</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-[#AD49E1]">
                <Hash className="w-4 h-4" />
                <span>Collaboration Best Practices</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-700 hover:text-[#AD49E1]">
                <Hash className="w-4 h-4" />
                <span>Funding Opportunities</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Explore;

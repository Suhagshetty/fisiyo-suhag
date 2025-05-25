// App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Feed from "./components/Feed";
import ProfileSetup from "./components/ProfileSetup";
import Profile from "./components/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/setup" element={<ProfileSetup />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/space-background.css";
import { useNavigate } from "react-router-dom";

const PostLoginCheck = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const fullText = "FISIYO";
  const typingSpeed = 150;
  const pauseDuration = 1000;
  const eraseSpeed = 100;

  useEffect(() => {
    let timer;

    if (isTyping) {
      if (displayText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, eraseSpeed);
      } else {
        setAnimationCompleted(true);
        timer = setTimeout(() => {
          setIsTyping(true);
        }, 200);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isTyping]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !animationCompleted) return;

    const checkUser = async () => {
      const userId = user?.sub?.split("|")[1];
      if (!userId) {
        console.error("No userId found");
        return;
      }

      try {
        // 1. Check regular users
        const userRes = await fetch(
          `http://localhost:3000/api/users/${userId}`
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          navigate("/feed", { state: { user: userData } });
          return;
        }

        // 2. Check professors
        const professorRes = await fetch(
          `http://localhost:3000/api/professors/${userId}`
        );
        if (professorRes.ok) {
          const professorData = await professorRes.json();
          navigate("/feed", { state: { user: professorData } });
          return;
        }

        // 3. Check students
        const studentRes = await fetch(
          `http://localhost:3000/api/students/${userId}`
        );
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          navigate("/feed", { state: { user: studentData } });
          return;
        }

        // If none found, redirect to setup
        navigate("/setup");
      } catch (err) {
        console.error("Error checking user:", err);
        // Handle error appropriately
      }
    };

    checkUser();
  }, [isAuthenticated, isLoading, animationCompleted, user, navigate]);

  return (
    <div className="flex items-center font-[Orbitron] justify-center h-screen space-background text-white">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="stars4"></div>
      <div className="text-9xl font-extrabold tracking-widest">
        {displayText}
        <span
          className={`inline-block align-middle w-[1px] h-25 ml-1 bg-white ${
            displayText.length === fullText.length ? "animate-pulse" : ""
          }`}></span>
      </div>
    </div>
  );
};

export default PostLoginCheck;

// InterestCloud.jsx
import React from "react";

const InterestCloud = ({ topics, selectedInterests, onInterestToggle }) => {
  const fonts = [
    "Playfair Display",
    "Roboto Condensed",
    "Oswald",
    "Lora",
    "Merriweather",
    "Raleway",
    "Bebas Neue",
    "Archivo Black",
    "Space Mono",
    "Pacifico",
    "Rubik Moonrocks",
    "Fjalla One",
    "Abril Fatface",
    "Righteous",
    "Dancing Script",
    "Press Start 2P",
  ];

  const positions = {
    0: { top: "26%", left: "40%", fontSize: "58px" },
    1: { top: "10%", left: "4%", fontSize: "44px" },
    2: { top: "-4%", left: "27%", fontSize: "64px" },
    3: { top: "11%", left: "50%", fontSize: "40px" },
    4: { top: "38.5%", left: "56%", fontSize: "48px" },
    5: { top: "20%", left: "44%", fontSize: "44px" },
    6: { top: "22.5%", left: "76%", fontSize: "27px" },
    7: { top: "38%", left: "0%", fontSize: "44px" },
    8: { top: "30%", left: "3%", fontSize: "32px" },
    9: { top: "49%", left: "5%", fontSize: "32px" },
    10: { top: "2%", left: "-8%", fontSize: "32px" },
    11: { top: "59%", left: "44%", fontSize: "34px" },
    12: { top: "61.5%", left: "28%", fontSize: "60px" },
    13: { top: "49%", left: "48%", fontSize: "44px" },
    14: { top: "57%", left: "12%", fontSize: "34px" },
    15: { top: "21%", left: "8%", fontSize: "36px" },
  };

  return (
    <div
      className="interest-cloud relative scale-[0.85] md:scale-120"
      style={{
        width: "600px",
        height: "500px",
        transformOrigin: "top center",
      }}>
      {topics.map((topic, index) => {
        const isSelected = selectedInterests.includes(topic);
        return (
          <span
            key={topic}
            onClick={() => onInterestToggle(topic)}
            className={`interest-word ${isSelected ? "selected" : ""}`}
            style={{
              position: "absolute",
              whiteSpace: "nowrap",
              ...positions[index],
              color: isSelected ? "#49B8E1" : "#DFE6E9",
              fontFamily: fonts[index],
              fontWeight: [2, 5, 7, 11].includes(index) ? 900 : 400,
              fontStyle: [3, 9, 14].includes(index) ? "italic" : "normal",
            }}>
            {topic}
          </span>
        );
      })}
      <style jsx>{`
        .interest-word {
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
        }
        .interest-word:hover {
          transform: scale(1.04);
          filter: brightness(1.05);
        }
        .interest-word.selected {
          color: #49b8e1 !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
  
};

export default InterestCloud;

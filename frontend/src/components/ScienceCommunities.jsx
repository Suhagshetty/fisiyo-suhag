import React, { useRef, useState, useEffect } from "react";
import "./CardStyles.css";

const Card = ({ image, header, content }) => {
  const cardRef = useRef(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const { offsetWidth, offsetHeight } = cardRef.current;
    setDimensions({ width: offsetWidth, height: offsetHeight });
  }, []);

  const handleMouseMove = (e) => {
    const { left, top } = cardRef.current.getBoundingClientRect();
    setMouseX(e.clientX - left - dimensions.width / 2);
    setMouseY(e.clientY - top - dimensions.height / 2);
  };

  const handleMouseLeave = () => {
    setMouseX(0);
    setMouseY(0);
  };

  const mousePX = mouseX / dimensions.width;
  const mousePY = mouseY / dimensions.height;

  const cardStyle = {
    transform: `rotateY(${mousePX * 30}deg) rotateX(${mousePY * -30}deg)`,
  };

  const cardBgTransform = {
    transform: `translateX(${mousePX * -40}px) translateY(${mousePY * -40}px)`,
  };

  const cardBgImage = {
    backgroundImage: `url(${image})`,
  };

  return (
    <div
      className="card-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => clearTimeout()}
      ref={cardRef}>
      <div className="card" style={cardStyle}>
        <div
          className="card-bg"
          style={{ ...cardBgTransform, ...cardBgImage }}></div>
        <div className="card-info">
          <h1>{header}</h1>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

const CardGrid = () => {
  const cards = [
    {
      image:
        "https://images.unsplash.com/photo-1479660656269-197ebb83b540?dpr=2&auto=compress,format&fit=crop&w=1199&h=798&q=80&cs=tinysrgb&crop=",
      header: "Canyons",
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1479659929431-4342107adfc1?dpr=2&auto=compress,format&fit=crop&w=1199&h=799&q=80&cs=tinysrgb&crop=",
      header: "Beaches",
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1479644025832-60dabb8be2a1?dpr=2&auto=compress,format&fit=crop&w=1199&h=799&q=80&cs=tinysrgb&crop=",
      header: "Trees",
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1479621051492-5a6f9bd9e51a?dpr=2&auto=compress,format&fit=crop&w=1199&h=811&q=80&cs=tinysrgb&crop=",
      header: "Lakes",
      content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    },
  ];

  return (
    <div className="container">
      <h1 className="title">Hover over the cards</h1>
      {cards.map((card, index) => (
        <Card
          key={index}
          image={card.image}
          header={card.header}
          content={card.content}
        />
      ))}
    </div>
  );
};

export default Card;

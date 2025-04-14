import React, { useState } from 'react';
import './Organic.css';

const Organic = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Single image with absolute path
  const fruitImage = {
    image: `${process.env.PUBLIC_URL}/home-images/1.jpg`,
    name: "Organic Fruits"
  };

  return (
    <div 
      className="organic-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="fruit-image-container">
        <img 
          src={fruitImage.image} 
          alt={fruitImage.name}
          className="fruit-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x500?text=Image+Missing';
            e.target.style.border = '2px solid red';
          }}
        />
        
        {/* Hover buttons */}
        <div className={`hover-buttons ${isHovered ? 'visible' : ''}`}>
          <button className="explore-btn">Explore</button>
          <button className="contact-btn">Contact</button>
        </div>
      </div>
      
      <h2 className="fruit-title">{fruitImage.name}</h2>
      <p className="fruit-subtitle">For Better Health</p>
    </div>
  );
};

export default Organic;
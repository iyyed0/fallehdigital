import React from 'react';
import './ProductCard.css';

const ProductCard = ({ title, description }) => {
  return (
    <div className="product-card">
      <div className="product-image"></div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="product-btn">View Details</button>
    </div>
  );
};

export default ProductCard;
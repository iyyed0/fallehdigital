import React from 'react';
import './BlogPost.css';

const BlogPost = ({ title, date }) => {
  return (
    <div className="blog-post">
      <div className="blog-image"></div>
      <div className="blog-content">
        <h3>{title}</h3>
        <p className="blog-date">{date}</p>
        <button className="read-more">Read More</button>
      </div>
    </div>
  );
};

export default BlogPost;
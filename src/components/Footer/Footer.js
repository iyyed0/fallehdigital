import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
      <div className="social-icons">
          <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="icon" />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="icon" />
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="icon" />
          </a>
          <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer">
            <FaYoutube className="icon" />
          </a>
        </div>
        <div className="contact-info">
          <h3>GET IN TOUCH</h3>
          <p>2013 Bessie, New York, USA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
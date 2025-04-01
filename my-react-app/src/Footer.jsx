import React from 'react';
import './Footer.css'; // For styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://facebook.com/xequity" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook" />
        </a>
        <a href="https://instagram.com/xequity" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram" />
        </a>
        <a href="https://twitter.com/xequity" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/twitter.png" alt="Twitter" />
        </a>
        <a href="https://github.com/xequity" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/github.png" alt="GitHub" />
        </a>
        <a href="mailto:info@xequity.com" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/gmail.png" alt="Email" />
        </a>
        <a href="https://linkedin.com/company/xequity" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" />
        </a>
      </div>

      <p className="footer-text">
        &copy; {new Date().getFullYear()} Xequity. All rights reserved. | 
        <a href="/privacy-policy" style={{ marginLeft: '5px', color: '#555', textDecoration: 'none' }}>Privacy Policy</a> | 
        <a href="/terms-of-service" style={{ marginLeft: '5px', color: '#555', textDecoration: 'none' }}>Terms of Service</a>
      </p>
    </footer>
  );
};

export default Footer;
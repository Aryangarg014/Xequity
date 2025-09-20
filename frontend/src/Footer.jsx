import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Main Footer Section */}
        <div className="footer-section">
          <div className="footer-column">
            <h3>About Xequity</h3>
            <p>
              Xequity is a revolutionary platform that connects investors with innovative startups
              and entrepreneurs. We provide a secure and transparent marketplace for equity trading
              and investment opportunities.
            </p>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="/product">Products</a>
            <a href="/virtualAssets">Virtual Assets</a>
            <a href="/investor">Investors</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <a href="/help">Help Center</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact Support</a>
            <a href="/documentation">Documentation</a>
            <a href="/status">System Status</a>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/cookie-policy">Cookie Policy</a>
            <a href="/disclaimer">Disclaimer</a>
            <a href="/compliance">Compliance</a>
          </div>
        </div>

        {/* Social Icons */}
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

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-text">
            <span>&copy; {new Date().getFullYear()} Xequity. All rights reserved.</span>
            <span>|</span>
            <span>Empowering the future of investment</span>
          </div>

          <div className="footer-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/cookie-policy">Cookie Policy</a>
            <a href="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
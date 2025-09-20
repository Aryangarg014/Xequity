import React from "react";
import { createPortal } from "react-dom";
import "./PremiumModal.css";
import { X, CheckCircle, Sparkles } from "lucide-react"; // Icons


const PremiumModal = ({ show, onClose, onGetPremium }) => {
  if (!show) return null;


  // Render the modal using a portal to document.body
  return createPortal(
    <div className="premium-overlay">
      <div className="premium-card">
        <button className="close-icon" onClick={onClose}>
          <X size={22} />
        </button>


        <div className="premium-header-section">
          <Sparkles size={32} className="sparkle-icon" />
          <h2 className="premium-title">Upgrade to Xequity Premium</h2>
          <p className="premium-subtitle">
            Gain access to powerful tools that help you network and grow faster.
          </p>
        </div>


        <ul className="benefits-list">
          <li><CheckCircle className="check-icon" /> Direct messaging with any investor or founder</li>
          <li><CheckCircle className="check-icon" /> Early access to company updates & deals</li>
          <li><CheckCircle className="check-icon" /> Increased visibility on your profile</li>
          <li><CheckCircle className="check-icon" /> Personalized insights and alerts</li>
        </ul>


        <div className="premium-actions">
          <button className="get-premium-btn" onClick={onGetPremium}>Get Premium Now</button>
          <button className="cancel-btn" onClick={onClose}>Maybe Later</button>
        </div>
      </div>
    </div>,
    document.body // This renders the modal directly to the body, bypassing container restrictions
  );
};


export default PremiumModal;



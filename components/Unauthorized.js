import { ImBlocked } from "react-icons/im";

export default function Unauthorized({ message }) {
  return (
    <div className="unauthorized-wrapper">
      <div className="restricted-card">
        <span className="floating-dots"></span>
        <span className="floating-dots"></span>
        <span className="floating-dots"></span>

        <div className="icon-wrapper">
          <ImBlocked size={48} color="#ff4d4f" />
        </div>

        <h1>Access Restricted</h1>

        <p>
          {message ||
            "You don't have sufficient permissions to view this content. Please contact your administrator if you believe this is a mistake."}
        </p>

        <a href="/" className="home-btn">
          Return to Safety
        </a>
      </div>
    </div>
  );
}

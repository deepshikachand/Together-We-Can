import React from "react";

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div style={{ minHeight: "100vh", background: "#0E6E5C", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ color: "#111", fontSize: "1.5rem", fontWeight: 500 }}>{message}</span>
  </div>
);

export default LoadingScreen; 
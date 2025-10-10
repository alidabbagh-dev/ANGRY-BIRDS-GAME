// HUD.jsx
import React from "react";

const HUD = ({ level, score, shotsLeft }) => {
  return (
    <div className="ab-hud ab-ui-top">
      <div className="ab-hud-item">Level: <strong>{level}</strong></div>
      <div className="ab-hud-item">Score: <strong>{score}</strong></div>
      <div className="ab-hud-item">Shots Left: <strong>{shotsLeft}</strong></div>
    </div>
  );
};

export default HUD;

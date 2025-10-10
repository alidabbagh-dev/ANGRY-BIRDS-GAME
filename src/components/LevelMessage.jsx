// LevelMessage.jsx
import React from "react";
const LevelMessage = ({ level }) => (
  <div className="ab-level-msg">
    <h2>Level Complete!</h2>
    <p>Moving to Level {level + 1}</p>
  </div>
);
export default LevelMessage;
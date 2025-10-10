// Instructions.jsx
import React from "react";
const Instructions = ({ level }) => (
  <div className="ab-instructions">
    <p className="ab-instr-title">Level {level}</p>
    <p>Drag the bird to launch!</p>
    <p>Hit all targets to advance</p>
  </div>
);
export default Instructions;


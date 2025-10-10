// Trajectory.jsx
import React from "react";

const Trajectory = ({ style, index, total }) => {
  const opacity = 1 - index / total;
  const combined = {
    position: "absolute",
    width: "calc(6px * var(--game-scale))",
    height: "calc(6px * var(--game-scale))",
    borderRadius: "50%",
    background: "rgba(120,120,120,0.9)",
    pointerEvents: "none",
    zIndex: 8,
    left: style.left,
    top: style.top,
    opacity,
    transform: "translate(-50%, -50%)",
  };
  return <div className="ab-trajectory-point" style={combined} />;
};

export default Trajectory;

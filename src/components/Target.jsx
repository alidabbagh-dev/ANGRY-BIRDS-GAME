// Target.jsx
import React from "react";

const Target = ({ x, y, isHit }) => {
  const style = {
    position: "absolute",
    left: x,
    top: y,
    width: "calc(30px * var(--game-scale))",
    height: "calc(30px * var(--game-scale))",
    transform: "translate(-50%, -50%)",
    zIndex: 7,
  };
  return <div className={`ab-target ${isHit ? "ab-target-hit" : ""}`} style={style} />;
};

export default Target;

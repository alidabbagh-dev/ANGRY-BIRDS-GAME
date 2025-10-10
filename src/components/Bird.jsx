// Bird.jsx
import React from "react";

const Bird = ({ x, y, isDragging }) => {
  const style = {
    position: "absolute",
    left: x,
    top: y,
    width: "calc(30px * var(--game-scale))",
    height: "calc(30px * var(--game-scale))",
    transform: "translate(-50%, -50%)",
    zIndex: 10,
  };

  return <div className={`ab-bird ${isDragging ? "ab-grabbing" : "ab-grab"}`} style={style} />;
};

export default Bird;

// Object.jsx
import React from "react";

const ObjectItem = ({ x, y, type }) => {
  const style = {
    position: "absolute",
    left: x,
    top: y,
    width: "calc(30px * var(--game-scale))",
    height: "calc(30px * var(--game-scale))",
    transform: "translate(-50%, -50%)",
    zIndex: 6,
  };
  return <div className={`ab-object ${type}`} style={style} />;
};

export default ObjectItem;

const Obstacle = ({ x, y, type }) => (
  <div
    className={`obstacle ${type}`}
    style={{ left: x, top: y }}
  ></div>
);

export default Obstacle;

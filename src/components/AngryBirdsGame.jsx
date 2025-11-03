// AngryBirdsGame.jsx
import { useEffect, useRef, useState } from "react";
import Bird from "./Bird";
import Target from "./Target";
import ObjectItem from "./Object";
import Trajectory from "./Trajectory";
import HUD from "./HUD";
import LevelMessage from "./LevelMessage";
import Instructions from "./Instructions";
import "./../index.css";

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 700;

const AngryBirdsGame = () => {
  const rootRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 700 });
  const [scale, setScale] = useState(1);

  // game state (use same defaults as شما)
  const [birdPosition, setBirdPosition] = useState({ x: 200, y: 400 });
  const [birdVelocity, setBirdVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [shotsLeft, setShotsLeft] = useState(3);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);
  const [objects, setObjects] = useState([]);
  const [targets, setTargets] = useState([]);
  const animationRef = useRef();

  // audio init (optional)
  const audioRef = useRef(
    typeof Audio !== "undefined" &&
      new Audio(
        "https://kappa.vgmsite.com/soundtracks/angry-birds/mskxllhbbp/25.%20Main%20Theme.mp3"
      )
  );
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    const playAudio = () => {
      audioRef.current.play().catch(() => {});
    };
    document.addEventListener("click", playAudio, { once: true });
    return () => {
      audioRef.current.pause();
      document.removeEventListener("click", playAudio);
    };
  }, []);

  // ========== responsive: calculate scale from container size ==========
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      setContainerSize({ w, h });
      const s = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);
      setScale(s);
    });
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    // initial measure
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      setContainerSize({ w, h });
      setScale(Math.min(w / GAME_WIDTH, h / GAME_HEIGHT));
    }
    window.addEventListener("resize", () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const s = Math.min(rect.width / GAME_WIDTH, rect.height / GAME_HEIGHT);
      setScale(s);
    });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", () => {});
    };
  }, []);

  // helpers: world <-> screen
  const toScreen = ({ x, y }) => {
    // center the logical game in container if aspect ratios differ
    const screenW = containerSize.w;
    const screenH = containerSize.h;
    const renderW = GAME_WIDTH * scale;
    const renderH = GAME_HEIGHT * scale;
    const offsetX = (screenW - renderW) / 2;
    const offsetY = (screenH - renderH) / 2;
    return {
      left: offsetX + x * scale,
      top: offsetY + y * scale,
    };
  };

  const toWorld = (clientX, clientY) => {
    if (!rootRef.current) return { x: 0, y: 0 };
    const rect = rootRef.current.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const renderW = GAME_WIDTH * scale;
    const renderH = GAME_HEIGHT * scale;
    const offsetX = (rect.width - renderW) / 2;
    const offsetY = (rect.height - renderH) / 2;
    // clamp inside render area
    const localX = (screenX - offsetX) / scale;
    const localY = (screenY - offsetY) / scale;
    return {
      x: Math.max(0, Math.min(GAME_WIDTH, localX)),
      y: Math.max(0, Math.min(GAME_HEIGHT, localY)),
    };
  };

  // Level layouts (unchanged but can be scaled visually)
  const generateLevelLayout = (lvl) => {
    const ts = [];
    const obs = [];
    switch (lvl) {
      case 0:
        ts.push(
          { id: "t1", x: 700, y: 400, isHit: false },
          { id: "t2", x: 800, y: 400, isHit: false },
          { id: "t3", x: 750, y: 300, isHit: false }
        );
        obs.push(
          { id: "o1", x: 650, y: 400, type: "wood", isHit: false },
          { id: "o2", x: 650, y: 350, type: "glass", isHit: false }
        );
        break;
      case 1:
        ts.push(
          { id: "t1", x: 750, y: 400, isHit: false },
          { id: "t2", x: 700, y: 350, isHit: false },
          { id: "t3", x: 800, y: 350, isHit: false },
          { id: "t4", x: 750, y: 300, isHit: false }
        );
        obs.push(
          { id: "o1", x: 650, y: 400, type: "wood", isHit: false },
          { id: "o2", x: 850, y: 400, type: "wood", isHit: false },
          { id: "o3", x: 750, y: 250, type: "glass", isHit: false }
        );
        break;
      case 2:
        ts.push(
          { id: "t1", x: 600, y: 400, isHit: false },
          { id: "t2", x: 600, y: 300, isHit: false },
          { id: "t3", x: 800, y: 400, isHit: false },
          { id: "t4", x: 800, y: 300, isHit: false }
        );
        obs.push(
          { id: "o1", x: 600, y: 350, type: "glass", isHit: false },
          { id: "o2", x: 800, y: 350, type: "wood", isHit: false },
          { id: "o3", x: 700, y: 400, type: "wood", isHit: false }
        );
        break;
      default:
        { const baseCount = 3 + Math.floor(lvl / 2);
        for (let i = 0; i < baseCount; i++) {
          ts.push({
            id: `t${i}`,
            x: 600 + Math.random() * 300,
            y: 200 + Math.random() * 250,
            isHit: false,
          });
        }
        for (let i = 0; i < baseCount - 1; i++) {
          obs.push({
            id: `o${i}`,
            x: 550 + Math.random() * 350,
            y: 200 + Math.random() * 250,
            type: Math.random() > 0.5 ? "wood" : "glass",
            isHit: false,
          });
        } }
    }
    return { targets: ts, obstacles: obs };
  };

  // init level
  useEffect(() => {
    const layout = generateLevelLayout(level);
    setTargets(layout.targets);
    setObjects(layout.obstacles);
    setBirdPosition({ x: 200, y: 400 });
    setBirdVelocity({ x: 0, y: 0 });
    setGameStarted(false);
    setShotsLeft(3);
  }, [level]);

  // trajectory calculator (works in world coords)
  const calculateTrajectory = (startX, startY, velocityX, velocityY) => {
    const points = [];
    const gravity = 0.5;
    const steps = 30;
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    for (let i = 0; i < steps; i++) {
      points.push({ x, y });
      x += vx;
      y += vy;
      vy += gravity;
    }
    return points;
  };

  // pointer handlers (use pointer events for touch + mouse)
  const pointerDown = (e) => {
    // ignore non-primary buttons
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const p = toWorld(e.clientX, e.clientY);
    // only start drag if close enough to bird and not in flight
    const dist = Math.hypot(p.x - birdPosition.x, p.y - birdPosition.y);
    if (!gameStarted && shotsLeft > 0 && dist < 80) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      console.log(dragStart)
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };

  const pointerMove = (e) => {
    if (!isDragging) return;
    const pWorld = toWorld(e.clientX, e.clientY);
    // clamp drag relative to slingshot anchor (200,400)
    const dx = pWorld.x - 200;
    const dy = pWorld.y - 400;
    const maxDrag = 200;
    const dist = Math.hypot(dx, dy);
    const scaleRatio = dist > maxDrag ? maxDrag / dist : 1;
    const newX = 200 + dx * scaleRatio;
    const newY = 400 + dy * scaleRatio;
    setBirdPosition({ x: newX, y: newY });
    const vx = -(newX - 200) * 0.2;
    const vy = -(newY - 400) * 0.2;
    setTrajectoryPoints(calculateTrajectory(newX, newY, vx, vy));
  };

  const pointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = birdPosition.x - 200;
    const dy = birdPosition.y - 400;
    setBirdVelocity({ x: -dx * 0.2, y: -dy * 0.2 });
    setGameStarted(true);
    setShotsLeft((p) => p - 1);
    setTrajectoryPoints([]);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      console.error("an error ouccured")
    }
  };

  // collisions & objects physics (same logic but in world coords)
  const checkCollision = (x1, y1, x2, y2) =>
    Math.hypot(x1 - x2, y1 - y2) < 40;

  const handleObjectPhysics = (object, birdX, birdY) => {
    if (!object.isHit) {
      const dx = object.x - birdX;
      const dy = object.y - birdY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 40) {
        const force = object.type === "glass" ? 2 : 1;
        return {
          ...object,
          isHit: true,
          velocityX: (dx / distance) * 10 * force,
          velocityY: (dy / distance) * 10 * force - 5,
        };
      }
    } else if (object.velocityX || object.velocityY) {
      return {
        ...object,
        x: object.x + (object.velocityX || 0),
        y: object.y + (object.velocityY || 0),
        velocityY: (object.velocityY || 0) + 0.5,
        velocityX: (object.velocityX || 0) * 0.99,
      };
    }
    return object;
  };

  // main loop
  useEffect(() => {
    const updateGame = () => {
      if (gameStarted) {
        // update bird pos
        setBirdPosition((prev) => ({
          x: prev.x + birdVelocity.x,
          y: prev.y + birdVelocity.y,
        }));

        setBirdVelocity((prev) => ({
          x: prev.x * 0.99,
          y: prev.y * 0.99 + 0.5,
        }));

        // objects update + collisions
        setObjects((prev) => {
          const updated = prev.map((obj) =>
            handleObjectPhysics(obj, birdPosition.x, birdPosition.y)
          );

          // flying objects may hit targets
          updated.forEach((obj) => {
            if (obj.isHit && (obj.velocityX || obj.velocityY)) {
              setTargets((prevTargets) =>
                prevTargets.map((target) => {
                  if (
                    !target.isHit &&
                    checkCollision(obj.x, obj.y, target.x, target.y)
                  ) {
                    setScore((s) => s + 100);
                    return { ...target, isHit: true };
                  }
                  return target;
                })
              );
            }
          });

          return updated;
        });

        // direct bird hits
        setTargets((prev) =>
          prev.map((t) => {
            if (
              !t.isHit &&
              checkCollision(birdPosition.x, birdPosition.y, t.x, t.y)
            ) {
              setScore((s) => s + 100);
              return { ...t, isHit: true };
            }
            return t;
          })
        );

        const allTargetsHit = targets.every((t) => t.isHit);
        const outOfBounds =
          birdPosition.y > GAME_HEIGHT + 100 ||
          birdPosition.x > GAME_WIDTH + 200 ||
          birdPosition.x < -200;

        if (outOfBounds) {
          if (shotsLeft === 0 && !allTargetsHit) {
            setScore((s) => Math.max(0, s - targets.length * 50));
            const layout = generateLevelLayout(level);
            setTargets(layout.targets);
            setObjects(layout.obstacles);
            setBirdPosition({ x: 200, y: 400 });
            setBirdVelocity({ x: 0, y: 0 });
            setGameStarted(false);
            setShotsLeft(3);
          } else {
            setGameStarted(false);
            setBirdPosition({ x: 200, y: 400 });
            setBirdVelocity({ x: 0, y: 0 });
          }
        }

        if (allTargetsHit) {
          setTimeout(() => {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            setBirdPosition({ x: 200, y: 400 });
            setBirdVelocity({ x: 0, y: 0 });
            setGameStarted(false);
            setShotsLeft(3);
            const newLayout = generateLevelLayout(nextLevel);
            setTargets(newLayout.targets);
            setObjects(newLayout.obstacles);
          }, 1200);
        }
      }
      animationRef.current = requestAnimationFrame(updateGame);
    };

    animationRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, birdVelocity, targets, birdPosition, shotsLeft, level]);

  // render
  return (
    <div
      className="ab-game-root"
      ref={rootRef}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      style={{
        backgroundImage: "url('/images/angry-bird-background.jpg')",
      }}
    >
      <h1 className="ab-title">Angry Birds Game</h1>

      <HUD level={level} score={score} shotsLeft={shotsLeft} />

      {/* trajectory */}
      {isDragging &&
        trajectoryPoints.map((p, i) => {
          const pos = toScreen(p);
          return (
            <Trajectory
              key={i}
              style={{ left: pos.left, top: pos.top }}
              index={i}
              total={trajectoryPoints.length}
            />
          );
        })}

      {/* bird */}
      <Bird
        x={toScreen(birdPosition).left}
        y={toScreen(birdPosition).top}
        isDragging={isDragging}
      />

      {/* targets */}
      {targets.map((t) => {
        const pos = toScreen(t);
        return (
          <Target key={t.id} x={pos.left} y={pos.top} isHit={t.isHit} scale={scale} />
        );
      })}

      {/* objects */}
      {objects.map((o) => {
        const pos = toScreen(o);
        return (
          <ObjectItem
            key={o.id}
            x={pos.left}
            y={pos.top}
            type={o.type}
            isHit={o.isHit}
            scale={scale}
          />
        );
      })}

      {/* instructions */}
      {!gameStarted && !isDragging && shotsLeft > 0 && <Instructions level={level} />}

      {/* level complete */}
      {targets.every((t) => t.isHit) && <LevelMessage level={level} />}
    </div>
  );
};

export default AngryBirdsGame;

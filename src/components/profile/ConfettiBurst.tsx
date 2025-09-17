import React from "react";

// Simple confetti burst using canvas
export function ConfettiBurst({ show }: { show: boolean }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!show || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    const colors = ["#FFD700", "#4ade80", "#FF69B4", "#00BFFF", "#FFA500", "#9932CC", "#FF4500"];
    const confetti = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * -h,
      r: 6 + Math.random() * 8,
      d: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      confetti.forEach((c) => {
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
        ctx.stroke();
      });
      update();
      frame++;
      if (frame < 90) requestAnimationFrame(draw);
    }
    function update() {
      confetti.forEach((c) => {
        c.y += c.d;
        c.tiltAngle += c.tiltAngleIncremental;
        c.tilt = Math.sin(c.tiltAngle) * 15;
        if (c.y > h) {
          c.x = Math.random() * w;
          c.y = -10;
        }
      });
    }
    draw();
    // Clean up
    return () => {
      ctx.clearRect(0, 0, w, h);
    };
  }, [show]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        display: show ? "block" : "none"
      }}
    />
  );
}

import React, { useRef, useState, useCallback } from 'react';

/**
 * AppleGlassCard: Apple-grade 3D parallax tilt & dynamic specular reflection card.
 * 100% transparent base allowing the background photographic architecture to remain
 * completely visible, while reacting dynamically to mouse proximity and movement.
 */
export function AppleGlassCard({ children, className = '', ...props }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates (-1 to 1) from card center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg vertical tilt
    const rotateY = ((x - centerX) / centerX) * 9;  // Max 9 deg horizontal tilt

    setCoords({ x, y });
    setRotate({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-white/25 transition-all duration-300 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${
          isHovered ? 1.025 : 1
        }, ${isHovered ? 1.025 : 1}, 1)`,
        transition: isHovered
          ? 'transform 0.08s ease-out, border-color 0.3s ease'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
        borderColor: isHovered ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.25)',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
      }}
      {...props}
    >
      {/* Specular Radial Light Sheen following the cursor position */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 overflow-hidden"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.18), transparent 75%)`,
        }}
      />

      {/* Dynamic Gold-Gleam Prismatic Edge Highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 overflow-hidden"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(245, 200, 76, 0.22), transparent 70%)`,
        }}
      />

      {/* Card Content with subtle 3D lift */}
      <div
        className="relative z-10 space-y-3.5"
        style={{
          transform: isHovered ? 'translateZ(18px)' : 'translateZ(0px)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}


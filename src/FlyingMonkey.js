import { useState, useEffect } from 'react';

// Flying Monkey component
const FlyingMonkey = ({ index, WICKED_GREEN, WICKED_PINK }) => {
  const [position, setPosition] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
  const [size] = useState(30 + Math.random() * 20); // Larger monkeys
  const [speed] = useState(0.3 + Math.random() * 0.7); // Slower movement
  const [direction, setDirection] = useState({ x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 });
  const [wingAngle, setWingAngle] = useState(0);
  const [wingDirection, setWingDirection] = useState(1);

  // Wing flapping animation
  useEffect(() => {
    const wingInterval = setInterval(() => {
      setWingAngle(prev => {
        const newAngle = prev + (1 * wingDirection);
        if (newAngle >= 15 || newAngle <= -15) {
          setWingDirection(prev => prev * -1);
        }
        return newAngle;
      });
    }, 50);
    
    return () => clearInterval(wingInterval);
  }, [wingDirection]);

  // Floating movement animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        // Add a slight floating effect
        const floatOffset = Math.sin(Date.now() / 1000) * 0.2;
        
        let newX = prev.x + speed * direction.x;
        let newY = prev.y + (speed * direction.y) + floatOffset;
        let newDirection = { ...direction };

        if (newX <= 0 || newX >= 98) {
          newDirection.x *= -1;
        }
        
        if (newY <= 0 || newY >= 98) {
          newDirection.y *= -1;
        }
        
        setDirection(newDirection);
        
        return { x: Math.max(0, Math.min(98, newX)), y: Math.max(0, Math.min(98, newY)) };
      });
    }, 150); // Slower update rate

    return () => clearInterval(interval);
  }, [direction, speed]);

  // Monkey color based on index
  const monkeyColor = index % 3 === 0 ? WICKED_GREEN : WICKED_PINK;
  
  // Monkey with face and wings
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 10,
        transition: 'all 0.3s ease-in-out', // Smoother transition
        transform: `scaleX(${direction.x})`,
        filter: 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.4))'
      }}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        {/* Left Wing */}
        <g transform={`translate(15, 50) rotate(${wingAngle})`}>
          <path 
            d="M0,0 C-20,-15 -30,-5 -40,-25 C-35,-10 -25,0 -15,10 C-5,15 0,10 0,0 Z" 
            fill={monkeyColor} 
            opacity="0.8"
          />
        </g>
        
        {/* Right Wing */}
        <g transform={`translate(105, 50) rotate(${-wingAngle})`}>
          <path 
            d="M0,0 C20,-15 30,-5 40,-25 C35,-10 25,0 15,10 C5,15 0,10 0,0 Z" 
            fill={monkeyColor} 
            opacity="0.8"
          />
        </g>
        
        {/* Monkey Body */}
        <ellipse cx="60" cy="60" rx="25" ry="30" fill={monkeyColor} />
        
        {/* Monkey Head */}
        <circle cx="60" cy="40" r="20" fill={monkeyColor} />
        
        {/* Eyes */}
        <circle cx="52" cy="35" r="4" fill="white" />
        <circle cx="68" cy="35" r="4" fill="white" />
        <circle cx="52" cy="35" r="2" fill="black" />
        <circle cx="68" cy="35" r="2" fill="black" />
        
        {/* Nose */}
        <ellipse cx="60" cy="42" rx="5" ry="3" fill={index % 2 === 0 ? "black" : "#333"} />
        
        {/* Mouth */}
        <path d="M50,48 C55,52 65,52 70,48" fill="none" stroke="black" strokeWidth="1.5" />
        
        {/* Ears */}
        <ellipse cx="40" cy="30" rx="8" ry="10" fill={monkeyColor} />
        <ellipse cx="80" cy="30" rx="8" ry="10" fill={monkeyColor} />
        
        {/* Tail */}
        <path 
          d="M60,90 C70,100 80,105 90,100 C95,97 97,90 95,85" 
          fill="none" 
          stroke={monkeyColor} 
          strokeWidth="5" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default FlyingMonkey;
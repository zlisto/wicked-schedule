import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Wicked theme colors
const WICKED_GREEN = '#4b9560';
const WICKED_PINK = '#ff97c7'; // Lighter pink color
const GOLD = '#ffd700';

// Flying Monkey component
const FlyingMonkey = ({ index }) => {
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

// Main component
const WickedSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Fixed timeslot headers with proper formatting
  const timeslots = [
    "April 22 (Tue) 2:40-4:00pm",
    "April 22 (Tue) 4:10-5:30pm",
    "April 24 (Thu) 2:40-4:00pm",
    "April 24 (Thu) 4:10-5:30pm",
    "April 29 (Tue) 2:40-4:00pm",
    "April 29 (Tue) 4:10-5:30pm",
    "May 1 (Thu) 2:40-4:00pm",
    "May 1 (Thu) 4:10-5:30pm"
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load schedule data
        const scheduleResponse = await fetch('/data/MGT 575 Final Project Schedule(Final Presentation Schedule).csv');
        const scheduleText = await scheduleResponse.text();
        const scheduleLines = scheduleText.split('\n');
        
        const headers = scheduleLines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
        
        // Parse schedule data
        const scheduleData = [];
        for (let i = 1; i < scheduleLines.length; i++) {
          if (scheduleLines[i].trim() !== '') {
            // Handle quoted values and simple commas
            const rowData = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let j = 0; j < scheduleLines[i].length; j++) {
              const char = scheduleLines[i][j];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                rowData.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            
            // Add the last value
            rowData.push(currentValue.trim());
            
            const rowObj = {};
            headers.forEach((header, index) => {
              let value = rowData[index] || '';
              // Remove quotes if present
              value = value.replace(/^"(.*)"$/, '$1').replace(/\r/g, '');
              rowObj[header] = value;
            });
            
            scheduleData.push(rowObj);
          }
        }
        
        // Organize by timeslot
        const structuredSchedule = {};
        timeslots.forEach(slot => {
          structuredSchedule[slot] = [];
          const cleanSlot = slot.replace(/\r/g, '');
          
          scheduleData.forEach(row => {
            if (row[cleanSlot] && row[cleanSlot].trim() !== '') {
              structuredSchedule[cleanSlot].push(row[cleanSlot]);
            }
          });
        });
        
        // Load roster data
        const rosterResponse = await fetch('/data/MGT 575 Final Project Schedule(Final Team Rosters).csv');
        const rosterText = await rosterResponse.text();
        const rosterLines = rosterText.split('\n');
        
        // Parse team members
        const membersMap = {};
        for (let i = 1; i < rosterLines.length; i++) {
          const line = rosterLines[i].trim();
          if (line === '') continue;
          
          let inQuotes = false;
          let commaPos = -1;
          
          for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') {
              inQuotes = !inQuotes;
            } else if (line[j] === ',' && !inQuotes) {
              commaPos = j;
              break;
            }
          }
          
          if (commaPos !== -1) {
            const team = line.substring(0, commaPos).trim();
            let members = line.substring(commaPos + 1).trim();
            
            // Remove surrounding quotes if present
            members = members.replace(/^"(.*)"$/, '$1');
            
            // Split members by commas, but not within quotes
            const membersList = [];
            let currentMember = '';
            inQuotes = false;
            
            for (let j = 0; j < members.length; j++) {
              const char = members[j];
              
              if (char === '"') {
                inQuotes = !inQuotes;
                currentMember += char;
              } else if (char === ',' && !inQuotes) {
                membersList.push(currentMember.trim());
                currentMember = '';
              } else {
                currentMember += char;
              }
            }
            
            // Add the last member
            if (currentMember.trim() !== '') {
              membersList.push(currentMember.trim());
            }
            
            membersMap[team] = membersList;
          }
        }
        
        setSchedule(structuredSchedule);
        setTeamMembers(membersMap);
        setLoading(false);
        
        console.log("Schedule data:", structuredSchedule);
        console.log("Team members:", membersMap);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load schedule data. Please try again.");
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle team hover
  const handleTeamHover = (team, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverInfo({
      team,
      members: teamMembers[team] || [],
      position: {
        x: rect.left,
        y: rect.bottom
      }
    });
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverInfo(null);
  };
  
  // Generate flying monkeys
  const monkeys = Array.from({ length: 100 }, (_, i) => (
    <FlyingMonkey key={i} index={i} />
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'black', color: 'white' }}>
        <div style={{ fontSize: '24px' }}>Loading Wicked Schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'black', color: 'white' }}>
        <div style={{ fontSize: '24px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${WICKED_PINK} 0%, black 50%, ${WICKED_GREEN} 100%)`,
      fontFamily: "'Playfair Display', serif"
    }}>
      {/* Flying monkeys */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {monkeys}
      </div>
      
      {/* Title */}
      <div style={{
        paddingTop: '32px',
        paddingBottom: '24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 20
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '8px',
          color: GOLD, 
          textShadow: `0 0 10px ${WICKED_GREEN}, 0 0 20px ${WICKED_PINK}`,
          fontFamily: "'Playfair Display', serif" 
        }}>
          MGT 575 Final Presentations
        </h1>
        <h2 style={{
          fontSize: '24px',
          color: 'white',
          fontStyle: 'italic'
        }}>
          Generative AI and Social Media | Yale SOM
        </h2>
      </div>
      
      {/* Schedule grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px',
        paddingBottom: '80px',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {timeslots.map((timeslot, index) => (
            <div key={index} style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '8px',
                marginBottom: '12px',
                textAlign: 'center',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                borderBottom: '2px solid white',
                backgroundColor: index % 2 === 0 ? WICKED_GREEN : WICKED_PINK,
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
              }}>
                {timeslot}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {schedule[timeslot] && schedule[timeslot].map((team, teamIdx) => (
                  <div 
                    key={teamIdx}
                    style={{ 
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      border: `2px solid ${teamIdx % 2 === 0 ? WICKED_PINK : WICKED_GREEN}`,
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: 'scale(1)',
                      ':hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onMouseEnter={(e) => handleTeamHover(team, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {team}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team members popup */}
      {hoverInfo && (
        <div 
          style={{ 
            position: 'fixed',
            zIndex: 30,
            top: `${hoverInfo.position.y}px`,
            left: `${hoverInfo.position.x}px`,
            backgroundColor: 'rgba(0,0,0,0.9)',
            border: `2px solid ${GOLD}`,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            padding: '12px',
            minWidth: '250px',
            maxWidth: '350px',
            transform: 'translateY(10px)'
          }}
        >
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h4 style={{ 
              fontWeight: 'bold',
              fontSize: '18px',
              color: GOLD
            }}>
              {hoverInfo.team}
            </h4>
            <div 
              onClick={() => setHoverInfo(null)}
              style={{
                cursor: 'pointer',
                color: 'white',
                ':hover': {
                  color: 'red'
                }
              }}
            >
              <X size={16} />
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid white',
            paddingTop: '8px'
          }}>
            <h5 style={{
              fontSize: '14px',
              marginBottom: '4px',
              color: 'white',
              fontWeight: '600'
            }}>
              Team Members:
            </h5>
            <ul style={{ color: 'white' }}>
              {hoverInfo.members.map((member, idx) => (
                <li key={idx} style={{
                  padding: '4px 0',
                  borderBottom: idx === hoverInfo.members.length - 1 ? 'none' : '1px solid rgba(128, 128, 128, 0.3)'
                }}>
                  {member}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '12px',
        textAlign: 'center',
        color: 'white',
        zIndex: 20
      }}>
        <p>Professor Tauhid Zaman | School of Management</p>
      </div>
    </div>
  );
};

export default WickedSchedule;
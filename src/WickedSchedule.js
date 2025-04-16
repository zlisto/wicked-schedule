import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FlyingMonkey from './FlyingMonkey';

// Wicked theme colors
const WICKED_GREEN = '#4b9560';
const WICKED_PINK = '#ff97c7'; // Lighter pink color
const GOLD = '#ffd700';

const getBasePath = () => {
  // In development, process.env.NODE_ENV is 'development'
  // In production, it's 'production'
  return process.env.NODE_ENV === 'development' 
    ? '' 
    : process.env.PUBLIC_URL;
};

// Helper function for console debugging
const debugLog = (message, data) => {
  console.log(`[DEBUG] ${message}:`, data);
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
        // Add debug messages to track what's happening
        const basePath = getBasePath();
        debugLog("Base path", basePath);

        const scheduleResponse = await fetch(`${process.env.PUBLIC_URL}/data/schedule.csv`);
        const rosterResponse = await fetch(`${process.env.PUBLIC_URL}/data/roster.csv`);
        

        if (!scheduleResponse.ok) {
          throw new Error(`Failed to fetch schedule: ${scheduleResponse.status}`);
        }
        if (!rosterResponse) {
          throw new Error("Could not find roster file at any of the tried paths");
        }

        
        const scheduleText = await scheduleResponse.text();
        debugLog("Schedule text first 100 chars", scheduleText.substring(0, 1000));
        const rosterText = await rosterResponse.text();
        debugLog("Roster text first 100 chars", rosterText.substring(0, 100));

        const scheduleLines = scheduleText.split('\n');
        
        const headers = scheduleLines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
        debugLog("Schedule headers", headers);
        
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
        
        debugLog("Structured schedule", structuredSchedule);
        
       
        

        

        
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
        
        debugLog("Team members map", membersMap);
        
        setSchedule(structuredSchedule);
        setTeamMembers(membersMap);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Failed to load schedule data: ${err.message}`);
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
    <FlyingMonkey 
      key={i} 
      index={i} 
      WICKED_GREEN={WICKED_GREEN} 
      WICKED_PINK={WICKED_PINK} 
    />
  ));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: 'black', 
        color: 'white' 
      }}>
        <div style={{ fontSize: '24px' }}>Loading Wicked Schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: 'black', 
        color: 'white',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{ fontSize: '24px', color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
        <div style={{ fontSize: '16px', color: 'white', textAlign: 'center' }}>
          Check if your CSV files are correctly named and placed in the public/data folder.
          <br />
          Try to refresh the page or check the console for more details.
        </div>
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
                {schedule[timeslot] && schedule[timeslot].length > 0 ? (
                  schedule[timeslot].map((team, teamIdx) => (
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
                      }}
                      onMouseEnter={(e) => handleTeamHover(team, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {team}
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '12px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontStyle: 'italic'
                  }}>
                    No teams scheduled
                  </div>
                )}
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
                color: 'white'
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
            {hoverInfo.members && hoverInfo.members.length > 0 ? (
              <ul style={{ 
                color: 'white',
                margin: 0,
                padding: '0 0 0 10px'
              }}>
                {hoverInfo.members.map((member, idx) => (
                  <li key={idx} style={{
                    padding: '4px 0',
                    borderBottom: idx === hoverInfo.members.length - 1 ? 'none' : '1px solid rgba(128, 128, 128, 0.3)'
                  }}>
                    {member}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                No team members found
              </div>
            )}
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
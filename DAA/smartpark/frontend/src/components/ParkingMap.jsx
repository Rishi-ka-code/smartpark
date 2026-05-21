import { useState, useRef, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlotTooltip from './SlotTooltip';
import { ParkingContext } from '../context/ParkingContext';

const ENTRY_GATES = {
  A: { x: 65, y: 65 },
  B: { x: 565, y: 65 },
  C: { x: 65, y: 465 },
  D: { x: 565, y: 465 }
};

const ParkingMap = ({ highlightedSlotId, routeWaypoints }) => {
  const { slots, selectedZone, presentationMode } = useContext(ParkingContext);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [animatedPathLength, setAnimatedPathLength] = useState(0);
  const pathRef = useRef(null);
  const mapRef = useRef(null);

  // Animate SVG path when route changes
  useEffect(() => {
    if (pathRef.current && routeWaypoints && routeWaypoints.length > 1) {
      const totalLen = pathRef.current.getTotalLength();
      setAnimatedPathLength(totalLen);
    }
  }, [routeWaypoints]);

  const handleMouseMove = (e, slot) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredSlot(slot);
  };

  const handleMouseLeave = () => {
    setHoveredSlot(null);
  };

  const getSlotColor = (status, isHighlighted) => {
    if (isHighlighted) return '#3b82f6';
    switch (status) {
      case 'available': return '#14b8a6';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#eab308';
      default: return '#374151';
    }
  };

  const getZoneViewBox = () => {
    switch(selectedZone) {
      case 'A': return "50 50 500 400";
      case 'B': return "550 50 500 400";
      case 'C': return "50 450 500 400";
      case 'D': return "550 450 500 400";
      default: return "50 50 500 400";
    }
  };

  // Build SVG path string from waypoints
  const buildPathString = () => {
    if (!routeWaypoints || routeWaypoints.length < 2) return '';
    return routeWaypoints.map((wp, i) => `${i === 0 ? 'M' : 'L'} ${wp.x} ${wp.y}`).join(' ');
  };

  const entryGate = ENTRY_GATES[selectedZone] || ENTRY_GATES['A'];

  return (
    <div className="relative w-full h-full bg-dark-900 rounded-2xl overflow-hidden border border-white/5 flex flex-col">
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10 glass-card px-4 py-2 rounded-lg flex space-x-4 text-xs font-medium">
        <div className="flex items-center"><div className="w-3 h-3 bg-brand-500 rounded-sm mr-2 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div> Available</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div> Occupied</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div> Reserved</div>
        {presentationMode && routeWaypoints && (
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-sm mr-2 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> Route</div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <div className="glass-card px-4 py-2 rounded-lg text-sm font-bold text-brand-400">
          Zone {selectedZone} Map
        </div>
        {/* Live indicator */}
        <div className="glass-card px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Presentation Mode Route Explanation */}
      {presentationMode && routeWaypoints && routeWaypoints.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-10 glass-card px-5 py-4 rounded-xl border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M3 12h18M13 5l7 7-7 7"/></svg>
            </div>
            <div>
              <p className="text-blue-400 text-sm font-bold">Optimal Route Calculated</p>
              <p className="text-gray-400 text-xs">Nearest valid path selected using current availability</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300 mt-2 flex-wrap">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">GATE {selectedZone}</span>
            {routeWaypoints.slice(1, -1).map((_, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-gray-600">→</span>
                <span className="bg-dark-700 px-2 py-1 rounded text-gray-400">Node {i + 1}</span>
              </span>
            ))}
            <span className="text-gray-600">→</span>
            <span className="bg-brand-500/20 text-brand-400 px-2 py-1 rounded font-bold">TARGET SLOT</span>
          </div>
        </motion.div>
      )}

      <div 
        ref={mapRef}
        className="flex-1 w-full h-full cursor-crosshair overflow-hidden relative"
      >
        <svg 
          className="w-full h-full absolute inset-0"
          viewBox={getZoneViewBox()}
          preserveAspectRatio="xMidYMid meet"
          style={{ transition: 'all 0.5s ease-in-out' }}
        >
          {/* Base Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="routeGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="2000" height="2000" fill="url(#grid)" />

          {/* Render road paths for the selected zone area */}
          {selectedZone === 'A' && (
             <path d="M 80 80 L 480 80 L 480 400" fill="none" stroke="#2d2d3d" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {selectedZone === 'B' && (
             <path d="M 580 80 L 980 80 L 980 400" fill="none" stroke="#2d2d3d" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {selectedZone === 'C' && (
             <path d="M 80 480 L 480 480 L 480 800" fill="none" stroke="#2d2d3d" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {selectedZone === 'D' && (
             <path d="M 580 480 L 980 480 L 980 800" fill="none" stroke="#2d2d3d" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Animated Route Path (Presentation Mode) */}
          {presentationMode && routeWaypoints && routeWaypoints.length > 1 && (
            <>
              {/* Shadow/glow path */}
              <path
                d={buildPathString()}
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
              />
              {/* Animated main path */}
              <motion.path
                ref={pathRef}
                d={buildPathString()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={animatedPathLength || 1000}
                initial={{ strokeDashoffset: animatedPathLength || 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Start marker (gate) */}
              <circle cx={routeWaypoints[0].x} cy={routeWaypoints[0].y} r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
              <text x={routeWaypoints[0].x} y={routeWaypoints[0].y - 14} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">ENTRY</text>
              {/* End marker (slot) */}
              <motion.circle
                cx={routeWaypoints[routeWaypoints.length - 1].x + 12}
                cy={routeWaypoints[routeWaypoints.length - 1].y + 22}
                r="12"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </>
          )}

          {/* Render Slots */}
          <AnimatePresence>
            {slots.map(slot => {
              const isHighlighted = highlightedSlotId === slot._id;
              const color = getSlotColor(slot.status, isHighlighted);
              
              return (
                <motion.g 
                  key={slot._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <rect
                    x={slot.coordinates.x}
                    y={slot.coordinates.y}
                    width="25"
                    height="45"
                    rx="3"
                    fill={color}
                    fillOpacity={slot.status === 'available' ? 0.9 : 0.6}
                    stroke={slot.status === 'available' ? 'rgba(255,255,255,0.2)' : 'transparent'}
                    strokeWidth="1"
                    filter={isHighlighted || slot.status === 'available' ? 'url(#glow)' : ''}
                    onMouseMove={(e) => handleMouseMove(e, slot)}
                    onMouseLeave={handleMouseLeave}
                    className="transition-colors duration-300"
                    style={{ cursor: 'pointer' }}
                  />
                  <text 
                    x={slot.coordinates.x + 12.5} 
                    y={slot.coordinates.y + 25} 
                    fill="rgba(255,255,255,0.3)" 
                    fontSize="8" 
                    textAnchor="middle"
                    className="pointer-events-none"
                    transform={`rotate(-90 ${slot.coordinates.x + 12.5} ${slot.coordinates.y + 25})`}
                  >
                    {slot.slotNumber.slice(-2)}
                  </text>
                  
                  {isHighlighted && (
                    <motion.circle
                      cx={slot.coordinates.x + 12.5}
                      cy={slot.coordinates.y + 22.5}
                      r="20"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="pointer-events-none"
                    />
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Entry Gate Indicator */}
          {selectedZone === 'A' && <text x="70" y="70" fill="white" fontSize="14" fontWeight="bold">GATE A</text>}
          {selectedZone === 'B' && <text x="570" y="70" fill="white" fontSize="14" fontWeight="bold">GATE B</text>}
          {selectedZone === 'C' && <text x="70" y="470" fill="white" fontSize="14" fontWeight="bold">GATE C</text>}
          {selectedZone === 'D' && <text x="570" y="470" fill="white" fontSize="14" fontWeight="bold">GATE D</text>}
        </svg>
      </div>

      <AnimatePresence>
        <SlotTooltip 
          x={tooltipPos.x} 
          y={tooltipPos.y} 
          slot={hoveredSlot} 
          visible={!!hoveredSlot} 
        />
      </AnimatePresence>
    </div>
  );
};

export default ParkingMap;

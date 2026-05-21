import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import ParkingMap from '../components/ParkingMap';
import StatsBar from '../components/StatsBar';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { ParkingContext } from '../context/ParkingContext';
import { BookingContext } from '../context/BookingContext';
import { AuthContext } from '../context/AuthContext';
import { Clock, MapPin, CheckCircle, Navigation, Eye, EyeOff } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { 
    selectedZone, setSelectedZone, liveStats, loading: mapLoading,
    getRecommendation, recommendedSlot, setRecommendedSlot,
    presentationMode, setPresentationMode
  } = useContext(ParkingContext);
  const { activeBooking, reserveSlot, completeBooking, cancelBooking, loading: bookingLoading } = useContext(BookingContext);

  const [activeTab, setActiveTab] = useState('find');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [isFinding, setIsFinding] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);

  // Time selection for booking
  const [durationMinutes, setDurationMinutes] = useState(60); // default 1 hour

  // Switch to booking tab automatically if active booking exists
  useEffect(() => {
    if (activeBooking) {
      setActiveTab('booking');
      if (activeBooking.slot?.zone) {
        setSelectedZone(activeBooking.slot.zone);
      }
    }
  }, [activeBooking, setSelectedZone]);

  // Update elapsed time and remaining time for active booking
  useEffect(() => {
    if (!activeBooking) {
      setElapsedTime(0);
      setRemainingTime(null);
      return;
    }
    
    const update = () => {
      const now = new Date();
      const entry = new Date(activeBooking.entryTime);
      const diffMins = Math.floor((now - entry) / 60000);
      setElapsedTime(Math.max(0, diffMins));

      if (activeBooking.expectedEndTime) {
        const end = new Date(activeBooking.expectedEndTime);
        const remMins = Math.max(0, Math.ceil((end - now) / 60000));
        setRemainingTime(remMins);
      }
    };

    update();
    const interval = setInterval(update, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [activeBooking]);

  const handleFindSpot = async () => {
    setIsFinding(true);
    setRecommendedSlot(null);
    await getRecommendation(selectedZone, null);
    setIsFinding(false);
  };

  const handleReserve = async () => {
    if (!recommendedSlot) return;
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

    const success = await reserveSlot(recommendedSlot.slot._id, vehicleNumber, startTime, endTime);
    if (success) {
      setRecommendedSlot(null);
    }
  };

  const zones = ['A', 'B', 'C', 'D'];

  // Route waypoints for map (only in presentation mode)
  const routeWaypoints = presentationMode && recommendedSlot?.route?.waypoints 
    ? recommendedSlot.route.waypoints 
    : null;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 flex pt-20 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full gap-6 pb-6 h-[calc(100vh-80px)]">
        
        {/* Left: Map Area (70%) */}
        <div className="hidden lg:flex flex-col flex-[7] h-full relative">
          <ParkingMap 
            highlightedSlotId={recommendedSlot?.slot?._id || activeBooking?.slot?._id} 
            routeWaypoints={routeWaypoints}
          />
        </div>

        {/* Right: Side Panel (30%) */}
        <div className="flex-[3] flex flex-col h-full w-full lg:max-w-md bg-dark-800 rounded-2xl border border-white/5 overflow-hidden shadow-2xl z-10 relative">
          
          {/* Tabs + Presentation Toggle */}
          <div className="flex items-center border-b border-white/5 bg-dark-900/50 backdrop-blur-md">
            <div className="flex flex-1 p-2">
              {[
                { id: 'find', label: 'Find Spot' },
                { id: 'booking', label: 'My Booking', badge: !!activeBooking },
                { id: 'stats', label: 'Live Stats' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative transition-colors ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-dark-700 rounded-lg -z-10" />
                  )}
                </button>
              ))}
            </div>
            {/* Presentation Mode Toggle */}
            <button
              onClick={() => setPresentationMode(!presentationMode)}
              className={`mx-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-2 ${
                presentationMode ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
              title={presentationMode ? 'Disable Presentation Mode' : 'Enable Presentation Mode'}
            >
              {presentationMode ? <Eye size={14} /> : <EyeOff size={14} />}
              PRESENTATION: {presentationMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* TAB: FIND PARKING */}
              {activeTab === 'find' && (
                <motion.div
                  key="find"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {activeBooking ? (
                     <div className="glass-card p-6 text-center border-brand-500/30">
                       <CheckCircle className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                       <h3 className="text-xl font-bold mb-2">You have an active booking</h3>
                       <p className="text-gray-400 mb-6 text-sm">Please complete or cancel your current booking before finding a new spot.</p>
                       <button onClick={() => setActiveTab('booking')} className="w-full bg-dark-700 hover:bg-dark-600 py-2 rounded-lg transition-colors">
                         View Booking
                       </button>
                     </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-xl font-bold mb-4">Search Options</h2>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target Zone</label>
                            <div className="grid grid-cols-4 gap-2">
                              {zones.map(z => (
                                <button
                                  key={z}
                                  onClick={() => setSelectedZone(z)}
                                  className={`py-2 rounded-lg font-bold border transition-all ${
                                    selectedZone === z 
                                      ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                                      : 'bg-dark-900 border-white/5 text-gray-400 hover:bg-dark-700'
                                  }`}
                                >
                                  {z}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Vehicle Plate</label>
                            <input 
                              type="text" 
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              placeholder="ABC-1234"
                              className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 transition-colors uppercase"
                            />
                          </div>

                          {/* Duration Selector */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Parking Duration</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { label: '30m', value: 30 },
                                { label: '1h', value: 60 },
                                { label: '2h', value: 120 },
                                { label: '4h', value: 240 },
                              ].map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => setDurationMinutes(opt.value)}
                                  className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                    durationMinutes === opt.value 
                                      ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                                      : 'bg-dark-900 border-white/5 text-gray-400 hover:bg-dark-700'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Reservation expires automatically after {durationMinutes} minutes.
                            </p>
                          </div>

                          <button 
                            onClick={handleFindSpot}
                            disabled={isFinding}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold py-3 rounded-xl transition-transform active:scale-95 disabled:opacity-50 mt-2"
                          >
                            {isFinding ? 'Searching...' : 'Find Best Spot'}
                          </button>
                        </div>
                      </div>

                      {/* Display recommendation result */}
                      <div className="mt-8">
                        {isFinding ? (
                           <LoadingSkeleton type="card" />
                        ) : recommendedSlot ? (
                           <RecommendationCard 
                             recommendation={recommendedSlot} 
                             onReserve={handleReserve}
                             isLoading={bookingLoading}
                           />
                        ) : null}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* TAB: MY BOOKING */}
              {activeTab === 'booking' && (
                <motion.div
                  key="booking"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {!activeBooking ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">No Active Booking</h3>
                      <p className="text-gray-400 mb-6 text-sm">Find and reserve a spot to see it here.</p>
                      <button onClick={() => setActiveTab('find')} className="text-brand-400 font-medium hover:text-brand-300">
                        Find a spot →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="glass-card rounded-2xl p-6 border-brand-500/50 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-brand-400 text-sm font-medium mb-1">Current Reservation</p>
                            <h2 className="text-4xl font-black text-white">{activeBooking.slot?.slotNumber || 'N/A'}</h2>
                          </div>
                          <div className="bg-dark-900 px-4 py-2 rounded-xl text-center border border-white/5">
                            <p className="text-xs text-gray-400 mb-1">Zone</p>
                            <p className="text-xl font-bold">{activeBooking.slot?.zone || '?'}</p>
                          </div>
                        </div>

                        <div className="bg-dark-900 rounded-xl p-4 space-y-3 mb-6 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm flex items-center gap-2"><Navigation size={16}/> Status</span>
                            <span className="text-brand-400 font-medium text-sm flex items-center gap-2">
                              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-brand-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-brand-500"></span></span>
                              Active
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm flex items-center gap-2"><Clock size={16}/> Elapsed</span>
                            <span className="text-white font-medium text-sm">{elapsedTime} mins</span>
                          </div>
                          {remainingTime !== null && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm flex items-center gap-2">⏰ Remaining</span>
                              <span className={`font-medium text-sm ${remainingTime <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                                {remainingTime} mins
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm flex items-center gap-2">Plate</span>
                            <span className="text-white font-medium text-sm">{activeBooking.vehicleNumber || 'N/A'}</span>
                          </div>
                          {activeBooking.expectedEndTime && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm flex items-center gap-2">Expires At</span>
                              <span className="text-gray-300 font-medium text-sm">
                                {new Date(activeBooking.expectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remaining time progress bar */}
                        {activeBooking.expectedEndTime && activeBooking.expectedStartTime && (
                          <div className="mb-4">
                            <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/5">
                              <motion.div
                                className={`h-2 rounded-full ${remainingTime <= 5 ? 'bg-red-500' : 'bg-brand-500'}`}
                                initial={{ width: '100%' }}
                                animate={{ 
                                  width: `${Math.max(0, (remainingTime / ((new Date(activeBooking.expectedEndTime) - new Date(activeBooking.expectedStartTime)) / 60000)) * 100)}%` 
                                }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => completeBooking(activeBooking._id)}
                            disabled={bookingLoading}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                          >
                            Complete Parking
                          </button>
                          <button 
                            onClick={() => cancelBooking(activeBooking._id)}
                            disabled={bookingLoading}
                            className="w-full bg-dark-900 hover:bg-red-500/20 text-gray-300 hover:text-red-400 font-medium py-3 rounded-xl transition-colors border border-white/5"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: LIVE STATS */}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl font-bold mb-6">Facility Status</h2>
                  
                  {liveStats ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-4 glass-card rounded-xl">
                          <p className="text-3xl font-black text-brand-400">{liveStats.totalAvailable ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">Available</p>
                        </div>
                        <div className="text-center p-4 glass-card rounded-xl">
                          <p className="text-3xl font-black text-red-400">{liveStats.totalOccupied ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">Occupied</p>
                        </div>
                        <div className="text-center p-4 glass-card rounded-xl">
                          <p className="text-3xl font-black text-yellow-400">{liveStats.totalReserved ?? '—'}</p>
                          <p className="text-xs text-gray-400 mt-1">Reserved</p>
                        </div>
                      </div>

                      <div className="text-center p-6 glass-card rounded-2xl border-white/5 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
                         <h3 className="text-gray-400 text-sm mb-2 relative z-10">Overall Occupancy</h3>
                         <div className="text-5xl font-black text-white relative z-10 mb-2">{liveStats.overall}%</div>
                         <p className="text-brand-400 text-sm relative z-10">{liveStats.totalAvailable} spots open</p>
                      </div>

                      <div>
                        <h3 className="text-gray-400 text-sm mb-4 uppercase tracking-wider font-semibold">Zones</h3>
                        {zones.map(z => {
                          const zoneData = liveStats.zones?.[z];
                          if (!zoneData) return null;
                          return (
                            <StatsBar 
                              key={z} 
                              label={`Zone ${z}`} 
                              available={zoneData.available} 
                              total={zoneData.total} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <LoadingSkeleton type="text" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, DollarSign, Activity, Trash2, Plus } from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, slots, bookings
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick implementation for demo
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/analytics');
        setStats(res.data);
      } else if (activeTab === 'slots') {
        const res = await api.get('/parking/slots');
        setSlots(res.data);
      } else if (activeTab === 'bookings') {
        const res = await api.get('/admin/bookings');
        setBookings(res.data.data); // Assuming pagination structure { data: [...] }
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const updateSlotStatus = async (id, status) => {
    try {
      await api.put(`/parking/slot-status/${id}`, { status });
      toast.success('Status updated');
      fetchData(); // Refresh
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage the parking facility.</p>
          </div>
          
          <div className="flex bg-dark-800 p-1 rounded-xl mt-4 md:mt-0 border border-white/5">
            {['analytics', 'slots', 'bookings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-dark-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border-brand-500/30">
                <div className="flex items-center gap-3 text-brand-400 mb-2"><Activity size={20} /> Occupancy</div>
                <div className="text-4xl font-bold text-white">{stats.occupancyRate}%</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-blue-400 mb-2"><Users size={20} /> Active</div>
                <div className="text-4xl font-bold text-white">{stats.activeBookings}</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 text-green-400 mb-2"><CheckCircle size={20} /> Completed Today</div>
                <div className="text-4xl font-bold text-white">{stats.completedToday}</div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-yellow-500/30">
                <div className="flex items-center gap-3 text-yellow-400 mb-2"><DollarSign size={20} /> Revenue (All time)</div>
                <div className="text-4xl font-bold text-white">${stats.totalRevenue}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="font-bold text-lg">Slot Management</h2>
              <button className="bg-brand-500 text-dark-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-brand-600 transition-colors">
                 <Plus size={16} /> Add Slot
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-900 border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">Slot No.</th>
                    <th className="p-4 font-medium">Zone</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {slots.slice(0, 50).map(slot => ( // Limiting render for performance demo
                    <tr key={slot._id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="p-4 font-medium">{slot.slotNumber}</td>
                      <td className="p-4 text-gray-400">{slot.zone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slot.status === 'available' ? 'bg-brand-500/20 text-brand-400' :
                          slot.status === 'occupied' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select 
                          className="bg-dark-900 border border-white/10 rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:border-brand-500 text-gray-300"
                          value={slot.status}
                          onChange={(e) => updateSlotStatus(slot._id, e.target.value)}
                        >
                          <option value="available">Make Available</option>
                          <option value="occupied">Set Occupied</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-center text-sm text-gray-500 bg-dark-900/50">Showing first 50 slots for performance.</div>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick helper
function CheckCircle({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}

export default AdminPage;

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 glass border-b border-white/10 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-2 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
              <span className="text-dark-900 font-bold text-xl">P</span>
            </div>
            <span className="text-white text-xl font-bold tracking-wider">SMART<span className="text-brand-400">PARK</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">How it works</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 px-4 py-2 rounded-full border border-white/10 transition-colors">
                    <User className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-dark-800 rounded-xl shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/history" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-700">My Bookings</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-700">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  Log in
                </Link>
                <Link to="/signup" className="bg-brand-500 hover:bg-brand-600 text-dark-950 px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-dark-900 border-b border-white/10 px-4 pt-2 pb-4 space-y-1"
        >
          <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-800 rounded-md">How it works</a>
          <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-800 rounded-md">Features</a>
          
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-brand-400">Dashboard</Link>
              <Link to="/history" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-dark-800 rounded-md">My Bookings</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-dark-800 rounded-md">Logout</button>
            </>
          ) : (
            <div className="mt-4 grid gap-2">
              <Link to="/login" className="w-full text-center border border-gray-600 text-gray-300 px-4 py-2 rounded-md font-medium">Log in</Link>
              <Link to="/signup" className="w-full text-center bg-brand-500 text-dark-950 px-4 py-2 rounded-md font-bold">Get Started</Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;

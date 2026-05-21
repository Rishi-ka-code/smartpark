import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AnimatedCounter from '../components/AnimatedCounter';
import { Search, Zap, Calendar, Navigation, Star, MapPin, Clock } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Find parking <br/>
              <span className="text-gradient">before you arrive.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg">
              Smart navigation and real-time parking availability for malls, airports, universities, and smart cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/signup" className="bg-brand-500 hover:bg-brand-600 text-dark-950 px-8 py-4 rounded-full font-bold text-center text-lg transition-transform transform hover:scale-105 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                Find Parking →
              </Link>
              <a href="#how-it-works" className="bg-dark-800 hover:bg-dark-700 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-center text-lg transition-colors">
                Learn More
              </a>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white"><AnimatedCounter to={200} />+</p>
                <p className="text-sm text-gray-400">Smart Slots</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white"><AnimatedCounter to={98} />%</p>
                <p className="text-sm text-gray-400">Time Saved</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] w-full hidden lg:block"
          >
            {/* Abstract Map Visualization */}
            <div className="absolute inset-0 glass-card rounded-2xl overflow-hidden border border-white/10 p-6 flex flex-col relative z-10 bg-dark-800/40">
              <div className="flex justify-between items-center mb-6">
                 <div className="h-4 w-32 bg-dark-700 rounded"></div>
                 <div className="h-6 w-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-xs font-bold">LIVE</div>
              </div>
              <div className="flex-1 relative border border-white/5 rounded-xl bg-dark-900/50 p-4 overflow-hidden">
                {/* SVG Mini Map */}
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                  <path d="M20 100 L180 100" stroke="#2d2d3d" strokeWidth="20" strokeLinecap="round" />
                  <path d="M100 20 L100 180" stroke="#2d2d3d" strokeWidth="20" strokeLinecap="round" />
                  
                  {/* Slots */}
                  {[
                    {x:30,y:40, c:'#14b8a6'}, {x:50,y:40, c:'#ef4444'}, {x:70,y:40, c:'#14b8a6'},
                    {x:130,y:40, c:'#ef4444'}, {x:150,y:40, c:'#14b8a6'}, {x:170,y:40, c:'#eab308'},
                    {x:30,y:140, c:'#14b8a6'}, {x:50,y:140, c:'#14b8a6'}, {x:70,y:140, c:'#ef4444'},
                    {x:130,y:140, c:'#eab308'}, {x:150,y:140, c:'#14b8a6'}, {x:170,y:140, c:'#14b8a6'},
                  ].map((s, i) => (
                    <motion.rect 
                      key={i} x={s.x} y={s.y} width="12" height="20" rx="2" fill={s.c}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2 + Math.random()*2, repeat: Infinity }}
                    />
                  ))}

                  {/* Pulsing Highlight */}
                  <motion.circle 
                    cx="156" cy="50" r="15" fill="none" stroke="#14b8a6" strokeWidth="2"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </svg>
              </div>
            </div>
            
            {/* Background glowing orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px] z-0"></div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A seamless experience from searching to parking.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-dark-600 -translate-y-1/2 z-0"></div>
            
            {[
              { icon: Search, title: 'Search', desc: 'Find parking near your destination instantly.' },
              { icon: Zap, title: 'Smart Match', desc: 'AI recommends the best available spot.' },
              { icon: Calendar, title: 'Reserve', desc: 'Book your slot with one click.' },
              { icon: Navigation, title: 'Navigate', desc: 'Get walking directions directly to your slot.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-dark-900 border-2 border-brand-500 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                  <step.icon className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features built for scale</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Large Card */}
          <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-2xl font-bold mb-2 relative z-10">Real-time Availability</h3>
            <p className="text-gray-400 max-w-sm mb-6 relative z-10">Live updates using WebSockets ensure you never book an occupied slot.</p>
            <div className="w-full bg-dark-900 rounded-lg p-4 border border-white/5 mt-auto relative z-10">
               <div className="flex justify-between text-sm mb-2"><span className="text-brand-400 font-medium">Zone A</span><span className="text-gray-400">42/50 Available</span></div>
               <div className="h-2 bg-dark-700 rounded-full overflow-hidden"><div className="h-full bg-brand-500 w-[84%]"></div></div>
            </div>
          </div>
          
          {/* Medium */}
          <div className="glass-card rounded-3xl p-8 flex flex-col group hover:border-brand-500/50 transition-colors relative overflow-hidden">
             <div className="absolute -right-4 -top-4 text-brand-500/10 group-hover:text-brand-500/20 transition-colors"><Zap size={120} /></div>
             <h3 className="text-xl font-bold mb-2 relative z-10">Smart Recommendations</h3>
             <p className="text-gray-400 text-sm relative z-10">Distance, congestion, and preferences analyzed instantly.</p>
          </div>

          <div className="glass-card rounded-3xl p-8 flex flex-col group hover:border-brand-500/50 transition-colors relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 text-brand-500/10 group-hover:text-brand-500/20 transition-colors"><Calendar size={120} /></div>
             <h3 className="text-xl font-bold mb-2 relative z-10">Instant Reservations</h3>
             <p className="text-gray-400 text-sm relative z-10">Secure your spot before you arrive.</p>
          </div>

          <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group hover:border-brand-500/50 transition-colors flex flex-col justify-center">
             <div className="flex items-center gap-6 relative z-10">
               <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                 <Navigation className="w-8 h-8 text-brand-400" />
               </div>
               <div>
                 <h3 className="text-2xl font-bold mb-2">Walking Navigation</h3>
                 <p className="text-gray-400">Get optimal walking routes from the entry gate straight to your reserved parking spot.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-20 bg-brand-900/30 border-y border-brand-500/20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p className="text-5xl font-bold text-brand-400 mb-2"><AnimatedCounter to={152} /></p>
                  <p className="text-lg text-gray-300">Available Slots Now</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                  <p className="text-5xl font-bold text-white mb-2"><AnimatedCounter to={38} /></p>
                  <p className="text-lg text-gray-300">Occupied</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                  <p className="text-5xl font-bold text-yellow-500 mb-2"><AnimatedCounter to={15} /></p>
                  <p className="text-lg text-gray-300">Reserved</p>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by drivers</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah Jenkins", role: "Daily Commuter", quote: "No more circling the lot for 20 minutes. I just reserve my spot and walk right in." },
            { name: "Marcus Chen", role: "Mall Manager", quote: "SmartPark transformed our parking operations. The analytics are incredible." },
            { name: "Elena Rodriguez", role: "Student", quote: "The walking navigation is a lifesaver when you're late for class in a massive university lot." }
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 rounded-2xl">
               <div className="flex gap-1 mb-4 text-brand-400">
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
                 <Star size={16} fill="currentColor" />
               </div>
               <p className="text-gray-300 mb-6 font-medium leading-relaxed">"{t.quote}"</p>
               <div>
                 <p className="font-bold text-white">{t.name}</p>
                 <p className="text-sm text-gray-500">{t.role}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <span className="text-white text-xl font-bold tracking-wider">SMART<span className="text-brand-400">PARK</span></span>
              </div>
              <p className="text-gray-500 text-sm">Built for smart cities.</p>
            </div>
            <div className="flex space-x-6">
               <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
               <a href="#" className="text-gray-500 hover:text-white transition-colors">GitHub</a>
               <a href="#" className="text-gray-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} SmartPark. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { motion } from 'framer-motion';
import { User, LayoutGrid, Sparkles, Network, Database, Mail, Monitor } from 'lucide-react';

export const IntelligenceGraph = () => {
    return (
        <div className="w-full h-[600px] bg-black rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center perspective-[1200px]">
            {/* Background subtle glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />

            {/* Isometric Container */}
            <div className="relative w-[600px] h-[600px] transform-style-3d rotate-x-[60deg] rotate-z-[-45deg] scale-90">
                
                {/* Layer 3: Build Experience (Top) */}
                <motion.div 
                    initial={{ translateZ: 0, opacity: 0 }}
                    animate={{ translateZ: 200, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Plane */}
                    <div className="absolute w-[400px] h-[400px] border border-white/20 bg-black/40 backdrop-blur-sm" />
                    
                    {/* Center Pill */}
                    <div className="absolute w-[180px] h-[60px] rounded-full bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_30px_rgba(0,0,0,0.5)]">
                        <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">Build Experience</span>
                    </div>

                    {/* Nodes */}
                    <GraphNode x={-120} y={-120} icon={User} />
                    <GraphNode x={120} y={-120} icon={LayoutGrid} />
                    <GraphNode x={-120} y={120} icon={Sparkles} />
                    <GraphNode x={120} y={120} icon={Network} />

                    {/* API Node */}
                    <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/80 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white tracking-widest">API</span>
                    </div>
                </motion.div>

                {/* Layer 2: Process Intelligence Graph (Middle) */}
                <motion.div 
                    initial={{ translateZ: 0, opacity: 0 }}
                    animate={{ translateZ: 100, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Plane */}
                    <div className="absolute w-[450px] h-[450px] border border-white/20 bg-black/40 backdrop-blur-sm" />
                    
                    {/* Large Glass Circle */}
                    <div className="absolute w-[300px] h-[300px] rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                        {/* Iridescent edge effect */}
                        <div className="absolute inset-0 rounded-full border-[2px] border-transparent bg-gradient-to-br from-indigo-500/30 via-purple-500/10 to-amber-500/30 [mask-image:linear-gradient(white,white)] [mask-composite:exclude]" style={{ WebkitMaskComposite: "xor" }} />
                        
                        <div className="w-[200px] h-[40px] rounded-full bg-black/80 border border-white/20 flex items-center justify-center z-10">
                            <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">Process Intelligence Graph</span>
                        </div>
                    </div>

                    {/* API Node */}
                    <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/80 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white tracking-widest">API</span>
                    </div>
                </motion.div>

                {/* Layer 1: Data Core (Bottom) */}
                <motion.div 
                    initial={{ translateZ: 0, opacity: 0 }}
                    animate={{ translateZ: 0, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* Plane */}
                    <div className="absolute w-[500px] h-[500px] border border-white/20 bg-black/40 backdrop-blur-sm" />
                    
                    {/* Grid Core */}
                    <div className="absolute w-[240px] h-[240px] bg-black/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center p-2">
                        <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-2">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <div key={i} className="rounded-full bg-white/5 border border-white/10" />
                            ))}
                        </div>
                        <div className="absolute w-[120px] h-[40px] rounded-full bg-black/90 border border-white/20 flex items-center justify-center z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                            <span className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">Data Core</span>
                        </div>
                    </div>

                    {/* Square Nodes */}
                    <SquareNode x={-180} y={-180} icon={Database} />
                    <SquareNode x={180} y={-180} icon={Monitor} />
                    <SquareNode x={-180} y={180} icon={Mail} />
                    <SquareNode x={180} y={180} icon={Network} />

                    {/* API Node */}
                    <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/80 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white tracking-widest">API</span>
                    </div>
                </motion.div>

                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'translateZ(100px)' }}>
                    {/* Add some subtle dashed lines connecting layers if needed */}
                </svg>

            </div>
        </div>
    );
};

const GraphNode = ({ x, y, icon: Icon }: { x: number, y: number, icon: any }) => (
    <div 
        className="absolute w-16 h-16 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)]"
        style={{ transform: `translate(${x}px, ${y}px)` }}
    >
        <Icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
    </div>
);

const SquareNode = ({ x, y, icon: Icon }: { x: number, y: number, icon: any }) => (
    <div 
        className="absolute w-20 h-20 rounded-2xl bg-black/80 border border-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)]"
        style={{ transform: `translate(${x}px, ${y}px)` }}
    >
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white/70" strokeWidth={1.5} />
        </div>
    </div>
);

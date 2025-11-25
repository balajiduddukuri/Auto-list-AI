import React, { useState } from 'react';
import { TrendingUp, Search, Zap, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendItem } from '../types';
import ProductStudio from './ProductStudio';

const INITIAL_TRENDS: TrendItem[] = [
  { id: '1', name: 'Portable Neck Fan', growth: 145, volume: 12500, category: 'Electronics', image: 'https://picsum.photos/id/1/300/300', status: 'idle' },
  { id: '2', name: 'Mushroom Lamp', growth: 89, volume: 8400, category: 'Home Decor', image: 'https://picsum.photos/id/20/300/300', status: 'idle' },
  { id: '3', name: 'Weighted Blanket', growth: 67, volume: 45000, category: 'Bedding', image: 'https://picsum.photos/id/30/300/300', status: 'idle' },
  { id: '4', name: 'Ceramic Matcha Set', growth: 210, volume: 6200, category: 'Kitchen', image: 'https://picsum.photos/id/40/300/300', status: 'idle' },
  { id: '5', name: 'Smart Garden System', growth: 320, volume: 18000, category: 'Garden', image: 'https://picsum.photos/id/50/300/300', status: 'idle' },
  { id: '6', name: 'Galaxy Projector', growth: 155, volume: 22000, category: 'Electronics', image: 'https://picsum.photos/id/60/300/300', status: 'idle' },
  { id: '7', name: 'Minimalist Desk Mat', growth: 95, volume: 15600, category: 'Office', image: 'https://picsum.photos/id/70/300/300', status: 'idle' },
  { id: '8', name: 'Portable Espresso', growth: 180, volume: 9800, category: 'Kitchen', image: 'https://picsum.photos/id/80/300/300', status: 'idle' },
  // Page 2 Data
  { id: '9', name: 'Levitating Plant Pot', growth: 400, volume: 8200, category: 'Home Decor', image: 'https://picsum.photos/id/90/300/300', status: 'idle' },
  { id: '10', name: 'Sunset Lamp', growth: 120, volume: 34000, category: 'Lighting', image: 'https://picsum.photos/id/100/300/300', status: 'idle' },
  { id: '11', name: 'Cordless Air Duster', growth: 250, volume: 11000, category: 'Electronics', image: 'https://picsum.photos/id/110/300/300', status: 'idle' },
  { id: '12', name: 'Vegetable Chopper', growth: 85, volume: 55000, category: 'Kitchen', image: 'https://picsum.photos/id/120/300/300', status: 'idle' },
  { id: '13', name: 'Cat Water Fountain', growth: 130, volume: 21000, category: 'Pets', image: 'https://picsum.photos/id/130/300/300', status: 'idle' },
  { id: '14', name: 'Shower Phone Holder', growth: 190, volume: 14500, category: 'Bathroom', image: 'https://picsum.photos/id/140/300/300', status: 'idle' },
  { id: '15', name: 'Digital Spoon Scale', growth: 110, volume: 7600, category: 'Kitchen', image: 'https://picsum.photos/id/150/300/300', status: 'idle' },
  { id: '16', name: 'Portable Blender', growth: 95, volume: 48000, category: 'Appliances', image: 'https://picsum.photos/id/160/300/300', status: 'idle' },
];

const DATA = [
  { name: 'Mon', vol: 4000 },
  { name: 'Tue', vol: 3000 },
  { name: 'Wed', vol: 5000 },
  { name: 'Thu', vol: 2780 },
  { name: 'Fri', vol: 8890 },
  { name: 'Sat', vol: 12390 },
  { name: 'Sun', vol: 15490 },
];

interface DashboardProps {
  onSelectProduct: (productName: string) => void;
}

const ITEMS_PER_PAGE = 8;

const Dashboard: React.FC<DashboardProps> = ({ onSelectProduct }) => {
  const [trends] = useState<TrendItem[]>(INITIAL_TRENDS);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(trends.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTrends = trends.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trend Discovery</h1>
          <p className="text-slate-500 mt-1">Identify high-potential products before the competition.</p>
        </div>
        <div className="flex gap-3 items-center">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Market Live
              </span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20}/>
                Global Search Volume Index
            </h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                cursor={{stroke: '#3b82f6', strokeWidth: 1}}
              />
              <Area type="monotone" dataKey="vol" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trending Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Exploding Topics</h2>
            <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {currentTrends.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 overflow-hidden hover:shadow-lg hover:border-blue-300 relative">
              
              <div className="h-48 w-full overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    +{item.growth}%
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs text-blue-600 font-semibold uppercase">{item.category}</span>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                    </div>
                </div>
                <div className="flex items-center text-xs text-slate-500 mb-6 gap-4">
                    <span className="flex items-center gap-1"><Search size={12}/> {item.volume.toLocaleString()} vol</span>
                    <span className="flex items-center gap-1 text-amber-500"><Zap size={12}/> High Intent</span>
                </div>
                
                <button 
                onClick={() => onSelectProduct(item.name)}
                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:bg-slate-800 flex items-center justify-center gap-2 group-hover:translate-y-[-2px]"
                >
                    <Rocket size={14} /> Launch Studio
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4">
            <button 
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === idx + 1 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
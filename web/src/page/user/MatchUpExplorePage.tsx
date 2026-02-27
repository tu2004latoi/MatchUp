import React from 'react';
import { 
  Map, ChevronLeft, ChevronRight, 
  Users, MapPin, Sparkles, Trophy,
  Check, Maximize2, Plus
} from 'lucide-react';

import ExploreHeader from '../../component/layout/ExploreHeader';

const MatchUpExplore = () => {
  // Mock data cho danh sách phòng
  const rooms = [
    { id: 1, title: 'Sunday Morning Football', location: 'Central Park Field', players: '5/10', level: 'INTERMEDIATE', sport: 'football' },
    { id: 2, title: '3v3 Street Ball', location: 'Venice Beach Courts', players: '1/6', level: 'ADVANCED', sport: 'basketball' },
    { id: 3, title: 'Casual Double Tennis', location: 'Riverside Club', players: '2/4', level: 'BEGINNER', sport: 'tennis' },
    { id: 4, title: 'Evening Futsal', location: 'Downtown YMCA', players: '6/12', level: 'INTERMEDIATE', sport: 'football' },
    { id: 5, title: 'Full Court Run', location: 'Public Arena', players: '9/10', level: 'ADVANCED', sport: 'basketball' },
    { id: 6, title: 'Corporate Match', location: 'Westfield Arena', players: '8/14', level: 'ADVANCED', sport: 'football' },
    { id: 7, title: 'Beach Volleyball', location: 'South Shore', players: '3/6', level: 'INTERMEDIATE', sport: 'volleyball' },
    { id: 8, title: 'Early Bird Squash', location: 'Olympic Park', players: '1/2', level: 'ADVANCED', sport: 'tennis' },
    { id: 9, title: 'Sunset Spikeball', location: 'North Beach', players: '4/8', level: 'ALL LEVELS', sport: 'volleyball' },
    { id: 10, title: 'Goal Keeper Training', location: 'City Sports Hub', players: '3/10', level: 'EXPERT', sport: 'football' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Filters</h2>
        <p className="text-sm text-slate-400 mb-6">Find your perfect game</p>

        <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all mb-8">
          <Sparkles size={18} />
          AI Match Me
        </button>

        <div className="space-y-8">
          {/* Lọc Môn Thể Thao */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Sport</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-bold cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-blue-100 rounded-lg"><Trophy size={16}/></div>
                   <span>Football</span>
                </div>
                <div className="bg-blue-600 text-white rounded-full p-0.5"><Check size={12}/></div>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-slate-500 font-bold cursor-pointer group transition-all">
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white"><Users size={16}/></div>
                 <span>Basketball</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-slate-500 font-bold cursor-pointer group transition-all">
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white"><Trophy size={16}/></div>
                 <span>Badminton</span>
              </div>
            </div>
          </div>

          {/* Lọc Số Người */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Members</h3>
               <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">2 - 10</span>
            </div>
            <div className="relative h-1.5 bg-slate-100 rounded-full">
              <div className="absolute left-[20%] right-[40%] h-full bg-blue-500 rounded-full"></div>
              <div className="absolute left-[20%] -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
              <div className="absolute right-[40%] -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* Lọc Khoảng Cách */}
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distance (KM)</h3>
               <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">0 - 25km</span>
            </div>
            <div className="relative h-1.5 bg-slate-100 rounded-full">
              <div className="absolute left-0 right-[30%] h-full bg-blue-500 rounded-full"></div>
              <div className="absolute right-[30%] -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Time of Day</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50">Morning</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100">Afternoon</button>
              <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50">Evening</button>
            </div>
          </div>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* TOP HEADER NAVIGATION */}
        <ExploreHeader />

        {/* TRANG KHÁM PHÁ PHÒNG */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-white">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                <span className="text-slate-800 font-bold tracking-tight"> Home </span>
              </div>
              <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-100 tracking-tight">124 Active Rooms</span>
            </div>

            {/* Lưới 14 phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-32">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-1 mr-2 mt-4 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                    {room.level}
                  </span>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Trophy size={24} />
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 leading-tight text-base mb-1 line-clamp-1">{room.title}</h4>
                  <div className="flex items-center text-xs text-slate-400 font-medium mb-6 gap-1.5">
                    <MapPin size={12} className="text-slate-300" />
                    <span>{room.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id + i}`} alt="player" />
                         </div>
                       ))}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Players <span className="text-slate-800 block text-sm leading-none mt-1">{room.players}</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button className="w-32 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-blue-50">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PHÂN TRANG */}
            <div className="flex items-center justify-center gap-2 mb-12">
               <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 hover:bg-slate-50 transition-all"><ChevronLeft size={18}/></button>
               <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100">1</button>
               <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 font-bold text-slate-400">2</button>
               <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 font-bold text-slate-400">3</button>
               <span className="w-10 h-10 flex items-center justify-center text-slate-300">...</span>
               <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 font-bold text-slate-400">8</button>
               <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 hover:bg-slate-50 transition-all"><ChevronRight size={18}/></button>
            </div>
          </div>
        </main>

        {/* FLOATING ELEMENTS: MAP & FAB */}
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-5 z-40">
           {/* Mini Map Widget */}
           <div className="w-[200px] h-[150px] bg-white rounded-3xl border-4 border-white shadow-2xl overflow-hidden relative group cursor-pointer transition-all hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-50" />
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.25), transparent 45%), radial-gradient(circle at 80% 60%, rgba(16,185,129,0.18), transparent 50%)",
              }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md animate-pulse"></div>
              <div className="absolute top-3 left-3 flex items-center gap-2 text-slate-700">
                <div className="p-1.5 bg-white/80 backdrop-blur rounded-lg border border-white shadow-sm">
                  <Map size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Map</span>
              </div>
              <button className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600"><Maximize2 size={14} /></button>
           </div>
           
           {/* FAB Green Button */}
           <button className="w-16 h-16 bg-[#10B981] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 hover:scale-110 active:scale-90 transition-all border-4 border-white">
             <Plus size={32} strokeWidth={3} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MatchUpExplore;
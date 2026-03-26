import { Sparkles } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type ExploreSidebarProps = {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  timeOfDay?: string;
  onTimeOfDaySelect?: (timeOfDay: string) => void;
};

const ExploreSidebar = ({ categories, selectedCategory, onCategorySelect, timeOfDay, onTimeOfDaySelect }: ExploreSidebarProps) => {
  return (
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
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`flex items-center justify-between p-3 rounded-xl font-bold cursor-pointer group transition-all ${
                  selectedCategory === category.id.toString()
                    ? 'bg-blue-50 border border-blue-100 text-blue-600'
                    : 'hover:bg-slate-50 text-slate-500'
                }`}
                onClick={() => onCategorySelect?.(category.id.toString())}
              >
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white flex items-center justify-center">
                     {category.icon ? (
                       category.icon.startsWith('http') ? (
                         <>
                           <img 
                             src={category.icon} 
                             alt={category.name}
                             className="w-4 h-4 object-cover rounded"
                             onError={(e) => {
                               e.currentTarget.style.display = 'none';
                               e.currentTarget.nextElementSibling?.classList.remove('hidden');
                             }}
                           />
                           <div className="w-4 h-4 bg-blue-500 rounded-full hidden" />
                         </>
                       ) : (
                         <span className="text-lg">{category.icon}</span>
                       )
                     ) : (
                       <div className="w-4 h-4 bg-blue-500 rounded-full" />
                     )}
                   </div>
                   <span>{category.name}</span>
                </div>
                {selectedCategory === category.id.toString() && (
                  <div className="bg-blue-600 text-white rounded-full p-0.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            ))}
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

        {/* Lọc Thời Gian Trong Ngày */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time of Day</h3>
             <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">All Day</span>
          </div>
          <div className="space-y-2">
            {['MORNING', 'NOON', 'AFTERNOON', 'EVENING'].map((time) => (
              <div 
                key={time}
                className={`flex items-center justify-between p-3 rounded-xl font-bold cursor-pointer group transition-all ${
                  timeOfDay === time
                    ? 'bg-blue-50 border border-blue-100 text-blue-600'
                    : 'hover:bg-slate-50 text-slate-500'
                }`}
                onClick={() => onTimeOfDaySelect?.(time)}
              >
                <span className="text-sm">{time}</span>
                {timeOfDay === time && (
                  <div className="bg-blue-600 text-white rounded-full p-0.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ExploreSidebar;

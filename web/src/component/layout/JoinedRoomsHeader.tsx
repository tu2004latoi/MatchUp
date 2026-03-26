import { Filter } from 'lucide-react';

type JoinedRoomsHeaderProps = {
  onFilterChange?: (value: string) => void;
};

const JoinedRoomsHeader = ({ onFilterChange }: JoinedRoomsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-10">
      <h1 className="text-3xl font-black tracking-tight">Phòng đã tham gia</h1>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
        <Filter size={16} className="text-slate-400 ml-2" />
        <select 
          className="bg-transparent text-sm font-bold outline-none pr-4"
          onChange={(e) => onFilterChange?.(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
    </div>
  );
};

export default JoinedRoomsHeader;

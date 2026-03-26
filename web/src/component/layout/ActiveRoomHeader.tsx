import { Shield, Share2, LogOut } from 'lucide-react';

type ActiveRoomHeaderProps = {
  roomId: string;
  roomName: string;
  onShare?: () => void;
  onLeave?: () => void;
};

const ActiveRoomHeader = ({ roomId, roomName, onShare, onLeave }: ActiveRoomHeaderProps) => {
  return (
    <div className="flex justify-between items-end mb-10">
      <div>
        <div className="flex items-center gap-2 text-sm text-blue-600 font-bold mb-2">
          <Shield size={16} /> Room ID: #{roomId}
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{roomName}</h1>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onShare}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all"
        >
          <Share2 size={20}/>
        </button>
        <button 
          onClick={onLeave}
          className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center gap-2 hover:bg-red-100 transition-all"
        >
          <LogOut size={20} /> Rời Phòng
        </button>
      </div>
    </div>
  );
};

export default ActiveRoomHeader;

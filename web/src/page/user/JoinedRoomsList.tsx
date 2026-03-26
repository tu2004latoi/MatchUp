import { Trophy, Users, Clock, Calendar, Search, Bell, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import { useContext } from 'react';
import { MyUserContext } from '../../config/MyContexts';
import ExploreHeader from '../../component/layout/ExploreHeader';

type RoomMember = {
  id: number;
  roomId: number;
  userId: number;
  role: string;
  statusMember: string;
  room: {
    id: number;
    name: string;
    description?: string;
    skillLevel?: string;
    visibility?: string;
    maxMembers?: number;
    currentMembers?: number;
    startTime?: string;
    endTime?: string;
    open?: boolean;
    location?: {
      id: number;
      address?: string;
      district?: string;
      region?: string;
    };
  };
};

const JoinedRoomsList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const [joinedRooms, setJoinedRooms] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch joined rooms from API
  useEffect(() => {
    const fetchJoinedRooms = async () => {
      if (!user?.id) return;
      
      try {
        const response = await authApis().get(endPoints.roomMembers.getRoomMemberByEventRoom, {
          params: { userId: user.id }
        });
        setJoinedRooms(response.data || []);
      } catch (error) {
        console.error('Error fetching joined rooms:', error);
        showToast({
          type: "error",
          title: "Không tải được danh sách phòng",
          message: "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedRooms();
  }, [user?.id, showToast]);

  const handleFilterChange = (value: string) => {
    // TODO: Implement filter logic
    console.log('Filter changed:', value);
  };

  const handleEnterRoom = (roomMember: RoomMember) => {
    navigate(`/active-room/${roomMember.room.id}`);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    if (isToday) return `${time} Hôm nay`;
    if (isTomorrow) return `${time} Ngày mai`;
    return `${time} ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
  };

  const getStatusInfo = (startTime?: string, endTime?: string) => {
    if (!startTime) return { status: "Unknown", color: "text-slate-400 bg-slate-50" };
    
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime || startTime);
    
    if (now < start) {
      return { status: "Starting Soon", color: "text-amber-500 bg-amber-50" };
    } else if (now >= start && now <= end) {
      return { status: "Active", color: "text-emerald-500 bg-emerald-50" };
    } else {
      return { status: "Finished", color: "text-slate-400 bg-slate-50" };
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Filters</h2>
        <p className="text-sm text-slate-400 mb-6">Find your joined rooms</p>

        <button className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all mb-8">
          <Calendar size={18} />
          My Rooms
        </button>

        <div className="space-y-8">
          {/* Lọc Trạng Thái */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-bold cursor-pointer">
                <span className="flex items-center gap-2"><Trophy size={16}/> Tất cả phòng</span>
                <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-lg">{joinedRooms.length}</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-slate-500 font-bold cursor-pointer group transition-all">
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white"><Clock size={16}/></div>
                 <span>Sắp diễn ra</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-slate-500 font-bold cursor-pointer group transition-all">
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white"><Users size={16}/></div>
                 <span>Đang hoạt động</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-slate-500 font-bold cursor-pointer group transition-all">
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white"><Trophy size={16}/></div>
                 <span>Đã kết thúc</span>
              </div>
            </div>
          </div>

          {/* Lọc Môn Thể Thao */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Sport</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-bold cursor-pointer">
                 <div className="p-1.5 bg-blue-100 rounded-lg"><Trophy size={16}/></div>
                 <span>Football</span>
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

        {/* TRANG DANH SÁCH PHÒNG ĐÃ THAM GIA */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-white">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                <span className="text-slate-800 font-bold tracking-tight"> My Rooms </span>
              </div>
              <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-100 tracking-tight">
                {loading ? "Loading..." : `${joinedRooms.length} Joined Rooms`}
              </span>
            </div>

            {/* Lưới các phòng đã tham gia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-32">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-400">Đang tải danh sách phòng...</p>
                </div>
              ) : joinedRooms.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Bạn chưa tham gia phòng nào</h3>
                  <p className="text-slate-400 mb-6">Khám phá và tham gia các phòng để bắt đầu!</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                  >
                    Khám phá phòng
                  </button>
                </div>
              ) : (
                joinedRooms.map((roomMember) => {
                  const room = roomMember.room;
                  const statusInfo = getStatusInfo(room.startTime, room.endTime);
                  const formattedTime = formatTime(room.startTime);
                  
                  return (
                    <div key={roomMember.id} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                      <span className="absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-1 mr-2 mt-4 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                        {room.skillLevel ?? "-"}
                      </span>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <Trophy size={24} />
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 leading-tight text-base mb-1 line-clamp-1">{room.name}</h4>
                      <div className="flex items-center text-xs text-slate-400 font-medium mb-6 gap-1.5">
                        <MapPin size={12} className="text-slate-300" />
                        <span>{room.location?.address ?? "-"}</span>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          Time
                          <span className="text-slate-800 block text-sm leading-none mt-1">
                            {formattedTime}
                          </span>
                        </div>

                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          Players
                          <span className="text-slate-800 block text-sm leading-none mt-1">
                            {(room.currentMembers ?? 0)}/{room.maxMembers ?? "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleEnterRoom(roomMember)}
                          className="w-32 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-blue-50"
                        >
                          Enter Room
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JoinedRoomsList;

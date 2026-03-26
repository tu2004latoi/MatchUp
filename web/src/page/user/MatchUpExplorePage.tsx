import { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Map, ChevronLeft, ChevronRight, 
  Users, MapPin, Sparkles, Trophy,
  Check, Maximize2, Plus, Clock, Lock
} from 'lucide-react';

import ExploreHeader from '../../component/layout/ExploreHeader';
import ExploreSidebar from '../../component/layout/ExploreSidebar';
import Apis, { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import RoomDetailsDrawer from '../../component/ui/RoomDetailsDrawer';
import CreateRoomModal from '../../component/ui/CreateRoomModel';
import { MyUserContext } from '../../config/MyContexts';

type RoomResponse = {
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
  hasPassword?: boolean;
  location?: {
    id: number;
    address?: string;
    district?: string;
    region?: string;
  };
};

type RoomsPageResponse = {
  content: RoomResponse[];
  totalElements?: number;
};

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"] as const;
const VISIBILITY = ["VISIBLE", "HIDDEN"] as const;

type CreateFormState = {
  name: string;
  description: string;
  skillLevel: (typeof SKILL_LEVELS)[number];
  visibility: (typeof VISIBILITY)[number];
  maxMembers: string;
  startTime: string;
  endTime: string;
  open: boolean;
  address: string;
  district: string;
  region: string;
  categoryId: string;
  hasPassword: boolean;
  password: string;
  roomType: "EVENT";
};

type Category = {
  id: number;
  name: string;
  icon?: string;
};

const MatchUpExplore = () => {
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState<Set<number>>(new Set());
  const [createForm, setCreateForm] = useState<CreateFormState>({
    name: "",
    description: "",
    skillLevel: SKILL_LEVELS[0],
    visibility: VISIBILITY[0],
    maxMembers: "10",
    startTime: "",
    endTime: "",
    open: true,
    address: "",
    district: "",
    region: "",
    categoryId: "",
    hasPassword: false,
    password: "",
    roomType: "EVENT",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [memberRange, setMemberRange] = useState({ min: 2, max: 10 });
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = window.setTimeout(() => {
      performSearch();
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  }, [searchQuery, selectedCategory, memberRange, timeOfDay]);

  // Trigger search when search params change
  useEffect(() => {
    debouncedSearch();
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, selectedCategory, memberRange, timeOfDay, debouncedSearch]);

  const locationPreview = useMemo(() => {
    const parts = [createForm.address, createForm.district, createForm.region].filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
  }, [createForm.address, createForm.district, createForm.region]);

  const fetchRooms = async (page: number = 0) => {
    setLoadingRooms(true);
    try {
      const res = await authApis().get<RoomsPageResponse>(endPoints.rooms.getRooms, {
        params: { page, size: 20 },
      });
      const content = res.data?.content ?? [];
      setRooms(content);
      setTotalRooms(typeof res.data?.totalElements === "number" ? res.data.totalElements : content.length);
      const totalElements = typeof res.data?.totalElements === "number" ? res.data.totalElements : content.length;
      setTotalPages(Math.ceil(totalElements / 20));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      showToast({
        type: "system",
        title: "Không tải được danh sách phòng",
        message: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await authApis().get(endPoints.categories.getCategories);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => setCreateOpen(true);
  const closeCreateModal = () => {
    if (creating) return;
    setCreateOpen(false);
  };

  const openDetailsDrawer = (room: RoomResponse) => {
    setSelectedRoom(room);
    setDetailsOpen(true);
  };

  const closeDetailsDrawer = () => {
    setDetailsOpen(false);
    setSelectedRoom(null);
  };

  const handleJoinRoom = () => {
    if (selectedRoom && !joinedRooms.has(selectedRoom.id)) {
      setJoinedRooms(prev => new Set(prev).add(selectedRoom.id));
      showToast({
        type: "success",
        title: "Tham gia phòng thành công",
        message: `Đã tham gia phòng ${selectedRoom.name}`,
      });
      closeDetailsDrawer();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTimeOfDaySelect = (timeOfDay: string) => {
    setTimeOfDay(timeOfDay);
  };

  const performSearch = async () => {
    setLoadingRooms(true);
    try {
      const params: any = {};
      
      if (searchQuery.trim()) {
        params.name = searchQuery.trim();
      }
      
      if (selectedCategory) {
        params.categoryId = parseInt(selectedCategory);
      }
      
      if (memberRange.max > 0) {
        params.maxMembers = memberRange.max;
      }

      if (timeOfDay.trim()) {
        params.timeOfDay = timeOfDay.trim();
      }

      // If no filters, use default fetchRooms
      if (!searchQuery.trim() && !selectedCategory && memberRange.max === 10 && !timeOfDay.trim()) {
        await fetchRooms(0);
        return;
      }

      const res = await authApis().get<RoomResponse[]>(endPoints.rooms.searchRooms, { params });
      setRooms(res.data || []);
      setTotalRooms(res.data?.length || 0);
      setTotalPages(1);
      setCurrentPage(0);
      
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Tìm kiếm thất bại",
        message: "Không thể tìm kiếm phòng. Vui lòng thử lại.",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  const toLocalDateTime = (value: string) => {
    if (!value) return null;
    return value.length === 16 ? `${value}:00` : value;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!createForm.name || !createForm.startTime || !createForm.endTime) {
      showToast({
        type: "error",
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tên phòng và thời gian bắt đầu/kết thúc.",
      });
      return;
    }

    if (!createForm.address || !createForm.district || !createForm.region) {
      showToast({
        type: "error",
        title: "Thiếu địa điểm",
        message: "Vui lòng nhập đầy đủ Address, District, Region.",
      });
      return;
    }

    const startTime = toLocalDateTime(createForm.startTime);
    const endTime = toLocalDateTime(createForm.endTime);

    if (!startTime || !endTime) return;

    const maxMembers = Number(createForm.maxMembers);
    if (!Number.isFinite(maxMembers) || maxMembers <= 0) {
      showToast({
        type: "error",
        title: "Số lượng thành viên không hợp lệ",
        message: "Vui lòng nhập max members > 0.",
      });
      return;
    }

    setCreating(true);
    try {
      const locationRes = await authApis().post(endPoints.locations.createLocation, {
        address: createForm.address,
        district: createForm.district,
        region: createForm.region,
      });

      const locationId: number | undefined = locationRes.data?.id;
      if (!locationId) {
        throw new Error("Location create failed: missing id");
      }

      const res = await authApis().post(endPoints.rooms.createEventRoom, {
        locationId,
        name: createForm.name,
        description: createForm.description || null,
        categoryId: createForm.categoryId ? Number(createForm.categoryId) : null,
        skillLevel: createForm.skillLevel,
        visibility: createForm.visibility,
        hasPassword: createForm.hasPassword,
        password: createForm.hasPassword ? createForm.password : null,
        maxMembers,
        startTime,
        endTime,
        open: createForm.open,
        roomType: createForm.roomType,
      });

      await authApis().post(endPoints.roomMembers.joinRoom, {
        userId: user.id,
        roomId: res.data.id,
        role: "OWNER",
        statusMember: "THINKING",
      });

      showToast({
        type: "success",
        title: "Tạo phòng thành công",
        message: `Địa điểm: ${locationPreview}`,
      });

      setCreateOpen(false);
      setCreateForm({
        name: "",
        description: "",
        skillLevel: SKILL_LEVELS[0],
        visibility: VISIBILITY[0],
        maxMembers: "10",
        startTime: "",
        endTime: "",
        open: true,
        address: "",
        district: "",
        region: "",
        categoryId: "",
        hasPassword: false,
        password: "",
        roomType: "EVENT",
      });

      await fetchRooms(0); // reset to first page after creating room
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Tạo phòng thất bại",
        message: "Vui lòng kiểm tra lại thông tin hoặc đăng nhập lại.",
      });
      setCreating(false);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
        
        {/* SIDEBAR BÊN TRÁI */}
        <ExploreSidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          timeOfDay={timeOfDay}
          onTimeOfDaySelect={handleTimeOfDaySelect}
        />

        {/* VÙNG NỘI DUNG CHÍNH */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* TOP HEADER NAVIGATION */}
          <ExploreHeader onCreateRoomClick={openCreateModal} onSearchChange={handleSearchChange} />

          {/* TRANG KHÁM PHÁ PHÒNG */}
          <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-white">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                  <span className="text-slate-800 font-bold tracking-tight"> Home </span>
                </div>
                <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-100 tracking-tight">
                  {loadingRooms ? "Loading..." : `${totalRooms} Active Rooms`}
                </span>
              </div>

              {/* Lưới 10 phòng */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 pb-32">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <span className="absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-1 mr-2 mt-4 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                      {room.skillLevel ?? "-"}
                    </span>
                    {room.hasPassword && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
                        <Lock size={14} className="text-amber-600" />
                      </div>
                    )}
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
                          {room.startTime
                            ? new Date(room.startTime).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : "-"}
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
                        onClick={() => openDetailsDrawer(room)}
                        className="w-32 py-2 bg-[#3B82F6] hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-blue-50"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PHÂN TRANG */}
              <div className="flex items-center justify-center gap-2 mb-12">
                 <button 
                   className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                   onClick={() => currentPage > 0 && fetchRooms(currentPage - 1)}
                   disabled={currentPage === 0 || loadingRooms}
                 >
                   <ChevronLeft size={18}/>
                 </button>
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                   <button
                     key={pageNum}
                     className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                       pageNum === currentPage + 1
                         ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                         : "hover:bg-slate-50 text-slate-400"
                     }`}
                     onClick={() => fetchRooms(pageNum - 1)}
                     disabled={loadingRooms}
                   >
                     {pageNum}
                   </button>
                 ))}
                 <button 
                   className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                   onClick={() => currentPage < totalPages - 1 && fetchRooms(currentPage + 1)}
                   disabled={currentPage === totalPages - 1 || loadingRooms}
                 >
                   <ChevronRight size={18}/>
                 </button>
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
             <button
               type="button"
               onClick={openCreateModal}
               className="w-16 h-16 bg-[#10B981] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 hover:scale-110 active:scale-90 transition-all border-4 border-white"
             >
               <Plus size={32} strokeWidth={3} />
             </button>
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={createOpen}
        onClose={closeCreateModal}
        creating={creating}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onSubmit={handleCreateRoom}
        locationPreview={locationPreview}
        skillLevels={SKILL_LEVELS}
        visibilityOptions={VISIBILITY}
        categories={categories}
      />

      <RoomDetailsDrawer 
        room={selectedRoom} 
        isOpen={detailsOpen} 
        onClose={closeDetailsDrawer} 
        onJoin={handleJoinRoom}
      />
    </>
  );
};

export default MatchUpExplore;
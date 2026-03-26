import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Clock, Info, Calendar, ArrowRight, Star, ChevronRight, Lock } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { MyUserContext } from '../../config/MyContexts';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from './Toast';

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

type RoomDetailsDrawerProps = {
  room: RoomResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: () => void;
};

const RoomDetailsDrawer = ({ room, isOpen, onClose, onJoin }: RoomDetailsDrawerProps) => {
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const [isJoinedRoom, setIsJoinedRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check if user has joined the room
  useEffect(() => {
    if (!room?.id || !user?.id) return;
    
    const checkMembership = async () => {
      try {
        const response = await authApis().get(endPoints.roomMembers.getRoomMembers, {
          params: {
            roomId: room.id,
            userId: user.id,
          },
        });
        const members = response.data;
        setIsJoinedRoom(members ? true : false);
      } catch (error) {
        console.error('Error checking room membership:', error);
        setIsJoinedRoom(false);
      }
    };

    checkMembership();
  }, [room?.id, user?.id]);

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (timeString?: string) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const handleJoin = async () => {
    if (!user?.id || !room?.id) return;
    
    // If room has password, show password modal
    if (room.hasPassword) {
      setShowPasswordModal(true);
      return;
    }
    
    // Direct join for rooms without password
    await joinRoom();
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      showToast({
        type: "error",
        title: "Thiếu mật khẩu",
        message: "Vui lòng nhập mật khẩu phòng.",
      });
      return;
    }

    await checkPasswordAndJoin();
  };

  const checkPasswordAndJoin = async () => {
    if (!room?.id) return;
    
    setPasswordLoading(true);
    try {
      const response = await authApis().post(endPoints.rooms.checkPasswordRoom(room.id.toString()), {
        roomId: room.id,
        password: password
      });
      
      if (response.data === true) {
        await joinRoom();
        setShowPasswordModal(false);
        setPassword('');
      } else {
        showToast({
          type: "error",
          title: "Mật khẩu sai",
          message: "Mật khẩu không đúng. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error('Error checking password:', error);
      showToast({
        type: "error",
        title: "Lỗi kiểm tra mật khẩu",
        message: "Không thể kiểm tra mật khẩu. Vui lòng thử lại.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user?.id || !room?.id) return;
    
    setLoading(true);
    try {
      await authApis().post(endPoints.roomMembers.joinRoom, {
        userId: user.id,
        roomId: room.id,
        role: "MEMBER",
        statusMember: "THINKING",
      });
      
      setIsJoinedRoom(true);
      showToast({
        type: "success",
        title: "Tham gia phòng thành công",
        message: `Đã tham gia phòng ${room.name}`,
      });
      
    } catch (error) {
      console.error('Error joining room:', error);
      showToast({
        type: "error",
        title: "Tham gia phòng thất bại",
        message: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay nền tối mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel Trượt từ phải sang */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Chi Tiết Phòng</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-8 space-y-8 flex-1">
              {/* Tên & Badge */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Football
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {room.skillLevel ?? "ALL"}
                  </span>
                  {room.hasPassword && (
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                      <Lock size={10} /> 
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{room.name}</h1>
              </div>

              {/* Mô tả */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={14} /> Mô tả phòng
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {room.description || "Chào mừng bạn đến với trận đấu giao lưu cuối tuần. Vui lòng mang theo giày thể thao và có mặt đúng giờ để khởi động cùng mọi người."}
                </p>
              </section>

              {/* Thông tin chính (Grid) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-2 text-xs font-bold">
                    <Users size={14} /> Thành viên
                  </div>
                  <div className="text-lg font-black text-slate-800">{room.currentMembers ?? 0} / {room.maxMembers ?? "-"}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 mb-1 flex items-center gap-2 text-xs font-bold">
                    <MapPin size={14} /> Địa điểm
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate">{room.location?.address ?? "-"}</div>
                </div>
              </div>

              {/* Thời gian */}
              <section className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={14} /> Lịch thi đấu
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-blue-400 uppercase">Bắt đầu</div>
                    <div className="text-xl font-black text-blue-900 flex items-center gap-2">
                      <Clock size={18} /> {formatTime(room.startTime)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">{formatDate(room.startTime)}</div>
                  </div>
                  <ArrowRight className="text-blue-200" />
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-blue-400 uppercase">Kết thúc</div>
                    <div className="text-xl font-black text-blue-900">{formatTime(room.endTime)}</div>
                    <div className="text-xs text-blue-600 mt-1">{formatDate(room.endTime)}</div>
                  </div>
                </div>
              </section>

              {/* Danh sách thành viên tham gia */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Người chơi đã tham gia</h3>
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: room.currentMembers ?? 0 }).map((_, i) => (
                    <div key={i} className="group relative">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${i + 10}`} 
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm hover:border-blue-600 transition-all cursor-pointer"
                        alt="Member"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Nút Join cố định ở dưới */}
            <div className="p-8 border-t border-slate-100 bg-white">
              {isJoinedRoom ? (
                <button 
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-2xl shadow-xl cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  Đã vào phòng
                </button>
              ) : (
                <button 
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tham gia..." : "Tham gia phòng ngay"}
                </button>
              )}
            </div>

            {/* Password Modal */}
            <AnimatePresence>
              {showPasswordModal && (
                <>
                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPasswordModal(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
                  />

                  {/* Modal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 flex items-center justify-center z-[201]"
                  >
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Lock size={24} className="text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">Phòng có mật khẩu</h3>
                          <p className="text-sm text-slate-400">Vui lòng nhập mật khẩu để tham gia phòng</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-bold text-slate-700 mb-2 block">Mật khẩu</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu phòng"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowPasswordModal(false)}
                          className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium transition-all"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handlePasswordSubmit}
                          disabled={passwordLoading}
                          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {passwordLoading ? "Đang kiểm tra..." : "Tham gia"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoomDetailsDrawer;

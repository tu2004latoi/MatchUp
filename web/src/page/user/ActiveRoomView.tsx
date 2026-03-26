import { useContext, useEffect, useRef, useState } from 'react';
import { 
  Users, UserPlus, MessageSquare, MapPin, 
  Info, Send, Minimize2, Maximize2, ArrowLeft, 
  Power, PowerOff, LogOut, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ActiveRoomHeader from '../../component/layout/ActiveRoomHeader';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import { MyUserContext } from '../../config/MyContexts';
import { useWebSocket } from '../../context/WebSocketContext';

type Member = {
  id: number;
  name: string;
  role: 'host' | 'member';
  isFriend: boolean;
  hasSentRequest: boolean;
  status: string;
  avatar?: string;
  userId: number;
  isCurrentUser?: boolean;
};

type Room = {
  id: number;
  name: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  startTime: string;
  endTime: string;
  location: {
    id: number;
    address: string;
    district: string;
    region: string;
  };
  category: {
    name: string;
  };
  skillLevel: string;
  visibility: string;
  open: boolean;
};

type ChatMessage = {
  id: number;
  content: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
};

const ActiveRoomView = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useContext(MyUserContext);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { showToast } = useToast();
  const { subscribeToRoom, sendMessage, isConnected } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (roomId) {
      fetchCurrentUser();
      fetchRoomData();
      fetchRoomMembers();
      fetchRoomMessages();
    }
  }, [roomId]);

  useEffect(() => {
    if (room?.id && isConnected) {
      subscribeToRoom(room.id, (message) => {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          
          return [...prev, {
            id: message.id,
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt
          }];
        });
      });
    }
  }, [room?.id, isConnected]);

  const fetchRoomMessages = async () => {
    try {
      const response = await authApis().get(endPoints.messages.getMessagesByRoomId, {
        params: { roomId: roomId }
      });
      
      // Fetch user profiles for all message senders
      const messagesWithProfiles = await Promise.all(
        response.data.map(async (message: any) => {
          try {
            const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', message.sender.id.toString()));
            const profile = profileResponse.data;
            
            return {
              ...message,
              sender: {
                id: message.sender.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                avatar: profile.avatar
              }
            };
          } catch (error) {
            console.error(`Error fetching profile for user ${message.sender.id}:`, error);
            return {
              ...message,
              sender: {
                id: message.sender.id,
                firstName: message.sender.firstName || 'Unknown',
                lastName: message.sender.lastName || '',
                avatar: undefined
              }
            };
          }
        })
      );
      
      setMessages(messagesWithProfiles);
      
      // Auto-scroll to bottom after fetching messages
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching room messages:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authApis().get(endPoints.users.getMe);
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchRoomData = async () => {
    try {
      const response = await authApis().get(endPoints.rooms.getRoomById(roomId!));
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room data:', error);
      showToast({
        type: "error",
        title: "Lỗi tải thông tin phòng",
        message: "Không thể tải thông tin phòng. Vui lòng thử lại.",
      });
    }
  };

  const fetchRoomMembers = async () => {
    try {
      const res = await authApis().get(endPoints.roomMembers.getRoomMemberByRoomId, {
        params: {
          roomId: roomId
        }
      });
      
      // Fetch user profiles for all members
      const membersWithProfiles = await Promise.all(
        res.data.map(async (member: any) => {
          try {
            const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', member.user.id.toString()));
            const profile = profileResponse.data;

            // Check if current user is friends with this member (excluding self)
            let isFriend = false;
            if (user?.id && member.user.id !== user.id) {
              try {
                const friendCheckResponse = await authApis().get(endPoints.friends.checkIfFriend, {
                  params: {
                    userId: user.id,
                    friendId: member.user.id
                  }
                });
                isFriend = friendCheckResponse.data === true;
              } catch (error) {
                console.error(`Error checking friendship with user ${member.user.id}:`, error);
                isFriend = false;
              }
            }

            // Check if current user has already sent friend request to this member
            let hasSentRequest = false;
            if (user?.id && member.user.id !== user.id) {
              try {
                const requestCheckResponse = await authApis().get(endPoints.friendRequests.checkIfFriendRequest, {
                  params: { 
                    senderId: user.id,
                    receiverId: member.user.id
                  }
                });
                hasSentRequest = requestCheckResponse.data === true;
              } catch (error) {
                console.error(`Error checking friend request to user ${member.user.id}:`, error);
                hasSentRequest = false;
              }
            }

            return {
              id: profile.id,
              name: `${profile.firstName} ${profile.lastName}`,
              role: member.role === 'OWNER' ? 'host' : 'member',
              isFriend: isFriend,
              hasSentRequest: hasSentRequest,
              status: member.statusMember === 'READY' ? 'Ready' : 
                      member.statusMember === 'THINKING' ? 'Thinking...' : 
                      member.statusMember === 'PENDING' ? 'Pending...' : 'Unknown',
              avatar: profile.avatar,
              userId: member.user.id,
              isCurrentUser: user?.id === member.user.id,
            };
          } catch (error) {
            console.error(`Error fetching profile for user ${member.user.id}:`, error);
            return {
              id: member.user.id,
              name: `${member.user.firstName} ${member.user.lastName}`,
              role: member.role === 'OWNER' ? 'host' : 'member',
              isFriend: false,
              hasSentRequest: false,
              status: member.statusMember === 'READY' ? 'Ready' : 
                      member.statusMember === 'THINKING' ? 'Thinking...' : 
                      member.statusMember === 'PENDING' ? 'Pending...' : 'Unknown',
              avatar: undefined,
              userId: member.user.id,
              isCurrentUser: user?.id === member.user.id,
            };
          }
        })
      );
      
      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching room members:', error);
      showToast({
        type: "error",
        title: "Lỗi tải danh sách thành viên",
        message: "Không thể tải danh sách thành viên. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleAddFriend = async (friendId: number) => {
    try {
      await authApis().post(endPoints.friendRequests.sendFriendRequest, {
        senderId: user?.id,
        receiverId: friendId,
      });
      
      showToast({
        type: "success",
        title: "Đã gửi lời mời kết bạn",
        message: "Lời mời kết bạn đã được gửi thành công.",
      });

      await authApis().post(endPoints.notifications.createNotification, {
        userId: friendId,
        title: "Lời mời kết bạn",
        content: "Bạn đã nhận được lời mời kết bạn mới"
      });
      
      // Refresh members to update friend status
      fetchRoomMembers();
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToast({
        type: "error",
        title: "Lỗi gửi lời mời",
        message: "Không thể gửi lời mời kết bạn. Vui lòng thử lại.",
      });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const currentMember = members.find(m => m.isCurrentUser);
      if (currentMember) {
        await authApis().delete(endPoints.roomMembers.outRoom, {
          params: {
            roomId: room?.id,
            userId: user?.id,
          }
        });
        showToast({
          type: "success",
          title: "Rời phòng thành công",
          message: "Bạn đã rời phòng thành công.",
        });
        navigate('/joined-rooms');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      showToast({
        type: "error",
        title: "Lỗi rời phòng",
        message: "Không thể rời phòng. Vui lòng thử lại.",
      });
    }
  };

  const handleToggleReady = async () => {
    try {
      const currentMember = members.find(m => m.isCurrentUser);
      console.log(currentMember);
      if (currentMember) {
        if (currentMember.status === 'Ready') {
          await authApis().patch(endPoints.rooms.unreadyRoom(roomId!));
        } else {
          await authApis().patch(endPoints.rooms.readyRoom(roomId!));
        }
        
        // Refresh members list
        fetchRoomMembers();
        
        showToast({
          type: "success",
          title: currentMember.status === 'Ready' ? "Đang suy nghĩ..." : "Sẵn sàng!",
          message: currentMember.status === 'Ready' ? "Bạn đang suy nghĩ." : "Bạn đã sẵn sàng tham gia.",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast({
        type: "error",
        title: "Lỗi cập nhật trạng thái",
        message: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !room?.id || !user?.id) return;
    
    try {
      // Send via WebSocket - backend will save to DB and broadcast
      sendMessage({
        roomId: room.id,
        content: newMessage.trim(),
        senderId: user.id as number
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: "error",
        title: "Lỗi gửi tin nhắn",
        message: "Không thể gửi tin nhắn. Vui lòng thử lại.",
      });
    }
  };

  const handleToggleRoomStatus = async () => {
    try {
      if (room?.open) {
        await authApis().patch(endPoints.rooms.closeRoom(roomId!));
      } else {
        await authApis().patch(endPoints.rooms.openRoom(roomId!));
      }
      
      // Refresh room data
      fetchRoomData();
      
      showToast({
        type: "success",
        title: room?.open ? "Đã đóng phòng" : "Đã mở phòng",
        message: room?.open ? "Phòng đã được đóng." : "Phòng đã được mở lại.",
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      showToast({
        type: "error",
        title: "Lỗi cập nhật phòng",
        message: "Không thể cập nhật trạng thái phòng. Vui lòng thử lại.",
      });
    }
  };

  const getCurrentMember = () => {
    return members.find(m => m.isCurrentUser);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Không tìm thấy thông tin phòng</p>
          <button 
            onClick={() => navigate('/joined-rooms')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      
      {/* KHU VỰC CHÍNH (2 CỘT THÀNH VIÊN) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Nút trở về */}
          <button 
            onClick={() => navigate('/joined-rooms')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Trở về danh sách phòng
          </button>
          
          {/* Header Phòng */}
          <ActiveRoomHeader 
            roomId={room.id.toString()}
            roomName={room.name}
            onShare={handleShare}
            onLeave={handleLeaveRoom}
          />

          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <Users size={16} /> Danh sách người tham gia ({members.length}/{room.maxMembers})
          </h3>

          {/* Lưới 2 cột thành viên */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
            {members.map((member) => (
              <div key={member.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
                      alt="avatar" 
                      className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{member.name}</span>
                      {member.role === 'host' && (
                        <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">HOST</span>
                      )}
                      {member.isCurrentUser && (
                        <span className="text-[9px] font-black bg-green-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">BẠN</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{member.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!member.isFriend && !member.hasSentRequest && !member.isCurrentUser && (
                    <button 
                      onClick={() => handleAddFriend(member.userId)}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                      title="Kết bạn"
                    >
                      <UserPlus size={18} />
                    </button>
                  )}
                  <button className="p-2.5 text-slate-300 hover:text-slate-600"><MessageSquare size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* SIDEBAR PHẢI: THÔNG TIN PHÒNG */}
      <aside className="w-96 bg-white border-l border-slate-100 p-8 overflow-y-auto">
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Info size={16} /> Mô tả & Quy định
            </h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm leading-relaxed text-slate-600 italic">
              {room.description || "Không có mô tả nào cho phòng này."}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <MapPin size={16} /> Vị trí sân đấu
            </h3>
            <div className="w-full h-48 bg-blue-50 rounded-[24px] border border-slate-100 relative overflow-hidden flex items-center justify-center">
              <MapPin className="text-blue-200" size={48} />
              <div className="absolute bottom-4 inset-x-4 bg-white/80 backdrop-blur-md p-3 rounded-xl text-xs font-bold text-center border border-white">
                {room.location?.address ? 
                  `${room.location.address}${room.location.district ? `, ${room.location.district}` : ''}${room.location.region ? `, ${room.location.region}` : ''}` : 
                  "Đang cập nhật vị trí"
                }
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Users size={16} /> Hành động
            </h3>
            <div className="space-y-3">
              {getCurrentMember()?.role === 'host' ? (
                // OWNER buttons
                <>
                  <button 
                    onClick={handleToggleRoomStatus}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      room?.open 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {room?.open ? (
                      <>
                        <PowerOff size={18} />
                        Đóng phòng
                      </>
                    ) : (
                      <>
                        <Power size={18} />
                        Mở phòng
                      </>
                    )}
                  </button>
                </>
              ) : (
                // MEMBER buttons
                <>
                  <button 
                    onClick={handleToggleReady}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      getCurrentMember()?.status === 'Ready' 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {getCurrentMember()?.status === 'Ready' ? (
                      <>
                        <XCircle size={18} />
                        Không sẵn sàng
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Sẵn sàng
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* KHUNG CHAT MINI (GÓC DƯỚI TRÁI) */}
      <div className={`fixed bottom-6 left-6 w-80 bg-white shadow-2xl rounded-[24px] border border-slate-100 overflow-hidden transition-all z-50 ${isChatOpen ? 'h-[400px]' : 'h-14'}`}>
        {/* Chat Header */}
        <div className="bg-slate-900 p-4 flex items-center justify-between text-white cursor-pointer" onClick={() => setIsChatOpen(!isChatOpen)}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <MessageSquare size={16} /> Trò chuyện nhóm
          </div>
          <div className="flex gap-2">
            {isChatOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </div>
        </div>

        {isChatOpen && (
          <div className="flex flex-col h-[calc(400px-56px)]">
            <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => {
                const isMyMessage = msg.sender.id === user?.id;
                const showSenderName = index === 0 || messages[index - 1]?.sender.id !== msg.sender.id;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[100%] ${isMyMessage ? 'self-end' : ''}`}>
                    {!isMyMessage && showSenderName && (
                      <span className="text-[10px] font-bold text-slate-400 ml-2 mb-1">
                        {msg.sender.firstName} {msg.sender.lastName}
                      </span>
                    )}
                    <div className={`${isMyMessage ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'} p-3 rounded-2xl text-xs ${isMyMessage ? 'shadow-md shadow-blue-100' : ''}`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 ml-1">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Input Chat */}
            <div className="p-3 border-t border-slate-50 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Gửi tin nhắn..." 
                className="flex-1 bg-slate-50 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-600" 
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <Send size={16}/>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ActiveRoomView;

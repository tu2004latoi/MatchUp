import { useContext, useEffect, useState } from 'react';
import { Search, Send, User, Clock, MessageCircle, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import ExploreHeader from '../../component/layout/ExploreHeader';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import { MyUserContext } from '../../config/MyContexts';
import { useWebSocket } from '../../context/WebSocketContext';
import type { WebSocketMessage } from '../../services/websocketService';
import { useNavigate } from 'react-router-dom';

type PrivateRoom = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Other room properties...
};

type Message = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  room: {
    id: number;
  };
};

type RoomWithMessages = {
  room: PrivateRoom;
  chatName: string; // Display name for the chat
  chatAvatar?: string; // Avatar URL for the chat
  messages: Message[];
};

const MessagesPage = () => {
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const { isConnected, sendMessage, subscribeToRoom, unsubscribeFromRoom } = useWebSocket();
  const navigate = useNavigate();
  const [privateRooms, setPrivateRooms] = useState<PrivateRoom[]>([]);
  const [roomsWithMessages, setRoomsWihMessages] = useState<RoomWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<PrivateRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch private rooms
  const fetchPrivateRooms = async () => {
    try {
      const response = await authApis().get(endPoints.rooms.getMyPrivateRooms);
      setPrivateRooms(response.data || []);
      
      // After getting rooms, fetch messages for each room
      if (response.data && response.data.length > 0) {
        await fetchMessagesForRooms(response.data);
      }
    } catch (error) {
      console.error('Error fetching private rooms:', error);
      showToast({
        type: "error",
        title: "Lỗi",
        message: "Không thể tải danh sách chat riêng",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for each room
  const fetchMessagesForRooms = async (rooms: PrivateRoom[]) => {
    const roomsWithMessagesData: RoomWithMessages[] = [];
    
    for (const room of rooms) {
      try {
        // Get room members to find the other user
        let otherUserId: number | undefined;
        let chatName = room.name; // Fallback to room name
        let chatAvatar: string | undefined;
        
        try {
          const membersResponse = await authApis().get(endPoints.roomMembers.getRoomMemberByRoomId, {
            params: { roomId: room.id }
          });
          const members = membersResponse.data || [];
          
          // Find the other user (not current user)
          const otherMember = members.find((member: any) => member.user.id !== user?.id);
          otherUserId = otherMember?.user.id;
          
          if (otherUserId) {
            // Get user profile to display their name and avatar
            const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', otherUserId.toString()));
            const profile = profileResponse.data;
            chatName = `${profile.firstName} ${profile.lastName}`;
            chatAvatar = profile.avatar;
          }
        } catch (error) {
          console.error(`Error fetching members/profile for room ${room.id}:`, error);
          // Keep room name as fallback
        }
        
        // Get messages for this room
        const response = await authApis().get(endPoints.messages.getMessagesByRoomId, {
          params: { roomId: room.id }
        });
        
        roomsWithMessagesData.push({
          room,
          chatName,
          chatAvatar,
          messages: response.data || []
        });
      } catch (error) {
        console.error(`Error fetching messages for room ${room.id}:`, error);
        // Still add the room even if messages fail to load
        roomsWithMessagesData.push({
          room,
          chatName: room.name,
          messages: []
        });
      }
    }
    
    setRoomsWihMessages(roomsWithMessagesData);
    
    // Select first room by default
    if (roomsWithMessagesData.length > 0 && !selectedRoom) {
      setSelectedRoom(roomsWithMessagesData[0].room);
    }
  };

  // Handle real-time messages
  const handleRealtimeMessage = (message: WebSocketMessage) => {
    setRoomsWihMessages(prev => prev.map(rwm => 
      rwm.room.id === message.room.id 
        ? { ...rwm, messages: [...rwm.messages, message] }
        : rwm
    ));
  };

  // Subscribe to selected room for real-time messages
  useEffect(() => {
    if (selectedRoom && isConnected) {
      subscribeToRoom(selectedRoom.id, handleRealtimeMessage);
      
      return () => {
        unsubscribeFromRoom(selectedRoom.id);
      };
    }
  }, [selectedRoom, isConnected, subscribeToRoom, unsubscribeFromRoom]);

  // Send message via WebSocket
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !messageInput.trim() || !user?.id) return;

    setSendingMessage(true);
    try {
      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendMessage({
          roomId: selectedRoom.id,
          content: messageInput.trim(),
          senderId: user.id
        } as any);
      } else {
        // Fallback to HTTP API if WebSocket is not connected
        await authApis().post(endPoints.messages.sendMessage, {
          roomId: selectedRoom.id,
          content: messageInput.trim(),
          senderId: user.id
        });
        
        // Refresh messages for this room
        const roomWithMessages = roomsWithMessages.find(rwm => rwm.room.id === selectedRoom.id);
        if (roomWithMessages) {
          try {
            const response = await authApis().get(endPoints.messages.getMessagesByRoomId, {
              params: { roomId: selectedRoom.id }
            });
            
            setRoomsWihMessages(prev => prev.map(rwm => 
              rwm.room.id === selectedRoom.id 
                ? { ...rwm, messages: response.data || [] }
                : rwm
            ));
          } catch (error) {
            console.error('Error refreshing messages:', error);
          }
        }
      }

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        type: "error",
        title: "Lỗi",
        message: "Không thể gửi tin nhắn",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchPrivateRooms();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const selectedRoomMessages = roomsWithMessages.find(rwm => rwm.room.id === selectedRoom?.id)?.messages || [];

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
        
        {/* SIDEBAR BÊN TRÁI - Danh sách chat */}
        <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Tin nhắn</h2>
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Quay lại trang chủ"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Đang tải tin nhắn...
              </div>
            ) : roomsWithMessages.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MessageCircle size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              <div className="p-2">
                {roomsWithMessages.map(({ room, chatName, chatAvatar, messages }) => {
                  const lastMessage = messages[messages.length - 1];
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 rounded-xl cursor-pointer transition-all mb-2 ${
                        selectedRoom?.id === room.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {chatAvatar ? (
                            <img 
                              src={chatAvatar} 
                              alt={`${chatName}'s avatar`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to default icon if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                              }}
                            />
                          ) : (
                            <User size={20} className="text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">{chatName}</h3>
                            {lastMessage && (
                              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                {formatTime(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {lastMessage ? (
                            <p className="text-sm text-slate-600 truncate">{lastMessage.content}</p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">Chưa có tin nhắn</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* VÙNG CHAT CHÍNH */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Header của room */}
              <div className="bg-white border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                      {(() => {
                        const currentRoomData = roomsWithMessages.find(rwm => rwm.room.id === selectedRoom.id);
                        const avatar = currentRoomData?.chatAvatar;
                        return avatar ? (
                          <img 
                            src={avatar} 
                            alt={`${currentRoomData?.chatName || selectedRoom.name}'s avatar`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to default icon if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                            }}
                          />
                        ) : (
                          <User size={18} className="text-slate-600" />
                        );
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {roomsWithMessages.find(rwm => rwm.room.id === selectedRoom.id)?.chatName || selectedRoom.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {isConnected ? (
                          <>
                            <Wifi size={10} className="text-green-500" />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <WifiOff size={10} className="text-red-500" />
                            Mất kết nối
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {selectedRoomMessages.length === 0 ? (
                  <div className="text-center text-slate-400 mt-20">
                    <MessageCircle size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>Bắt đầu cuộc trò chuyện</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedRoomMessages.map((message) => {
                      const isOwnMessage = message.sender.id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl text-sm ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-800 border border-slate-200'
                              }`}
                            >
                              <p>{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                              <Clock size={10} />
                              <span>{formatTime(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-slate-100 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} />
                    )}
                    Gửi
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center text-slate-400">
                <MessageCircle size={64} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Chọn một cuộc trò chuyện</h3>
                <p className="text-sm">Chọn một chat từ danh sách để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExploreHeader />
    </>
  );
};

export default MessagesPage;

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Clock, Check, X, Search, Bell, 
  Users, Trophy, MapPin, Calendar
} from 'lucide-react';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import { MyUserContext } from '../../config/MyContexts';
import ExploreHeader from '../../component/layout/ExploreHeader';

type FriendRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    skillLevel?: string;
    location?: {
      address?: string;
      district?: string;
      region?: string;
    };
  };
};

type Friend = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  skillLevel?: string;
  location?: {
    address?: string;
    district?: string;
    region?: string;
  };
  friendshipId?: number;
};

const FriendRequestsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendRequestData, setFriendRequestData] = useState<any[]>([]);
  const [requestStatuses, setRequestStatuses] = useState<{[key: number]: 'accepted' | 'declined' | null}>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friend requests and friends
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        console.log('User not available, skipping fetch');
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch friend requests
        const requestsResponse = await authApis().get(endPoints.friendRequests.getFriendRequests, {
          params: { 
            userId: user.id,
            page: 0,
            size: 50 // Load more requests at once
          }
        });
        
        // Handle paginated response
        const requestsData = requestsResponse.data && requestsResponse.data.content 
          ? requestsResponse.data.content 
          : requestsResponse.data || [];
        
        setFriendRequests(requestsData);

        const requestsWithProfiles = await Promise.all(
          requestsData.map(async (request: any) => {
            try {
              const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', request.sender.id.toString()));
              return {
                ...request,
                sender: profileResponse.data
              };
            } catch (error) {
              console.error(`Error fetching profile for user ${request.sender.id}:`, error);
              return request;
            }
          })
        );

        setFriendRequestData(requestsWithProfiles);

        // Fetch friends list
        const friendsResponse = await authApis().get(endPoints.friends.getFriendByUserId, {
          params: { 
            userId: user.id,
            page: 0,
            size: 10
          }
        });     
        // Handle paginated response
        if (friendsResponse.data && friendsResponse.data.content) {
          // Transform FriendShip data to Friend format and fetch profiles
          const friendsWithProfiles = await Promise.all(
            friendsResponse.data.content.map(async (friendship: any) => {
              // Determine which user is the friend (not the current user)
              const friendData = friendship.user && friendship.user.id === user.id ? friendship.friend : friendship.user;
              
              try {
                const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', friendData.id.toString()));
                return {
                  id: profileResponse.data.id,
                  firstName: profileResponse.data.firstName,
                  lastName: profileResponse.data.lastName,
                  username: profileResponse.data.username,
                  avatar: profileResponse.data.avatar,
                  skillLevel: profileResponse.data.skillLevel,
                  location: profileResponse.data.location,
                  friendshipId: friendship.id
                };
              } catch (error) {
                console.error(`Error fetching profile for friend ${friendData.id}:`, error);
                return {
                  id: friendData?.id,
                  firstName: friendData?.firstName || '',
                  lastName: friendData?.lastName || '',
                  username: friendData?.username || '',
                  avatar: friendData?.avatar,
                  skillLevel: friendData?.skillLevel,
                  location: friendData?.location,
                  friendshipId: friendship.id
                };
              }
            })
          );
          
          const validFriends = friendsWithProfiles.filter((friend: any) => friend.id);
          setFriends(validFriends);
        } else {
          setFriends([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast({
          type: "error",
          title: "Không tải được dữ liệu",
          message: "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, showToast]);

  const handleAcceptRequest = async (requestId: number, senderId: number, receiverId: number) => {
    if (!user?.id) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: "Vui lòng đăng nhập lại.",
      });
      return;
    }

    try {
      // First accept friend request
      const res = await authApis().patch(endPoints.friendRequests.acceptFriendRequest(requestId.toString()));
      console.log(res.data);
      
      // Update status
      setRequestStatuses(prev => ({ ...prev, [requestId]: 'accepted' }));
      
      // Remove from requests list after a delay
      setTimeout(() => {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        setFriendRequestData(prev => prev.filter(req => req.id !== requestId));
      }, 2000);
      
      // Then create the friendship
      await authApis().post(endPoints.friends.createFriend, {
        userId: user?.id, // Current user
        friendId: senderId  // User who sent the request
      });
      
      setTimeout(() => {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        setFriendRequestData(prev => prev.filter(req => req.id !== requestId));
      }, 2000);

      const roomResponse = await authApis().post(endPoints.rooms.createPrivateRoom, {
        targetUserId: senderId
      });

      await authApis().post(endPoints.roomMembers.joinRoom, {
        userId: user.id,
        roomId: roomResponse.data.id,
        role: "OWNER",
        statusMember: "READY",
      });

      await authApis().post(endPoints.roomMembers.joinRoom, {
        userId: senderId,
        roomId: roomResponse.data.id,
        role: "OWNER",
        statusMember: "READY",
      });
      
      // Refresh friends list
      if (user?.id) {
        const friendsResponse = await authApis().get(endPoints.friends.getFriendByUserId, {
          params: { 
            userId: user.id,
            page: 0,
            size: 10
          }
        });
        
        if (friendsResponse.data && friendsResponse.data.content) {
          const friendsWithProfiles = await Promise.all(
            friendsResponse.data.content.map(async (friendship: any) => {
              // Determine which user is the friend (not the current user)
              const friendData = friendship.user && friendship.user.id === user.id ? friendship.friend : friendship.user;
              
              try {
                const profileResponse = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', friendData.id.toString()));
                return {
                  id: profileResponse.data.id,
                  firstName: profileResponse.data.firstName,
                  lastName: profileResponse.data.lastName,
                  username: profileResponse.data.username,
                  avatar: profileResponse.data.avatar,
                  skillLevel: profileResponse.data.skillLevel,
                  location: profileResponse.data.location,
                  friendshipId: friendship.id
                };
              } catch (error) {
                console.error(`Error fetching profile for friend ${friendData.id}:`, error);
                return {
                  id: friendData?.id,
                  firstName: friendData?.firstName || '',
                  lastName: friendData?.lastName || '',
                  username: friendData?.username || '',
                  avatar: friendData?.avatar,
                  skillLevel: friendData?.skillLevel,
                  location: friendData?.location,
                  friendshipId: friendship.id
                };
              }
            })
          );
          
          const validFriends = friendsWithProfiles.filter((friend: any) => friend.id);
          setFriends(validFriends);
        }
      }
      
      showToast({
        type: "success",
        title: "Đã chấp nhận lời mời",
        message: "Bạn đã trở thành bạn bè.",
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showToast({
        type: "error",
        title: "Lỗi chấp nhận lời mời",
        message: "Không thể chấp nhận lời mời. Vui lòng thử lại.",
      });
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      await authApis().patch(endPoints.friendRequests.declineFriendRequest(requestId.toString()));
      
      // Update status
      setRequestStatuses(prev => ({ ...prev, [requestId]: 'declined' }));
      
      // Remove from list after a delay
      setTimeout(() => {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        setFriendRequestData(prev => prev.filter(req => req.id !== requestId));
      }, 2000);
      
      showToast({
        type: "success",
        title: "Đã từ chối lời mời",
        message: "Lời mời đã bị từ chối.",
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
      showToast({
        type: "error",
        title: "Lỗi từ chối lời mời",
        message: "Không thể từ chối lời mời. Vui lòng thử lại.",
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const filteredRequests = friendRequestData.filter(request => {
    const fullName = `${request.sender?.firstName || ''} ${request.sender?.lastName || ''}`.toLowerCase();
    const username = request.sender?.username || '';
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || username.toLowerCase().includes(query);
  });

  const filteredFriends = friends.filter(friend => {
    const fullName = `${friend?.firstName || ''} ${friend?.lastName || ''}`.toLowerCase();
    const username = friend?.username || '';
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || username.toLowerCase().includes(query);
  });

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return created.toLocaleDateString("vi-VN", { 
      day: "2-digit", 
      month: "2-digit" 
    });
  };

  const handleViewProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
        <ExploreHeader onSearchChange={handleSearchChange} />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Đang tải lời mời kết bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HEADER */}
      <ExploreHeader onSearchChange={handleSearchChange} />

      {/* MAIN CONTENT */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Bạn bè</h1>
              <p className="text-slate-400">
                {friendRequests.length} lời mời đang chờ • {friends.length} bạn bè
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Bell size={16} />
              <span>Cập nhật tự động</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lời mời ({friendRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'friends'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Bạn bè ({friends.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'requests' ? (
            /* Friend Requests List */
            filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">
                  {searchQuery ? "Không tìm thấy lời mời nào" : "Không có lời mời nào"}
                </h3>
                <p className="text-slate-400">
                  {searchQuery 
                    ? "Thử tìm kiếm với từ khóa khác" 
                    : "Bạn không có lời mời kết bạn nào đang chờ xử lý"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6"
                  >
                    <div className="flex items-start justify-between">
                      
                      {/* User Info */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img 
                            src={request.sender.avatar}
                            alt="avatar" 
                            className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                            <UserPlus size={12} className="text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">
                              {request.sender.firstName} {request.sender.lastName}
                            </h3>
                            {request.sender.skillLevel && (
                              <span className="text-xs font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-tight">
                                {request.sender.skillLevel}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatTimeAgo(request.createdAt)}</span>
                            </div>
                            {request.sender.location?.address && (
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{request.sender.location.address}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleViewProfile(request.sender.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                            >
                              Xem hồ sơ
                            </button>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400">
                              muốn kết bạn với bạn
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons or Status */}
                      <div className="flex items-center gap-3">
                        {requestStatuses[request.id] ? (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm ${
                            requestStatuses[request.id] === 'accepted' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {requestStatuses[request.id] === 'accepted' ? (
                              <>
                                <Check size={16} />
                                Đã chấp nhận
                              </>
                            ) : (
                              <>
                                <X size={16} />
                                Đã từ chối
                              </>
                            )}
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleAcceptRequest(request.id, request.sender.id, request.receiverId)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm"
                            >
                              <Check size={16} />
                              Chấp nhận
                            </button>
                            <button 
                              onClick={() => handleDeclineRequest(request.id)}
                              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-medium text-sm transition-all"
                            >
                              <X size={16} />
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Friends List */
            filteredFriends.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">
                  {searchQuery ? "Không tìm thấy bạn bè nào" : "Chưa có bạn bè nào"}
                </h3>
                <p className="text-slate-400">
                  {searchQuery 
                    ? "Thử tìm kiếm với từ khóa khác" 
                    : "Bắt đầu kết bạn để xem danh sách ở đây"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={friend.avatar}
                          alt="avatar" 
                          className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800">
                            {friend.firstName} {friend.lastName}
                          </h3>
                          {friend.skillLevel && (
                            <span className="text-xs font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-tight">
                              {friend.skillLevel}
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleViewProfile(friend.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                        >
                          Xem hồ sơ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default FriendRequestsPage;

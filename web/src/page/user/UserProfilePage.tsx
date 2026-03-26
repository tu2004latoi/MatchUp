import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Plus, User, Calendar, VenusAndMars, Shield, 
  Settings, Lock, CreditCard, ChevronRight, MapPin, 
  Trophy, Activity, Star, Edit, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import ExploreHeader from '../../component/layout/ExploreHeader';
import { MyUserContext } from '../../config/MyContexts';
import { authApis, endPoints } from '../../config/Apis';
import { useToast } from '../../component/ui/Toast';
import EditProfileModal from '../../component/ui/EditProfileModel';

type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: 'USER' | 'ADMIN';
  avatar: string;
  createdAt: string;
  updatedAt: string;
};

const UserProfilePage = () => {
  const { showToast } = useToast();
  const user = useContext(MyUserContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Determine if this is the current user's profile
  const isOwnProfile = !userId || (user && parseInt(userId) === user.id);
  const targetUserId = isOwnProfile ? user?.id : parseInt(userId || '0');

  useEffect(() => {
    fetchUserProfile();
  }, [userId, user]);

  const fetchUserProfile = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    try {
      const response = await authApis().get(endPoints.users.getUserProfileByUserId.replace('{id}', targetUserId.toString()));
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showToast({
        type: "error",
        title: "Lỗi tải thông tin",
        message: "Không thể tải thông tin người dùng. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Không tìm thấy thông tin người dùng</p>
          <button 
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. SIDEBAR BÊN TRÁI - Only show for own profile */}
      {isOwnProfile && (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto shadow-sm">
          <h2 className="text-xl font-bold mb-1">Dashboard</h2>
          <p className="text-sm text-slate-400 mb-6">Manage your account</p>
          <nav className="space-y-1 flex-1">
            <button className="w-full flex items-center gap-3 p-3.5 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-all">
              <Trophy size={20}/> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 p-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all">
              <User size={20}/> My Profile
            </button>
            <button className="w-full flex items-center gap-3 p-3.5 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-all">
              <Settings size={20}/> Settings
            </button>
            <button className="w-full flex items-center gap-3 p-3.5 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-all">
              <Lock size={20}/> Security
            </button>
          </nav>

          {/* Upgrade Card */}
          <div className="mt-8 bg-blue-50 p-5 rounded-3xl border border-blue-100">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
               <Star size={20} fill="currentColor" />
             </div>
             <h4 className="font-black text-blue-900 text-sm mb-1">Upgrade to PRO</h4>
             <p className="text-[11px] text-blue-600 font-medium mb-4">Get unlimited rooms & advanced AI search.</p>
             <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">Go Premium</button>
          </div>
        </aside>
      )}

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <ExploreHeader />

        {/* PROFILE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Back Button - Only show for other users' profiles */}
            {!isOwnProfile && (
              <button 
                onClick={handleGoBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors mb-4"
              >
                <ArrowLeft size={20} />
                Quay lại
              </button>
            )}
            
            {/* Profile Header Card */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="h-40 bg-gradient-to-r from-slate-900 to-blue-900"></div>
              <div className="px-10 pb-10 flex flex-col md:flex-row items-end gap-6 -mt-12">
                <div className="relative">
                  <img src={profile.avatar} className="w-40 h-40 rounded-[48px] border-8 border-white bg-slate-100 shadow-xl" alt="avatar" />
                  {/* Edit button - Only show for own profile */}
                  {isOwnProfile && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white cursor-pointer hover:scale-110 transition-all shadow-lg shadow-blue-200">
                      <Edit size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'Chưa cập nhật'}</h1>
                    {!isOwnProfile && (
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Người dùng
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><MapPin size={14}/> Đà Nẵng, VN</span>
                  </div>
                </div>
                <div className="flex gap-2 pb-2">
                  {/* Edit Profile Button - Only show for own profile */}
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                      >
                        Edit Profile
                      </button>                   
                      <button className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"><Settings size={22} /></button>
                      <button className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"><MoreHorizontal size={22} /></button>
                    </>
                  ) : (
                    <>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                        Nhắn tin
                      </button>                   
                      <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                        Kết bạn
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Personal Info */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] mb-6">
                      {isOwnProfile ? 'Personal Info' : 'Thông tin cá nhân'}
                    </h3>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Calendar size={20} />
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                               {isOwnProfile ? 'Date of Birth' : 'Ngày sinh'}
                             </div>
                             <div className="text-sm font-bold text-slate-700">{profile.dob || 'Chưa cập nhật'}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <VenusAndMars size={20} />
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                               {isOwnProfile ? 'Gender' : 'Giới tính'}
                             </div>
                             <div className="text-sm font-bold text-slate-700 capitalize">{profile.gender || 'Chưa cập nhật'}</div>
                          </div>
                       </div>
                    </div>
                    {/* Settings buttons - Only show for own profile */}
                    {isOwnProfile && (
                      <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
                         <button className="w-full py-3 px-4 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-between">
                           Change Password <ChevronRight size={14}/>
                         </button>
                         <button className="w-full py-3 px-4 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-between">
                           Privacy Settings <ChevronRight size={14}/>
                         </button>
                      </div>
                    )}
                 </div>
              </div>

              {/* Right: Stats & Activity */}
              <div className="lg:col-span-2 space-y-8">
                 {/* Stats Cards */}
                 <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'Games Played', value: '42', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Point', value: '9.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                         <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon size={20} />
                         </div>
                         <div className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                         <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{stat.label}</div>
                      </div>
                    ))}
                 </div>

                 {/* Recent Activity List */}
                 <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em]">Recent Activity</h3>
                       <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                       {[
                         { match: 'Football Match @ Hòa Xuân', result: 'Won', score: '5 - 2', date: '2 hours ago' },
                         { match: 'Badminton Doubles @ Quận 1', result: 'Lost', score: '18 - 21', date: 'Yesterday' },
                         { match: '3x3 Basketball @ StreetCourt', result: 'Won', score: '21 - 15', date: '3 days ago' },
                       ].map((act, i) => (
                         <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                            <div className="flex items-center gap-4">
                               <div className={`w-2 h-2 rounded-full ${act.result === 'Won' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                               <div>
                                  <div className="text-sm font-bold text-slate-800">{act.match}</div>
                                  <div className="text-[10px] font-medium text-slate-400">{act.date} • {act.result}</div>
                               </div>
                            </div>
                            <div className="text-sm font-black text-slate-800">{act.score}</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </main>
      </div>
      {isEditOpen && (
        <EditProfileModal
            isOpen={isEditOpen}
            profileData={profile}
            onClose={() => setIsEditOpen(false)}
            onSave={async (data) => {
            // TODO: Implement save profile logic
            console.log('Saving profile:', data);
            }}
        />
        )}
    </div>
  );
};

export default UserProfilePage;
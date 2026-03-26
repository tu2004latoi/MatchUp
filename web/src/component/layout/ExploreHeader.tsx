import { useContext, useEffect, useRef, useState } from 'react';
import { Search, Plus, User, Settings, LogOut, DoorClosed, MessageCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import { MyDispatcherContext } from '../../config/MyContexts';
import NotificationPanel from '../ui/NotificationPanel';

type ExploreHeaderProps = {
  onSearchChange?: (value: string) => void;
  onCreateRoomClick?: () => void;
};

const ExploreHeader = ({ onSearchChange, onCreateRoomClick }: ExploreHeaderProps) => {
  const dispatch = useContext(MyDispatcherContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  // Get current path to determine active tab
  const getCurrentPath = () => {
    return location.pathname;
  };

  const isActiveTab = (path: string) => {
    const currentPath = getCurrentPath();
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath === path) return true;
    return false;
  };

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!avatarMenuRef.current) return;
      if (!avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };

    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [avatarMenuOpen]);

  const handleRoom = () => {
    navigate('/joined-rooms');
    setAvatarMenuOpen(false);
  }

  const handleLogout = () => {
    Cookies.remove('token');
    dispatch({ type: 'logout' });
    setAvatarMenuOpen(false);
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  }

  const handleFriends = () => {
    navigate('/friend-requests');
  }

  const handleMessages = () => {
    navigate('/messages');
  }

  const handleProfile = () => {
    navigate('/profile/me');
    setAvatarMenuOpen(false);
  }

  return (
    <header className="h-[80px] bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2 text-2xl font-black text-slate-800 tracking-tighter">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white italic">M</div>
          MatchUp
        </div>
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search rooms or players"
            className="w-full bg-[#F1F5F9] border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <nav className="flex items-center gap-8">
        <div className="flex items-center gap-6 text-sm font-bold text-slate-400 border-r border-slate-100 pr-8 mr-4">
          <a  
            className={`relative transition-all cursor-pointer ${
              isActiveTab('/') ? 'text-blue-600 after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-1 after:bg-blue-600 after:rounded-t-full' : 'hover:text-slate-800'
            }`}
            onClick={handleHome}
          >
            Home
          </a>
          <a 
            className={`transition-all cursor-pointer ${
              isActiveTab('/friend-requests') ? 'text-blue-600 relative after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-1 after:bg-blue-600 after:rounded-t-full' : 'hover:text-slate-800'
            }`}
            onClick={handleFriends}
          >
            Friends
          </a>
          <a 
            className={`transition-all cursor-pointer ${
              isActiveTab('/messages') ? 'text-blue-600 relative after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-1 after:bg-blue-600 after:rounded-t-full' : 'hover:text-slate-800'
            }`}
            onClick={handleMessages}
          >
            <MessageCircle size={16} className="inline mr-1" />
            Messages
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCreateRoomClick}
            className="bg-[#10B981] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-emerald-50 shadow-inner active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Create Room
          </button>
          <div className="p-2.5 text-slate-400 hover:text-slate-800 cursor-pointer relative">
            <NotificationPanel />
          </div>
          <div ref={avatarMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setAvatarMenuOpen((v) => !v)}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-50 cursor-pointer overflow-hidden hover:bg-slate-200 transition-colors"
              aria-haspopup="menu"
              aria-expanded={avatarMenuOpen}
            >
              <User className="text-slate-400" size={24} />
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden" role="menu">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-black text-slate-800 leading-tight">Account</p>
                  <p className="text-xs text-slate-400 font-medium">Manage your profile</p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    role="menuitem"
                    onClick={() => {
                      handleProfile();
                    }}
                  >
                    <User size={18} className="text-slate-400" />
                    Profile
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    role="menuitem"
                    onClick={handleRoom}
                  >
                    <DoorClosed size={18} className="text-slate-400" />
                    Room
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    role="menuitem"
                    onClick={() => setAvatarMenuOpen(false)}
                  >
                    <Settings size={18} className="text-slate-400" />
                    Settings
                  </button>

                  <div className="my-2 h-px bg-slate-100" />

                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-red-600 hover:bg-red-50 transition-colors"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="text-red-500" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ExploreHeader;

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, Chrome, Facebook, Trophy, MessageCircle, Activity, User } from 'lucide-react';
import Apis, { authApis, endPoints } from '../../config/Apis';
import Cookies from 'js-cookie';
import { MyDispatcherContext } from '../../config/MyContexts';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const dispatch = useContext(MyDispatcherContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    try {
      const res = await Apis.post(endPoints.auth.login, formData);
      const token = res.data.token;
      if (token) {
        Cookies.set('token', token, { expires: 7 });
        const userRes = await authApis().get(endPoints.users.getMe);
        console.log(token);
        console.log(userRes.data);
        dispatch({
          type: "login",
          payload: userRes.data,
        });
        navigate("/");
      }
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Tài khoản hoặc mật khẩu không đúng");
        } else if (error.response.status === 404) {
          setError("Tài khoản không tồn tại");
        } else {
          setError("Đăng nhập thất bại. Vui lòng thử lại.");
        }
      } else {
        setError("Lỗi kết nối. Vui lòng kiểm tra mạng.");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      
      <div className="absolute inset-0 bg-[#050a18]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-blue-900 rounded-full blur-[150px]"
        />
      </div>

      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 text-blue-400 opacity-20 hidden lg:block"
      >
        <Trophy size={80} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 text-blue-500 opacity-20 hidden lg:block"
      >
        <MessageCircle size={70} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[450px] p-10 mx-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Activity className="text-white" size={32} strokeWidth={3} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Ready for your next big match?</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2 ml-1">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <a href="#" className="text-xs text-blue-500 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <Eye size={18} />
              </button>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95">
            Jump In
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-white/10"></div>
            <span className="absolute px-4 bg-[#111625] text-xs text-gray-500 uppercase tracking-widest">Or connect with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-all">
              <Chrome size={18} className="text-white" />
              <span className="text-white text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-all">
              <Facebook size={18} className="text-white" />
              <span className="text-white text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          New to MatchUp? <a href="/signup" className="text-blue-500 font-semibold hover:underline">Create Account</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
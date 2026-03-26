import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Chrome,
  Facebook,
  Flag,
  UserCircle,
  VenusAndMars,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Apis, { endPoints } from "../../config/Apis";
import { useToast } from "../../component/ui/Toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    gender: "MALE",
  });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.firstName || !formData.lastName) {
      showToast({
        type: "error",
        title: "Vui lòng nhập đầy đủ thông tin",
        message: "Vui lòng thử lại.",
      });
      return;
    }
    if (formData.password !== confirmPassword) {
      showToast({
        type: "error",
        title: "Mật khẩu xác nhận không khớp",
        message: "Vui lòng thử lại.",
      });
      return;
    }
    try{
      const res = await Apis.post(endPoints.auth.register, formData);
      if (res.data) {
        showToast({
          type: "success",
          title: "Đăng ký thành công",
          message: "Bạn có thể đăng nhập ngay bây giờ.",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900">
        
        <img
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2070"
          alt="Sports Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          
          <div className="flex items-center gap-3 text-3xl font-black text-white italic tracking-tighter">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
              <Flag size={28} strokeWidth={3} />
            </div>
            MatchUp
          </div>

          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black text-white leading-none mb-6 tracking-tight"
            >
              CREATE.
              <br />
              CONNECT.
              <br />
              <span className="text-blue-400">PLAY.</span>
            </motion.h1>

            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Join the ultimate community for sports enthusiasts. Create rooms,
              find partners, and elevate your game today.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[32px] flex items-center gap-4 self-start">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                  className="w-10 h-10 rounded-full border-2 border-blue-900"
                  alt="User"
                />
              ))}
            </div>

            <div>
              <div className="text-white font-bold">+10k Athletes</div>
              <div className="text-blue-300 text-xs">
                Finding matches every day
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Get Started
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Create your account and jump into the action.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm">
              <Chrome size={20} className="text-blue-500" />
              Google
            </button>

            <button className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm">
              <Facebook size={20} className="text-blue-600" />
              Facebook
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className="w-full border-t border-slate-100" />
            <span className="absolute px-4 bg-white text-xs text-slate-400 font-bold uppercase tracking-widest">
              Or with username
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                  First Name
                </label>
                <div className="relative">
                  <UserCircle
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    name="firstName"
                    placeholder="John"
                    className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                  Last Name
                </label>
                <div className="relative">
                  <UserCircle
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    name="lastName"
                    placeholder="Doe"
                    className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                Gender
              </label>
              <div className="relative">
                <VenusAndMars
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  value={formData.gender}
                  onChange={handleChange}
                  name="gender"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all appearance-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  name="username"
                  placeholder="alex_sports"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 rounded-md border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-500 font-medium"
              >
                I agree to the{" "}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] mt-4 text-sm">
              Sign Up
            </button>
          </form>

          <p className="text-center mt-10 text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-bold hover:underline">
              Log In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
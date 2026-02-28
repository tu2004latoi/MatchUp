import { useState, useReducer, useEffect } from 'react'
import './App.css'
import MyUserReducer, { type MyUserState } from './component/reducer/MyUserReducer';
import Cookies from 'js-cookie';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { authApis, endPoints } from './config/Apis.ts';
import { MyDispatcherContext, MyUserContext } from './config/MyContexts.ts';
import { ToastProvider } from './component/ui/Toast';
import LoginPage from './page/auth/LoginPage.tsx';
import MatchUpExplore from './page/user/MatchUpExplorePage.tsx';
import SignUpPage from './page/auth/SignUpPage.tsx';

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null as MyUserState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get("token");
      
      const finalToken = token;
      
      if (finalToken && finalToken !== "undefined" && finalToken !== "null") {
        try {
          if (finalToken.length < 10) {
            Cookies.remove("token");
            dispatch({
              type: "logout",
              payload: null,
            });
            setLoading(false);
            return;
          }
          
          const res = await authApis().get(endPoints.users.getMe);
          dispatch({
            type: "login",
            payload: res.data,
          });
        } catch (err) {
          console.error("Lỗi load user từ token:", err);
          Cookies.remove("token");
          dispatch({
            type: "logout",
            payload: null,
          });
        }
      } else {
        dispatch({
          type: "logout",
          payload: null,
        });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600 font-semibold">Loading...</p>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <MyUserContext.Provider value={user}>
        <MyDispatcherContext.Provider value={dispatch}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<MatchUpExplore />} />
              <Route path="/signup" element={<SignUpPage />} />
            </Routes>
          </BrowserRouter>
        </MyDispatcherContext.Provider>
      </MyUserContext.Provider>
    </ToastProvider>
  );
}

export default App

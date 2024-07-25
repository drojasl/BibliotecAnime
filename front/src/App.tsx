// App.js
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LiveScreen } from "./routes/LiveScreen";
import ExploreScreen from "./routes/ExploreScreen";
import VideoUploadScreen from "./routes/VideoUploadScreen";
import ProfileScreen from "./routes/profile";
import LogInScreen from "./routes/LogInView";
import PrivateRoute from "./components/PrivateRoute";
import './index.css';

const App = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      <section className="layout h-[100vh] md:flex">
        {!isLoginRoute && (
          <header className="head h-[10%] md:h-[100%] flex justify-start relative w-[6vw]">
            <div className="justify-between fixed h-[100vh] absolute z-[11]">
              <Navbar />
            </div>
          </header>
        )}
        <main className="main h-[90%] md:h-[100%] w-full z-[50]">
          <Routes>
            <Route path='/' element={<LiveScreen />} />
            <Route path='/live' element={<LiveScreen />} />
            <Route path='/explore' element={<ExploreScreen />} />
            <Route path='/upload' element={<PrivateRoute><VideoUploadScreen /></PrivateRoute>} />
            <Route path='/profile/:username' element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
            <Route path='/login' element={<LogInScreen />} />
            <Route path='/signup' element={<LogInScreen />} />
            <Route path='/*' element={<Navigate to='/' />} />
          </Routes>
        </main>
      </section>
    </>
  );
}

export default App;

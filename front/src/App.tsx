import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LiveScreen } from "./routes/LiveScreen";
import ExploreScreen from "./routes/ExploreScreen";
import VideoUploadScreen from "./routes/VideoUploadScreen";
import ProfileScreen from "./routes/profile";
import LogInScreen from "./routes/LogInView";
import './index.css';

const App = () => {
  const location = useLocation();

  const isLoginRoute = location.pathname === "/login" || location.pathname === "/signUp";

  return (
    <>
      <section className="layout h-[100vh] flex p-3">
        {!isLoginRoute && (
          <header className="head h-[100%] flex justify-start">
            <Navbar />
          </header>
        )}
        <main className="main h-[100%] w-full">
          <Routes>
            <Route path='/' element={ <LiveScreen /> } />
            <Route path='/live' element={ <LiveScreen /> } />
            <Route path='/explore' element={ <ExploreScreen /> } />
            <Route path='/upload' element={ <VideoUploadScreen /> } />
            <Route path='/profile' element={ <ProfileScreen /> } />
            <Route path='/login' element={ <LogInScreen /> } />
            <Route path='/signup' element={ <LogInScreen /> } />
            <Route path='/*' element={ <Navigate to='/' /> } />
          </Routes>
        </main>
      </section>
    </>
  );
}

export default App;

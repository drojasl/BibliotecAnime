// App.js
import { Route, Routes, useLocation } from "react-router-dom";
import { useState } from "react";
import LogInScreen from "./views/LogInView";
import { LiveScreen } from "./views/LiveScreen";
import PlaylistScreen from "./views/PlaylistScreen";
import PlaylistsScreen from "./views/PlaylistsScreen";
import VideoUploadScreen from "./views/VideoUploadScreen";
import ExploreScreen from "./views/ExploreScreen";
import ProfileScreen from "./views/ProfileScreen";
import MenuMobile from "./components/MenuMobile";
import { NavbarLeft } from "./components/LateralNavBarLeft";
import { NavbarRight } from "./components/LateralNavBarRight";
import FloatingPlayer from "./components/FloatingPlayer";
import PrivateRoute from "./components/PrivateRoute";
import { VideoProvider } from "./VideoContext";
import { UserProvider } from "./UserContext";
import Icon from "@mdi/react";
import { mdiMenu } from "@mdi/js";
import "./index.css";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";

const App = () => {
  const location = useLocation();
  const [openMenuMobile, setOpenMenuMobile] = useState(false);

  const isLoginRoute =
    location.pathname === "/login" || location.pathname === "/signup";

  // Determine if the current route is LiveScreen
  const isLiveScreen =
    location.pathname === "/live" || location.pathname === "/";

  return (
    <UserProvider>
      <VideoProvider>
        <div className="md:h-auto md:flex relative">
          <div className="block md:hidden">
            <div
              className="absolute top-5 left-5 z-[100] cursor-pointer text-white"
              onClick={() => setOpenMenuMobile(!openMenuMobile)}
            >
              <Icon path={mdiMenu} size={1} />
            </div>
            {openMenuMobile && (
              <ClickAwayListener onClickAway={() => setOpenMenuMobile(false)}>
                <div>
                  <MenuMobile />
                </div>
              </ClickAwayListener>
            )}
          </div>

          {!isLoginRoute && (
            <div
              className="hidden md:block sm:sticky top-0 p-2 z-[1]"
              style={{ height: `calc(100vh - 1rem)` }}
            >
              <NavbarLeft />
            </div>
          )}
          <div className="flex flex-col w-full relative md:m-2 md:h-[calc(100vh-1rem)] h-screen">
            {!isLiveScreen && <FloatingPlayer />}
            <div className="flex-grow rounded-b-xl md:rounded-b-[0]">
              <Routes>
                <Route path="/login" element={<LogInScreen />} />
                <Route path="/" element={<LiveScreen />} />
                <Route path="/live" element={<LiveScreen />} />
                <Route path="/explore" element={<ExploreScreen />} />
                <Route path="/playlists" element={<PlaylistsScreen />} />
                <Route path="/playlist/:token" element={<PlaylistScreen />} />
                <Route
                  path="/upload"
                  element={
                    <PrivateRoute>
                      <VideoUploadScreen />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <PrivateRoute>
                      <ProfileScreen />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
            <div className="md:hidden">
              <NavbarRight />
            </div>
          </div>
          {!isLoginRoute && (
            <div
              className="hidden md:flex sticky top-0 p-2 z-[1]"
              style={{ height: `calc(100vh - 1rem)` }}
            >
              <NavbarRight />
            </div>
          )}
        </div>
      </VideoProvider>
    </UserProvider>
  );
};

export default App;

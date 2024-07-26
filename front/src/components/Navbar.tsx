import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import logo from "../../public/logo.png";
import Icon from '@mdi/react';
import { useNavigate } from "react-router-dom";

import {
  mdiPlayCircleOutline,
  mdiEarth,
  mdiLogin,
  mdiPlusCircleOutline,
  mdiAccount,
  mdiMenu
} from "@mdi/js";

export const Navbar = () => {
  const [isLogedUser, setIsLogedUser] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Nuevo estado
  const [nickName, setNickName] = useState('');
  const loggedUserString = localStorage.getItem("loggedUser");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");
    if (loggedUserString) {
      setIsLogedUser(true);
    }
  }, []);

  useEffect(() => {
    if (loggedUserString) {
      const loggedUser = JSON.parse(loggedUserString);
      setIsLogedUser(true);
      setNickName(loggedUser.nick_name);
    }
  }, [loggedUserString]);

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setIsLogedUser(false);
    setNickName('');
    setShowProfileMenu(false);
    navigate("/explore");
  };

  return (
    <>
      <div className="hidden w-[100%] h-[100%] md:w-auto md:flex-col justify-between p-3 md:flex fixed">
        <div>
          <img src={logo} className="w-[4em]" alt="Logo" />
        </div>
        <div className="rounded-full p-2 max-w-min">
          <div className="my-3 max-w-min">
            <Link
              to="/"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1"
              data-tooltip-id="toolTip"
              data-tooltip-content="For you"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d={mdiPlayCircleOutline} />
              </svg>
            </Link>
          </div>
          <div className="my-3">
            <Link
              to="/Explore"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1"
              data-tooltip-id="toolTip"
              data-tooltip-content="Explore"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d={mdiEarth} />
              </svg>
            </Link>
          </div>
        </div>
        <div>
          {isLogedUser && (
            <div
              className="rounded-full p-2 mb-3 hover:cursor-pointer max-w-min"
              style={{ backgroundColor: "#483ea8", height: "fit-content" }}
              data-tooltip-id="toolTip"
              data-tooltip-content="Add song"
            >
              <Link
                to="/upload"
                className="text-white rounded-full flex justify-center items-center p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d={mdiPlusCircleOutline} />
                </svg>
              </Link>
            </div>
          )}
          {!isLogedUser ? (
            <Link
              to="/login"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1 max-w-min"
            >
              <div
                className="rounded-full p-2"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  height: "fit-content",
                }}
                data-tooltip-id="toolTip"
                data-tooltip-content="Log in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d={mdiLogin} />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="relative" style={{ zIndex: 1000 }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="hover:bg-white hover:bg-opacity-50 relative text-white rounded-full flex justify-center items-center p-1 max-w-min"
              >
                <div
                  className="rounded-full p-2 hover:cursor-pointer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    height: "fit-content",
                  }}
                  data-tooltip-id="toolTip"
                  data-tooltip-content="Profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path d={mdiAccount} />
                  </svg>
                </div>
              </div>
              {showProfileMenu && (
                <div className="absolute bg-white text-black rounded shadow-lg mt-1 bottom-[5em] whitespace-nowrap" >
                  <Link
                    to={`/profile/${nickName}`}
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Ir al perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Cerrar sesión
                  </button>
                </div>

              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex w-[100%] justify-between p-3 md:hidden items-center w-[100vw]">
        <img src={logo} className="w-[5em]" alt="Logo" />
        <div onClick={() => setShowMobileMenu(!showMobileMenu)} className="z-[1]" >
          <Icon path={mdiMenu} size={1} className={showMobileMenu ? 'text-white' : 'text-white'} />
        </div>
      </div>

      {showMobileMenu && (
        <div className="bg-white h-[100vh] w-[100vw] ">
          <div className="flex flex-col items-start p-5">
            <Link to="/" className="my-2" onClick={() => setShowMobileMenu(false)}>
              Home
            </Link>
            <Link to="/Explore" className="my-2" onClick={() => setShowMobileMenu(false)}>
              Explore
            </Link>
            {isLogedUser && (
              <Link to="/upload" className="my-2" onClick={() => setShowMobileMenu(false)}>
                Add song
              </Link>
            )}
            {!isLogedUser ? (
              <Link to="/login" className="my-2" onClick={() => setShowMobileMenu(false)}>
                Log in
              </Link>
            ) : (
              <Link to={`/profile/${nickName}`} className="my-2" onClick={() => setShowMobileMenu(false)}>
                Profile
              </Link>
            )}
          </div>
        </div>
      )}

      <Tooltip
        id="toolTip"
        place="top"
        style={{
          backgroundColor: "white",
          color: "black",
          fontSize: "14px",
          zIndex: "10",
        }}
      />
    </>
  );
};

import { useUser } from "../UserContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiBell,
  mdiChevronDown,
  mdiAccount,
  mdiLogout,
  mdiViewCarousel,
  mdiViewGrid,
  mdiMusicBox,
} from "@mdi/js";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";

const MenuMobile = () => {
  const navigate = useNavigate();
  const { nick_name, clearUser } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const handleIconClick = (index: any) => {
    setActiveMenuIndex(index);
  };

  return (
    <div className="z-[200] absolute bottom-0 bg-[#18181B] w-full p-5 rounded-t-2xl flex flex-col gap-10">
      <div
        className={`items-center gap-2 w-full flex justify-between flex flex-col flex-col-reverse`}
      >
        <div
          className="relative cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-[#2E2F34] h-full rounded-full flex px-2 py-1 items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(!showProfileMenu);
            }}
          >
            <div
              className={`bg-black rounded-full p-2 text-white cursor-pointer flex items-center`}
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="currentColor"
              >
                <path d={mdiAccount} />
              </svg>
            </div>
            <div className="text-white flex items-center gap-2">
              <div>
                <p className="text-[0.9em] font-bold">{nick_name}</p>
              </div>
              <div>
                <Icon path={mdiChevronDown} size={0.8} />
              </div>
            </div>
          </div>
          {showProfileMenu && (
            <ClickAwayListener onClickAway={() => setShowProfileMenu(false)}>
              <div className="absolute bg-[#212122] mt-2 rounded-md min-w-full right-0 z-[10] text-white shadow-xl">
                <div
                  className="p-2 rounded-t-md flex items-center gap-2 hover:bg-[#141417]"
                  onClick={() => {
                    setShowProfileMenu(false),
                      navigate(`/profile/${nick_name}`);
                  }}
                >
                  <Icon path={mdiAccount} size={0.7} />
                  <p>Profile</p>
                </div>

                <div
                  className="p-2 rounded-b-md flex items-center gap-2 hover:bg-[#141417] cursor-pointer"
                  onClick={handleLogout}
                >
                  <Icon path={mdiLogout} size={0.7} />
                  <p className="whitespace-nowrap">Log out</p>
                </div>
              </div>
            </ClickAwayListener>
          )}
        </div>
        {
          <div
            className={`bg-[#2E2F34] rounded-full p-2 text-white cursor-pointer`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d={mdiBell} />
            </svg>
          </div>
        }
      </div>
      <div className="grid gap-4 mb-20">
        <Link
          to="/"
          data-tooltip-id="toolTip"
          data-tooltip-content="For you"
          onClick={() => handleIconClick(0)}
        >
          <div
            className={`bg-[#2E2F34] rounded-lg p-2 ${
              activeMenuIndex === 0 ? "opacity-100" : "opacity-50 bg-opacity-0"
            } hover:opacity-100 text-white cursor-pointer flex items-center gap-4`}
          >
            <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
              <path d={mdiViewCarousel} />
            </svg>
            <p className="font-bold">Feed</p>
          </div>
        </Link>

        <Link
          to="/Explore"
          data-tooltip-id="toolTip"
          data-tooltip-content="Explore"
          onClick={() => handleIconClick(1)}
        >
          <div
            className={`bg-[#2E2F34] rounded-lg p-2 ${
              activeMenuIndex === 1 ? "opacity-100" : "opacity-50 bg-opacity-0"
            } hover:opacity-100 text-white cursor-pointer flex items-center gap-4`}
          >
            <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
              <path d={mdiViewGrid} />
            </svg>
            <p className="font-bold">Explorer</p>
          </div>
        </Link>

        <Link
          to="/Playlists"
          data-tooltip-id="toolTip"
          data-tooltip-content="Playlists"
          onClick={() => handleIconClick(2)}
        >
          <div
            className={`bg-[#2E2F34] rounded-lg p-2 ${
              activeMenuIndex === 2 ? "opacity-100" : "bg-opacity-0 opacity-50"
            } hover:opacity-100 text-white cursor-pointer flex items-center gap-4`}
          >
            <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
              <path d={mdiMusicBox} />
            </svg>
            <p className="font-bold">Your Playlists</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MenuMobile;

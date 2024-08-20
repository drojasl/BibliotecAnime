import { useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import logo from "../../public/logo.png";
import { useUser } from "../UserContext";

import { mdiViewCarousel, mdiViewGrid, mdiMusicBox, mdiPlus } from "@mdi/js";

export const NavbarLeft = () => {
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const { user_id } = useUser();

  const handleIconClick = (index: any) => {
    setActiveMenuIndex(index);
  };

  return (
    <>
      {/* MENU DESKTOP VIEW */}
      <div
        className="flex-col justify-between p-3 sm:flex bg-[#18181B] rounded-xl justify-center"
        style={{ height: `calc(100vh - 1rem)` }}
      >
        {/* LOGO */}
        <div className="flex justify-center">
          <img src={logo} className="w-[3em]" alt="Logo" />
        </div>
        {/* MENU */}
        <div className="p-2 grid gap-4">
          <Link
            to="/"
            data-tooltip-id="toolTip"
            data-tooltip-content="For you"
            onClick={() => handleIconClick(0)}
          >
            <div
              className={`bg-[#2E2F34] rounded-full p-2 ${
                activeMenuIndex === 0 ? "opacity-100" : "opacity-50"
              } hover:opacity-100 text-white cursor-pointer`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d={mdiViewCarousel} />
              </svg>
            </div>
          </Link>

          <Link
            to="/Explore"
            data-tooltip-id="toolTip"
            data-tooltip-content="Explore"
            onClick={() => handleIconClick(1)}
          >
            <div
              className={`bg-[#2E2F34] rounded-full p-2 ${
                activeMenuIndex === 1 ? "opacity-100" : "opacity-50"
              } hover:opacity-100 text-white cursor-pointer`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d={mdiViewGrid} />
              </svg>
            </div>
          </Link>

          <Link
            to="/Playlists"
            data-tooltip-id="toolTip"
            data-tooltip-content="Playlists"
            onClick={() => handleIconClick(2)}
          >
            <div
              className={`bg-[#2E2F34] rounded-full p-2 ${
                activeMenuIndex === 2 ? "opacity-100" : "opacity-50"
              } hover:opacity-100 text-white cursor-pointer`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d={mdiMusicBox} />
              </svg>
            </div>
          </Link>
        </div>
        {/* ADD SONG */}
        <div
          className="flex justify-center"
          data-tooltip-id="toolTip"
          data-tooltip-content="Add Song"
        >
          {user_id !== 0 && (
            <Link to="/upload">
              <div className="rounded-full p-2 cursor-pointer bg-[#1A50FA] text-white">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d={mdiPlus} />
                </svg>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* TOOLTIP */}
      <div>
        <Tooltip
          id="toolTip"
          place="right"
          style={{
            backgroundColor: "white",
            color: "black",
            fontSize: "12px",
          }}
        />
      </div>
    </>
  );
};

import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import Icon from "@mdi/react";
import { useNavigate } from "react-router-dom";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import axios from "../axios";
import { useVideoContext } from "../VideoContext";
import { useUser } from "../UserContext";
import { CreatePlaylist } from "../components/CreatePlaylist";

import {
  mdiBell,
  mdiArrowCollapseRight,
  mdiChevronDown,
  mdiAccount,
  mdiMusicBoxMultiple,
  mdiPlay,
  mdiVideo,
  mdiMusicNotePlus,
  mdiLogout,
} from "@mdi/js";

export const NavbarRight: React.FC = () => {
  const { user_id, nick_name, clearUser } = useUser();
  const { playlist, playlists, token } = useVideoContext();

  const navigate = useNavigate();
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, [user_id, playlist, token, playlists]);

  const fetchPlaylists = async () => {
    if (user_id > 0) {
      try {
        const response = await axios.get(`/getUserPlaylists`, {
          params: {
            user_id: user_id,
          },
        });
        setUserPlaylists(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error en la solicitud GET", error);
      }
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const handlePlaylistClick = (token: string) => {
    navigate(`/playlist/${token}`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePlaylistCreated = () => {
    fetchPlaylists();
  };
  return (
    <>
      {/* MENU DESKTOP VIEW */}
      <div
        className={`hidden md:flex-col p-3 md:flex bg-[#18181B] rounded-xl justify-start gap-4 ${
          openMenu ? "cursor-auto" : "cursor-pointer"
        }`}
        style={{ height: `calc(100vh - 1rem)` }}
        onClick={() => {
          if (openMenu === false) {
            setOpenMenu(true);
          }
        }}
      >
        <div className={`${openMenu ? "flex" : "block"}`}>
          {openMenu && (
            <div
              className="flex items-center text-white mr-[3vw] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(false);
              }}
            >
              <Icon path={mdiArrowCollapseRight} size={0.6} />
            </div>
          )}
          <div
            className={`items-center gap-2 ${
              openMenu ? "flex" : "flex flex-col flex-col-reverse"
            }`}
          >
            {
              <div
                className={`bg-[#2E2F34] rounded-full p-2 text-white cursor-pointer`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="currentColor"
                >
                  <path d={mdiBell} />
                </svg>
              </div>
            }
            <div
              className="relative cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {openMenu ? (
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
              ) : (
                <div
                  className={`bg-[#2E2F34] rounded-full p-2 text-white cursor-pointer flex items-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
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
              )}
              {showProfileMenu && (
                <ClickAwayListener
                  onClickAway={() => setShowProfileMenu(false)}
                >
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
          </div>
        </div>
        <hr className="opacity-10" />
        <div className="text-white flex flex-col gap-4">
          <div
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              {" "}
              <Icon path={mdiMusicBoxMultiple} size={0.8} />
              {openMenu && <p className="font-bold text-[1.2em]">Playlists</p>}
            </div>
            <div className="flex items-center">
              <p className="text-[0.8em] opacity-50">{userPlaylists?.length}</p>
            </div>
          </div>
          {userPlaylists?.map((playlist: any) => (
            <div
              key={playlist.id}
              className="bg-[#2E2F34] rounded-md p-2 flex items-center justify-between cursor-pointer"
              onClick={() => handlePlaylistClick(playlist.token)}
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-md relative flex items-center justify-center">
                  {playlist?.cover ? (
                    <img
                      src={playlist?.cover}
                      alt="Cover"
                      className="rounded-md object-cover h-full w-full"
                    />
                  ) : (
                    <img
                      src="/PlaylistImg.jpg"
                      alt="Default Cover"
                      className="rounded-md w-full h-full object-cover"
                    />
                  )}
                  <div className="bg-black bg-opacity-50 w-full h-full rounded-md absolute flex items-center justify-center">
                    <Icon path={mdiPlay} size={1} />
                  </div>
                </div>

                {openMenu && (
                  <div>
                    <p className="font-bold">{playlist?.name}</p>
                    <div className="flex items-center opacity-50 gap-1">
                      <Icon path={mdiVideo} size={0.6} />
                      <p className="text-[0.8em]">
                        {playlist?.video_count} Videos
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {openMenu && (
                <div>
                  <Icon path={mdiMusicNotePlus} size={0.8} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex p-4 md:hidden text-white gap-4">
        <div className="flex flex-col justify-center items-center gap-4">
          <Icon path={mdiMusicBoxMultiple} size={0.8} />
          <p className="text-[0.8em] opacity-50">{userPlaylists?.length}</p>
        </div>
        <div>
          {userPlaylists.length ? (
            userPlaylists?.map((playlist: any) => (
              <div
                key={playlist.id}
                className="bg-[#2E2F34] rounded-md p-2 flex items-center justify-between cursor-pointer"
                onClick={() => handlePlaylistClick(playlist.token)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="relative flex items-center justify-center rounded-md overflow-hidden"
                    style={{ width: "15vw", height: "15vw" }}
                  >
                    {playlist?.cover ? (
                      <img
                        src={playlist?.cover}
                        alt="Cover"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <img
                        src="/PlaylistImg.jpg"
                        alt="Default Cover"
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="bg-black bg-opacity-50 absolute inset-0 flex items-center justify-center">
                      <Icon path={mdiPlay} size={1} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="relative flex items-center justify-center rounded-md bg-gray-50 text-black cursor-pointer"
              style={{ width: "15vw", height: "15vw" }}
              onClick={handleOpenModal}
            >
              <Icon path={mdiMusicNotePlus} size={1} />
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <CreatePlaylist
          onClose={handleCloseModal}
          onSuccess={handlePlaylistCreated}
        />
      )}
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

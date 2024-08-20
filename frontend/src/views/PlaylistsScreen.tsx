import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { mdiMagnify, mdiChevronRight } from "@mdi/js";
import axios from "../axios";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { CreatePlaylist } from "../components/CreatePlaylist";
import { Link } from "react-router-dom";
import { useVideoContext } from "../VideoContext";
import { useUser } from "../UserContext";

const PlaylistsScreen = () => {
  const { user_id } = useUser();

  const { playlists, setPlaylists } = useVideoContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVideo, setSearchVideo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVideos = playlists?.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user_id > 0) {
      getPlaylists(user_id);
    }
  }, []);

  const getPlaylists = async (userId: any = null) => {
    try {
      const response = await axios.get(`/getUserPlaylists`, {
        params: {
          user_id: userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error("Error en la solicitud GET", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePlaylistCreated = () => {
    getPlaylists(user_id);
  };

  return (
    <div className="text-white bg-[#18181B] rounded-xl p-2 relative h-[85vh] md:h-[calc(100vh-1rem)] overflow-auto pt-10">
      <div className="grid grid-cols-12 gap-4">
        <div className={`col-span-12 flex flex-wrap`}>
          <div className="flex items-center justify-between w-full mb-4">
            <p className="font-bold text-[2.5em] w-full">Your Playlists</p>
            <ClickAwayListener onClickAway={() => setSearchVideo(false)}>
              <div
                className={`bg-[#2E2F34] rounded-full p-2 text-white cursor-pointer ${
                  searchVideo ? "w-full" : "w-auto"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchVideo(true);
                }}
              >
                {!searchVideo ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                  >
                    <path d={mdiMagnify} />
                  </svg>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon path={mdiMagnify} size={0.7} className="opacity-50" />
                    <input
                      type="text"
                      className="bg-transparent w-full border-none outline-none text-white"
                      placeholder="What playlist do you want to listen to today?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchVideo(false);
                      }}
                      className="opacity-50 cursor-pointer"
                    >
                      <Icon path={mdiChevronRight} size={0.8} />
                    </div>
                  </div>
                )}
              </div>
            </ClickAwayListener>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div
              className="md:h-[15em] md:w-[15em] relative"
              onClick={handleOpenModal}
            >
              <img
                src="../../public/MusicWaves.png"
                className="object-cover h-full w-full rounded-lg"
              />
              <div className="h-full w-full bg-black bg-opacity-50 rounded-lg absolute top-0 flex items-center justify-center p-2 cursor-pointer">
                <div className="float-bottom">
                  <p className="font-bold">Create Playlist</p>
                </div>
              </div>
            </div>
            {Array.isArray(filteredVideos) &&
              filteredVideos.map((playlist: any, index: any) => (
                <Link to={`/playlist/${playlist?.token}`} key={index}>
                  <div className="md:h-[15em] md:w-[15em] relative">
                    <img
                      src={playlist?.cover}
                      className="object-cover h-full w-full rounded-lg"
                    />
                    <div className="h-full w-full bg-black bg-opacity-50 rounded-lg absolute top-0 flex flex-col justify-end p-2 cursor-pointer">
                      <div className="float-bottom">
                        <p className="font-bold">{playlist?.name}</p>
                        <p className="opacity-50 text-[0.9em]">
                          {playlist?.video_count} Videos
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CreatePlaylist
          onClose={handleCloseModal}
          onSuccess={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default PlaylistsScreen;

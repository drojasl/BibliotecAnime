import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "../axios";
import Icon from "@mdi/react";
import {
  mdiPencil,
  mdiMinusCircleOutline,
  mdiExportVariant,
  mdiAlertCircle,
  mdiWhatsapp,
  mdiEmailOutline,
} from "@mdi/js";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { Tooltip } from "react-tooltip";
import Slider from "@mui/material/Slider";
import { useVideoContext } from "../VideoContext";
import { useNavigate } from "react-router-dom";

import {
  mdiVideo,
  mdiDotsHorizontal,
  mdiReorderHorizontal,
  mdiPause,
  mdiSkipNext,
  mdiRepeatVariant,
  mdiSkipPrevious,
  mdiShuffleVariant,
  mdiVolumeMedium,
  mdiVolumeVariantOff,
  mdiPlay,
  mdiVolumeHigh,
} from "@mdi/js";

const PlaylistScreen: React.FC = () => {
  const {
    playlist,
    float,
    currentVideo,
    currentTime,
    currentVideoIndex,
    isPlaying,
    setCurrentVideoIndex,
    setCurrentVideo,
    setCurrentTime,
    setPlaylist,
    setIsPlaying,
    setFloat,
    setToken,
  } = useVideoContext();

  const { token } = useParams();
  const [playPlaylist, setPlayPlaylist] = useState(false);
  const [videosPlaylist, setVideosPlaylist] = useState<any>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showPlaylistOptions, setShowPlaylistOptions] = useState(false);
  const [confirmationPlaylist, setConfirmationPlaylist] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(false);
  const [sharePlaylistOptions, setSharePlaylistOptions] = useState(false);
  const [newPlaylistPic, setNewPlaylistPic] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [urlShare, setUrlShare] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setToken(token || "");

    getPlaylistData();
  }, [token]);

  const getPlaylistData = async () => {
    if (token) {
      try {
        const response = await axios.get(`/getPlaylist/${token}`);
        setVideosPlaylist(response.data.videos);
        setPlaylist(response.data);
      } catch (err: any) {
        console.log(err.response?.data?.error || "An error occurred");
      }
    }
  };

  useEffect(() => {
    if (float == false && isPlaying == true) {
      setPlayPlaylist(true);
      if (videoRef.current && currentVideo) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [float, playPlaylist, isPlaying]);

  useEffect(() => {
    if (videosPlaylist) {
      const video = videosPlaylist[currentVideoIndex] || {};
      setCurrentVideo(video);
    }
  }, [videosPlaylist, currentVideoIndex]);

  useEffect(() => {
    const updateVideoOrder = async () => {
      try {
        await axios.post(`/updatePlaylistOrder/${token}`, {
          videos: playlist.videos.map((video: any) => video.id),
        });
      } catch (err: any) {
        console.log(
          err.response?.data?.error || "An error occurred while updating order"
        );
      }
    };

    if (playlist && draggedItemIndex === null) {
      updateVideoOrder();
    }
  }, [draggedItemIndex]);

  const handleVolumeChange = (e: any) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedItemIndex === null) return;

    const newPlaylist = [...playlist.videos];
    const draggedItem = newPlaylist[draggedItemIndex];
    newPlaylist.splice(draggedItemIndex, 1);
    newPlaylist.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setPlaylist({ ...playlist, videos: newPlaylist });
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex: number) => {
      return prevIndex < playlist?.videos.length - 1 ? prevIndex + 1 : 0;
    });
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prevIndex: number) => {
      return prevIndex > 0 ? prevIndex - 1 : playlist?.videos.length - 1;
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePlaylistPicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        console.log("Long Size");
        return;
      }

      const base64String = await convertFileToBase64(file);
      setNewPlaylistPic(base64String);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const updatePlaylist = async () => {
    try {
      await axios.put(`/playlists/update/${token}`, {
        cover: newPlaylistPic ? newPlaylistPic : playlist.cover,
        name: newPlaylistName ? newPlaylistName : playlist.name,
      });

      getPlaylistData();
      setEditPlaylist(false);
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const deletePlaylist = async () => {
    try {
      await axios.delete(`/playlists/deletePlaylist/${token}`);

      getPlaylistData();
      setToken("");
      setConfirmationPlaylist(false);
      navigate("/playlists");
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const sharePlaylist = async () => {
    try {
      const response = await axios.get(`/playlists/share/${token}`);

      if (response.data.success) {
        setSharePlaylistOptions(true);
        setUrlShare(response.data.link);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className="text-white bg-[#18181B] rounded-xl p-10 overflow-y-auto"
      style={{ height: `calc(100vh - 1rem)`, maxHeight: `calc(100vh - 1rem)` }}
    >
      <div className="flex gap-4">
        <div className="h-[15em] w-[15em] rounded-md">
          {editPlaylist ? (
            <div className="relative w-full h-full">
              <label
                htmlFor="playlistPicUpload"
                className="cursor-pointer h-full w-full rounded-md"
              >
                <input
                  type="file"
                  id="playlistPicUpload"
                  accept="image/*"
                  className="absolute inset-0 opacity-0"
                  onChange={handlePlaylistPicChange}
                />
                {newPlaylistPic ? (
                  <div className="relative w-full h-full rounded-md">
                    <img
                      src={newPlaylistPic}
                      alt="Default Cover"
                      className="rounded-md w-full h-full object-cover bg-grey-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-md bg-black bg-opacity-20 hover:bg-opacity-70 transition-opacity duration-300">
                      <Icon path={mdiPencil} size={1} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-md bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity duration-300">
                    <Icon path={mdiPencil} size={1} className="text-white" />
                  </div>
                )}
              </label>
            </div>
          ) : playlist?.cover ? (
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
        </div>
        <div className="justify-center flex flex-col gap-4">
          <div>
            {editPlaylist ? (
              <input
                type="text"
                className="py-1 px-3 rounded-md bg-[#2E2F34] font-bold text-[2em] w-fit mb-2"
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            ) : (
              <h1 className="font-bold text-[2.5em]">{playlist?.name}</h1>
            )}
            <div className="flex items-center opacity-50 gap-1">
              <Icon path={mdiVideo} size={0.6} />
              <p className="text-[0.8em]">{playlist?.video_count} Videos</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button
              className={`rounded-md py-2 px-8 bg-[#1A50FA] w-fit`}
              onClick={() => {
                if (editPlaylist == true) {
                  updatePlaylist();
                } else if (playlist?.videos.length) {
                  setPlayPlaylist(true);
                  setFloat(false);
                  setIsPlaying(true);
                } else {
                  navigate("/Explore");
                }
              }}
            >
              {!editPlaylist
                ? playlist?.videos.length
                  ? "Play"
                  : "Add Songs"
                : "Save"}
            </button>
            {editPlaylist && (
              <button
                className={`rounded-md py-2 px-8 bg-[#FF2727] w-fit`}
                onClick={() => {
                  setNewPlaylistPic(""),
                    setNewPlaylistName(""),
                    setEditPlaylist(false);
                }}
              >
                Cancel
              </button>
            )}
            {!editPlaylist && (
              <div className="relative">
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistOptions(true);
                  }}
                >
                  <Icon path={mdiDotsHorizontal} size={1} />
                </div>
                {showPlaylistOptions && (
                  <ClickAwayListener
                    onClickAway={() => setShowPlaylistOptions(false)}
                  >
                    <div className="absolute bg-[#212122] mt-2 rounded-md min-w-fit left-0 z-[10] text-white shadow-xl">
                      <div
                        className="p-2 rounded-t-md flex items-center gap-2 hover:bg-[#141417] cursor-pointer"
                        onClick={() => {
                          setShowPlaylistOptions(false), setEditPlaylist(true);
                        }}
                      >
                        <Icon path={mdiPencil} size={0.7} />
                        <p>Edit Playlist</p>
                      </div>
                      <div
                        className="p-2 flex items-center gap-2 hover:bg-[#141417] cursor-pointer"
                        onClick={() => sharePlaylist()}
                      >
                        <Icon path={mdiExportVariant} size={0.7} />
                        <p className="whitespace-nowrap">Share Playlist</p>
                      </div>
                      <div
                        className="p-2 rounded-b-md flex items-center gap-2 hover:bg-[#141417] cursor-pointer"
                        onClick={() => {
                          setShowPlaylistOptions(false),
                            setConfirmationPlaylist(true);
                        }}
                      >
                        <Icon path={mdiMinusCircleOutline} size={0.7} />
                        <p className="whitespace-nowrap">Delete Playlist</p>
                      </div>
                    </div>
                  </ClickAwayListener>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {playlist?.videos.length ? (
        <div className="mt-10 flex flex-col overflow-y-auto h-fit">
          <p className="font-bold text-[1.2em]">Songs</p>
          <div className="flex flex-col gap-4">
            {/* <!-- HEADER --> */}
            <div className="grid grid-cols-12 gap-4 opacity-50">
              <div className="col-span-1"></div>
              <div className="col-span-8">Name</div>
              <div className="col-span-2">Language</div>
              <div className="col-span-1"></div>
            </div>
            {/* <!-- SONGS --> */}
            {playlist?.videos.map((video: any, index: number) => (
              <div
                key={video.id}
                className="grid grid-cols-12 items-center gap-4"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
              >
                <div className="col-span-1">
                  <Icon path={mdiReorderHorizontal} size={0.8} />
                </div>
                <div className="flex col-span-8 items-center gap-4">
                  <div className="h-[4rem] w-[4rem] rounded">
                    {video?.cover ? (
                      <img
                        src={video?.cover}
                        alt="Cover"
                        className="rounded-md object-cover w-full h-full"
                      />
                    ) : (
                      <img
                        src="/PlaylistImg.jpg"
                        alt="Default Cover"
                        className="rounded-md w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{video?.title}</p>
                    <p className="text-[0.8em] opacity-50">{video?.anime}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p>{video?.language}</p>
                </div>
                <div className="col-span-1 justify-end flex">
                  <Icon path={mdiDotsHorizontal} size={0.8} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center flex-col gap-4 justify-center h-[50vh]">
          <img src="../../public/musicIcon.png" />
          <p className="font-bold text-[1.2em]">
            Ooops!! There are no songs here
          </p>
        </div>
      )}
      {playPlaylist && (
        <div className="fixed z-[100] items-center justify-center flex flex-col h-full left-0 top-0 w-full bg-black bg-opacity-70">
          <ClickAwayListener
            onClickAway={() => {
              setPlayPlaylist(false), setFloat(true);
            }}
          >
            <div className="w-[80vw] items-center flex flex-col justify-center">
              {/* <!-- VIDEO --> */}
              <div className="h-[80vh] w-full bg-black mb-5 rounded-xl">
                <video
                  ref={videoRef}
                  src={`../../public/anime/${currentVideo.file_name}.mp4`}
                  autoPlay
                  onEnded={handleNextVideo}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
              {/* <!-- REPRODUCTOR BANNER --> */}
              <div className="bg-white p-2 rounded-xl text-black grid grid-cols-12 w-fit gap-8">
                <div className="flex gap-4 col-span-4">
                  <div className="h-10 w-[5em] bg-red-500 rounded-xl">
                    {currentVideo?.cover ? (
                      <img
                        src={currentVideo?.cover}
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
                  </div>
                  <div className="max-w-[150px]">
                    <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                      {currentVideo.title || "No Title"}
                    </p>
                    <p className="text-[0.8em] opacity-50 overflow-hidden text-ellipsis whitespace-nowrap">
                      {currentVideo.anime || "No Anime"}
                    </p>
                  </div>
                </div>
                <div className="col-span-4 flex items-center justify-center gap-2">
                  <div
                    data-tooltip-id="toolTip"
                    data-tooltip-content="Aleatory"
                  >
                    <Icon path={mdiShuffleVariant} size={0.8} />
                  </div>
                  <div
                    onClick={handlePreviousVideo}
                    data-tooltip-id="toolTip"
                    data-tooltip-content="Previous"
                  >
                    <Icon path={mdiSkipPrevious} size={1} />
                  </div>
                  <div
                    className="p-2 rounded-full bg-black text-white cursor-pointer"
                    onClick={togglePlayPause}
                  >
                    <Icon path={isPlaying ? mdiPause : mdiPlay} size={1} />
                  </div>
                  <div
                    onClick={handleNextVideo}
                    data-tooltip-id="toolTip"
                    data-tooltip-content="Next"
                  >
                    <Icon path={mdiSkipNext} size={1} />
                  </div>
                  <div data-tooltip-id="toolTip" data-tooltip-content="Bucle">
                    <Icon path={mdiRepeatVariant} size={1} />
                  </div>
                </div>
                <div className="col-span-4 flex items-center justify-end gap-4">
                  <p>
                    <span className="opacity-50">
                      {formatTime(currentTime)}
                    </span>{" "}
                    <span className="font-bold">/ {formatTime(duration)}</span>
                  </p>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowVolumeBar(true)}
                    onMouseLeave={() => setShowVolumeBar(false)}
                  >
                    <div className="flex items-center">
                      <Icon
                        path={
                          volume > 0.7
                            ? mdiVolumeHigh
                            : volume == 0
                            ? mdiVolumeVariantOff
                            : mdiVolumeMedium
                        }
                        size={1}
                      />
                    </div>
                    {showVolumeBar && (
                      <div
                        className="absolute h-[10em] bottom-0 bg-white py-4 rounded-full mb-5"
                        style={{ boxShadow: "0px 0px 10px black" }}
                      >
                        <Slider
                          orientation="vertical"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={handleVolumeChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ClickAwayListener>
          {/* <!-- TOOLTIP --> */}
          <div>
            <Tooltip
              id="toolTip"
              place="top"
              style={{
                backgroundColor: "white",
                color: "black",
                fontSize: "12px",
              }}
            />
          </div>
        </div>
      )}

      {confirmationPlaylist && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg text-black w-[25em]">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Icon
                  path={mdiAlertCircle}
                  size={1}
                  className="text-[#1A50FA]"
                />
                <p className="font-bold text-[1.2em]">Alert</p>
              </div>
              <p>
                Are you sure you want to delete this playlist? This action
                cannot be undone and you will lose all the songs it contains.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md py-2 px-8 bg-transparent text-black font-bold"
                  onClick={() => {
                    deletePlaylist();
                  }}
                >
                  Agree
                </button>
                <button
                  className="rounded-md py-2 px-8 bg-[#FF2727] text-white font-bold"
                  onClick={() => {
                    setConfirmationPlaylist(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sharePlaylistOptions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <ClickAwayListener onClickAway={() => setSharePlaylistOptions(false)}>
            <div className="bg-white rounded-lg text-black w-[30em]">
              <div className="p-5 flex flex-col gap-4">
                <div className="flex gap-2 items-center justify-center">
                  <p className="font-bold text-[1.2em]">Share Playlist</p>
                </div>
                <hr />
                <div className="flex items-center justify-center gap-4">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      urlShare
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full flex items-center justify-center bg-[#25D366] text-white p-2"
                  >
                    <Icon path={mdiWhatsapp} className="h-7 w-7" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      urlShare
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full flex items-center justify-center bg-[#1877F2] p-3"
                  >
                    <img
                      src="../../public/facebookIcon.png"
                      className="h-5 w-5"
                    />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      urlShare
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full flex items-center justify-center bg-black text-white p-3"
                  >
                    <img src="../../public/xicon.png" className="h-5 w-5" />
                  </a>
                  <a
                    href={`mailto:?subject=Check out this playlist&body=${encodeURIComponent(
                      urlShare
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full flex items-center justify-center bg-[#E9E9E9] text-black p-2"
                  >
                    <Icon path={mdiEmailOutline} className="h-7 w-7" />
                  </a>
                </div>
                <hr />
                <div className="bg-[#ECEDF0] rounded-lg p-2 flex items-center gap-2">
                  <p className="flex-grow overflow-auto p-2 rounded-lg whitespace-nowrap">
                    {urlShare}
                  </p>
                  <button
                    className="rounded-full bg-[#1A50FA] px-5 py-2 flex items-center justify-center text-white"
                    onClick={() => navigator.clipboard.writeText(urlShare)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </ClickAwayListener>
        </div>
      )}
    </div>
  );
};

export default PlaylistScreen;

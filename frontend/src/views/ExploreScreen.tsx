import Icon from "@mdi/react";
import { useEffect, useState, useRef } from "react";
import Rating from "@mui/material/Rating";
import Draggable from "react-draggable";
import axios from "../axios";
import StarIcon from "@mui/icons-material/Star";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { useVideoContext } from "../VideoContext";
import { useUser } from "../UserContext";

import {
  mdiDotsHorizontal,
  mdiPlay,
  mdiArrowExpand,
  mdiResizeBottomRight,
  mdiPause,
  mdiMagnify,
  mdiPencil,
  mdiMusicNotePlus,
  mdiChevronRight,
} from "@mdi/js";

interface Video {
  id: number;
  user_id: number;
  file_name: string;
  title: string;
  anime: string;
}

const ExploreScreen = () => {
  const { user_id } = useUser();
  const { setCurrentPlayingVideo } = useVideoContext();

  const videoPlayer = useRef<HTMLVideoElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [userPlaylist, setUserPlaylist] = useState<any>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | any>("");
  const [showVideoOptions, setShowVideoOptions] = useState<number | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [searchVideo, setSearchVideo] = useState(false);
  const [addSongToPlaylist, setAddSongToPlaylist] = useState<any>(null);
  const [addedPlaylists, setAddedPlaylists] = useState<number[]>([]);

  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState<
    number | null
  >(null);

  const draggableRef = useRef(null);

  const filteredVideos = videos?.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.anime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    try {
      const response = await axios.get(`/getVideosWithRatings`, {
        params: {
          user_id: user_id,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Error en la solicitud GET", error);
    }
  };

  const ratedVideo = async (rating: number, id: any) => {
    const videoData = {
      id_user: user_id,
      id_video: id,
      video_rating: rating,
    };

    try {
      await axios.post(
        `/setRatingVideo`,
        {
          data: videoData,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      getVideos();
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  const handleVideoClick = async (index: number, video: Video) => {
    const videoElement = videoPlayer.current;

    if (!videoElement) return;

    if (index === currentlyPlayingIndex) {
      if (videoElement.paused) {
        setIsPlayingVideo(true);
        videoElement.play();
      } else {
        videoElement.pause();
        setIsPlayingVideo(false);
      }
    } else {
      try {
        const response = await axios.get(`/videos/anime/${video?.file_name}`, {
          responseType: "blob",
          headers: {
            "Content-Type": "video/mp4",
          },
        });

        const videoBlobUrl = URL.createObjectURL(response.data);

        setVideoUrl(videoBlobUrl);

        videoElement.oncanplay = () => {
          videoElement.play();
          setCurrentlyPlayingIndex(index);
          setIsPlayingVideo(true);
        };

        videoElement.load();
      } catch (error) {
        console.error("Error fetching video:", error);
        setVideoUrl(null);
      }
    }
  };

  const handlePlayPause = () => {
    if (selectedVideo && videoPlayer.current) {
      const videoElement = videoPlayer.current;

      if (videoElement.paused) {
        videoElement.play();
        setIsPlayingVideo(true);
      } else {
        videoElement.pause();
        setIsPlayingVideo(false);
      }
    }
  };

  const getUserPlaylist = async (index: number) => {
    try {
      const response = await axios.get(`/getUserPlaylists`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          user_id: user_id,
        },
      });

      const result = response.data;

      setUserPlaylist(result);
      setAddSongToPlaylist(index);
    } catch (error) {
      console.error("Error en la solicitud GET", error);
    }
  };

  const addSongPlaylist = async (playlistId: number) => {
    try {
      const response = await axios.post(
        `/addSongToPlaylist`,
        {
          id_videos: addSongToPlaylist,
          id_playlist: playlistId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setAddedPlaylists((prev) => [...prev, playlistId]);
      }
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  return (
    <div className="text-white bg-[#18181B] rounded-xl p-2 relative h-[85vh] pt-10 md:pt-0 md:h-[calc(100vh-1rem)] overflow-auto">
      <div className="grid grid-cols-12 gap-4">
        <div className={`col-span-12 flex flex-wrap`}>
          <div className="flex items-center justify-between w-full mb-4">
            <p className="font-bold text-[2.5em] w-full">
              Explore without limits
            </p>
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
                      placeholder="What song do you want to listen to today?"
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
          <div className="flex flex-wrap gap-4 w-full">
            {Array.isArray(filteredVideos) &&
              filteredVideos.map((video: any, index) => (
                <div
                  key={index}
                  className="rounded-xl col-span-3 md:h-[25vw] md:w-[calc(33.33%-1rem)] lg:h-[20vw] xl:h-[17vw] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] flex justify-center items-center relative"
                >
                  <img
                    src={video?.cover}
                    className={`w-full h-full rounded-xl hover:cursor-pointer object-cover ${
                      selectedVideo?.id === video?.id ? "hidden" : "block"
                    }`}
                  />

                  <video
                    ref={videoPlayer}
                    src={videoUrl}
                    className={`w-full h-full rounded-xl hover:cursor-pointer object-cover ${
                      selectedVideo?.id === video?.id ? "block" : "hidden"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(index, video);
                      setSelectedVideo(video);
                      setCurrentPlayingVideo(video);
                    }}
                    style={{
                      display:
                        selectedVideo?.id === video?.id ? "block" : "none",
                    }}
                  />
                  <div
                    className="absolute h-full w-full cursor-pointer bg-black bg-opacity-50 rounded-xl p-2 flex flex-col justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(index, video);
                      setSelectedVideo(video);
                      setCurrentPlayingVideo(video);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Rating
                          name="video-rating"
                          emptyIcon={
                            <StarIcon
                              style={{ opacity: 0.5, color: "#747474" }}
                              fontSize="inherit"
                            />
                          }
                          value={video.rating}
                          className="mt-2"
                          size="small"
                          onChange={(_, newValue: any) => {
                            ratedVideo(newValue, selectedVideo?.id);
                          }}
                        />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVideoOptions(index);
                        }}
                        className="relative"
                      >
                        <Icon
                          path={mdiDotsHorizontal}
                          size={0.7}
                          className="hover:cursor-pointer"
                        />
                        {showVideoOptions === index && (
                          <ClickAwayListener
                            onClickAway={() => setShowVideoOptions(null)}
                          >
                            <div className="absolute bg-[#212122] mt-2 rounded-md min-w-full right-0 z-[10] text-white shadow-xl">
                              <div className="p-2 rounded-t-md flex items-center gap-2 hover:bg-[#141417]">
                                <Icon path={mdiPencil} size={0.7} />
                                <p>Edit Video</p>
                              </div>
                              <div
                                className="p-2 rounded-b-md flex items-center gap-2 hover:bg-[#141417] cursor-pointer"
                                onClick={() => {
                                  getUserPlaylist(index);
                                }}
                              >
                                <Icon path={mdiMusicNotePlus} size={0.7} />
                                <p className="whitespace-nowrap">
                                  Add to Playlist
                                </p>
                              </div>
                              {/* <div className="p-2 rounded-b-md flex items-center gap-2 hover:bg-[#141417] cursor-pointer">
                                <Icon path={mdiAlertOutline} size={0.7} />
                                <p className="whitespace-nowrap">
                                  Report Video
                                </p>
                              </div> */}
                            </div>
                          </ClickAwayListener>
                        )}
                      </div>
                    </div>
                    <div className="max-w-[150px]">
                      <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                        {video?.title}
                      </p>
                      <p className="opacity-50 text-[0.9em] overflow-hidden text-ellipsis whitespace-nowrap">
                        {video?.anime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {userPlaylist.length > 0 && (
        <div className="bg-black z-[200] fixed top-0 left-0 w-full h-full bg-opacity-50 flex items-center justify-center flex-col">
          <ClickAwayListener onClickAway={() => setUserPlaylist([])}>
            <div className="min-w-[30em] bg-white rounded-lg p-4 gap-4 flex flex-col text-black">
              <div className="flex gap-2 items-center justify-center">
                <p className="font-bold text-[1.2em]">Add to Playlist</p>
              </div>
              {userPlaylist.map((playlist: any, index: number) => (
                <div
                  key={index}
                  className="text-black flex item-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-md">
                      <img
                        src={playlist.cover}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <p className="flex items-center font-bold">
                      {playlist.name}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      className={`rounded-md py-2 px-8 w-fit h-fit text-white flex items-center justify-center bg-[#1A50FA]
                      `}
                      onClick={() => {
                        if (!addedPlaylists.includes(playlist.id)) {
                          addSongPlaylist(playlist.id);
                        }
                      }}
                      disabled={addedPlaylists.includes(playlist.id)}
                    >
                      {"Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ClickAwayListener>
        </div>
      )}

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <Draggable nodeRef={draggableRef}>
          <div
            className="bg-white rounded-xl p-3 absolute bottom-5 left-5 flex gap-2 text-black z-[100] shadow-2xl"
            ref={draggableRef}
          >
            <div className="h-10 w-[5em] rounded-lg relative flex items-center justify-center cursor-pointer">
              <img
                src={selectedVideo?.cover}
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className="bg-black bg-opacity-50 w-full h-full rounded-lg absolute flex items-center justify-center"
                onClick={handlePlayPause}
              >
                <Icon
                  path={isPlayingVideo ? mdiPause : mdiPlay}
                  size={1}
                  className="text-white"
                />
              </div>
            </div>
            <div className="max-w-[100px]">
              <p className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedVideo?.title}
              </p>
              <p className="text-[0.8em] opacity-50 overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedVideo?.anime}
              </p>
            </div>
            <div className="flex items-center ml-5">
              <Icon path={mdiArrowExpand} size={1} />
            </div>
            <div>
              <Icon
                path={mdiResizeBottomRight}
                size={0.8}
                style={{ transform: "scaleY(-1)" }}
                className="opacity-50"
              />
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default ExploreScreen;

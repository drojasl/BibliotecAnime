import Icon from "@mdi/react";
import { useEffect, useState, useRef } from "react";
import {
  mdiMagnify,
  mdiVideo,
  mdiPlay,
  mdiPause,
  mdiPlaylistPlus,
  mdiVolumeHigh,
  mdiPlusBoxOutline,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiFitToScreen,
  mdiMusicClefBass,
  mdiPlayBoxEditOutline,
  mdiFitToScreenOutline,
  mdiVolumeOff,
} from "@mdi/js";
import Rating from "@mui/material/Rating";
import { Tooltip } from "react-tooltip";
import axios from "axios";

const ExploreScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState<any>([]);
  const [videoPlayerNow, setVideoPlayerNow] = useState("");
  const [videoPlayingRoute, setVideoPlayingRoute] = useState("");
  const [selectedSong, setSelectedSong] = useState("");
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [viewPlayingVideo, setViewPlayingVideo] = useState(false);
  const [playingVideoTitle, setPlayingVideoTitle] = useState(false);
  const [playingVideoAnime, setPlayingVideoAnime] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [isPausedVideo, setIsPausedVideo] = useState(false);
  const [showAddPlaylists, setShowAddPlaylists] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  const videoPlayer1 = useRef<any>(null);

  useEffect(() => {
    const getVideosAndPlaylists = async () => {
      try {
        const response = await axios.post(
          `${apiUrl}/getVideos`,
          {
            user_id: 1, // TODO
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setVideos(response.data.video);
        setPlaylists(response.data.playlists);
      } catch (error) {
        console.error("Error en la solicitud POST", error);
      }
    };

    getVideosAndPlaylists();
  }, []);

  const playVideo = async (video: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}/getVideoRating`,
        {
          user_id: 1,
          video_id: video.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log(response);
        setRatingValue(response.data.rating);
      } else {
        setRatingValue(0);
      }
    } catch (error) {
      console.error("Error al obtener el rating del video:", error);
    }

    setSelectedVideo(video.id);
    setIsPausedVideo(false);
    if (viewPlayingVideo) {
      setViewPlayingVideo(false);
    } else {
      setViewPlayingVideo(true);
    }
    setVideoPlayerNow(video.file_name);
    setIsPlayingVideo(true);
    setPlayingVideoTitle(video.title);
    setPlayingVideoAnime(video.anime);
    setVideoPlayingRoute(video.file_name);
  };

  const showScreen = () => {
    if (viewPlayingVideo) {
      setViewPlayingVideo(false);
    } else {
      setViewPlayingVideo(true);
    }
  };

  const toggleMute = () => {
    const video1 = videoPlayer1.current;

    if (video1) {
      video1.muted = !video1.muted;
    }

    setIsMuted(!isMuted);
  };

  const playPauseVideo = () => {
    const video1 = videoPlayer1.current;

    if (video1) {
      if (video1.paused || video1.ended) {
        video1.play();
        setIsPausedVideo(false);
      } else {
        video1.pause();
        setIsPausedVideo(true);
      }
    }
  };

  const addSongToPlaylist = (id_song: any) => {
    setShowAddPlaylists(true);
    setSelectedSong(id_song);
  };

  const ratedVideo = async (rating: number, id: any) => {
    setRatingValue(rating);
    const videoData = {
      id_user: 1,
      id_video: id,
      video_rating: rating,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/setRatingVideo`,
        {
          data: videoData,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  const addSong = async (playlist: any) => {
    const playlistData = {
      id_video: selectedSong,
      id_playlist: playlist,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/addSongToPlaylist`,
        {
          data: playlistData,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  return (
    <div className="text-white">
      <div className="flex justify-center">
        <div className="relative">
          <span className="absolute left-3 top-2">
            <Icon path={mdiMagnify} size={0.7} />
          </span>
          <input
            type="text"
            className="bg-white bg-opacity-10 rounded-full py-2 px-10 w-[100%]"
            placeholder="Buscar..."
          />
        </div>
      </div>
      <div className="grid grid-cols-12 mt-4">
        <div className="col-span-9 flex flex-wrap">
          <p className="font-bold text-[1.4em] w-full mb-4">
            Explore Recommended Videos
          </p>
          {Array.isArray(videos) &&
            videos.map((video, index) => (
              <div key={index} className="my-2 mx-2">
                <div className="rounded-md h-[10em] w-[20em] flex justify-center items-center">
                  <video
                    src={`../../anime/${video.file_name}`}
                    className="w-full h-full rounded-md hover:cursor-pointer"
                    style={{ objectFit: "cover" }}
                    onClick={() => {
                      playVideo(video);
                    }}
                  ></video>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{video.title}</p>
                    <p className="opacity-50 text-[0.9em]">{video.anime}</p>
                  </div>
                  <Icon
                    path={mdiPlayBoxEditOutline}
                    size={0.7}
                    className="opacity-30 hover:opacity-100 hover:cursor-pointer"
                  />
                </div>
              </div>
            ))}
        </div>
        <div className="col-span-3 text-white">
          <p className="font-bold text-[1.4em]">Your Playlists</p>
          {playlists.length !== 0 ? (
            playlists.map((playlist: any, index: any) => (
              <div
                key={index}
                className="bg-white bg-opacity-50 rounded-md h-[5em] w-full flex items-center my-4 p-2 justify-between"
              >
                <div className="flex h-full items-center">
                  <div className="h-[100%] w-[5vw] rounded-md">
                    <video
                      src={`../../anime/${playlist.videos[0].file_name}`}
                      className="w-full h-full rounded-md hover:cursor-pointer"
                      style={{ objectFit: "cover" }}
                    ></video>
                  </div>
                  <div className="ml-2">
                    <p>{playlist?.playlist?.playlist_name}</p>
                    <div className="flex items-center">
                      <Icon path={mdiVideo} size={0.7} className="opacity-30" />
                      <p className="ml-1">{playlist.videos.length} videos</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center py-1 px-2 bg-white bg-opacity-50 rounded-md">
                  <Icon path={mdiPlay} size={0.7} />
                  <p className="ml-1">Play</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col justify-center items-center h-full ">
              <div className="flex flex-col opacity-30 justify-center items-center">
                <Icon path={mdiMusicClefBass} size={2.7} />
                <p>NO TIENES NINGUNA PLAYLIST</p>
              </div>
              <button className="opacity-100 py-2 px-3 bg-[#483EA8] rounded-md mt-3 flex justify-center items-center">
                <Icon path={mdiPlusBoxOutline} size={0.7} className="mr-1" />
                Create one
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="fixed bottom-0 p-5 w-full  flex flex-col justify-center items-center "
        style={{
          backgroundColor: !viewPlayingVideo
            ? "rgba(255, 255, 255, 0)"
            : "rgba(0, 0, 0, 0.9)",
          left: !viewPlayingVideo ? "auto" : "0px",
        }}
      >
        {isPlayingVideo && (
          <>
            <div
              className=" h-[80vh] w-[80%] rounded-lg "
              style={{ display: !viewPlayingVideo ? "none" : "block" }}
            >
              <video
                ref={videoPlayer1}
                id="player1"
                src={`../../anime/${videoPlayerNow}`}
                autoPlay
                preload="auto"
                style={{ objectFit: "cover" }}
                className={"w-full h-full rounded-xl"}
              ></video>
            </div>
            <div className="mt-3 flex justify-center items-center">
              <div
                className="rounded-full py-2 px-3 w-fit bottom-[3%] flex justify-between"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                {showAddPlaylists && (
                  <div className="bg-[#121212] px-3 rounded-md absolute bottom-[15%]">
                    {playlists.length !== 0 &&
                      playlists.map((playlist: any, index: any) => (
                        <div
                          key={index}
                          className="bg-white bg-opacity-50 rounded-md h-[5em] w-full flex items-center my-4 p-2 justify-between"
                        >
                          <div className="flex h-full items-center">
                            <div className="h-[100%] w-[5vw] rounded-md">
                              <video
                                src={`../../anime/${playlist.videos[0].file_name}`}
                                className="w-full h-full rounded-md hover:cursor-pointer"
                                style={{ objectFit: "cover" }}
                              ></video>
                            </div>
                            <div className="ml-2">
                              <p>{playlist?.playlist?.playlist_name}</p>
                              <div className="flex items-center">
                                <Icon
                                  path={mdiVideo}
                                  size={0.7}
                                  className="opacity-30"
                                />
                                <p className="ml-1">
                                  {playlist.videos.length} videos
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className="flex items-center py-1 px-2 bg-white bg-opacity-50 rounded-md ml-5 hover:cursor-pointer"
                            onClick={() => {
                              addSong(index);
                            }}
                          >
                            <p className="ml-1">Add</p>
                          </div>
                        </div>
                      ))}
                    <div className="justify-between flex">
                      <div className="flex items-center py-1 px-2 bg-white bg-opacity-50 rounded-md mb-3 w-fit  hover:cursor-pointer">
                        <Icon path={mdiPlusBoxOutline} size={0.7} />
                        <p className="ml-1">New Playlist</p>
                      </div>
                      <div
                        className="flex items-center py-1 px-2 bg-white bg-opacity-50 rounded-md mb-3 w-fit  hover:cursor-pointer"
                        onClick={() => {
                          setShowAddPlaylists(false);
                        }}
                      >
                        <p className="ml-1">Cancel</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-start">
                  <div className="h-[3em] w-[3em] rounded-md">
                    <video
                      src={`../../anime/${videoPlayingRoute}`}
                      className="w-full h-full rounded-md hover:cursor-pointer"
                      style={{ objectFit: "cover" }}
                    ></video>
                  </div>
                  <div className="mx-3">
                    <p
                      className="font-bold"
                      style={{
                        maxWidth: "10em",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {playingVideoTitle}
                    </p>
                    <p
                      className="text-[0.9em] opacity-50 mt-[-0.4em]"
                      style={{
                        maxWidth: "10em",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {playingVideoAnime}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      addSongToPlaylist(selectedVideo);
                    }}
                  >
                    <Icon
                      path={mdiPlaylistPlus}
                      size={0.7}
                      data-tooltip-id="toolTip"
                      data-tooltip-content="Add to a playlist"
                      className="hover:cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center text-white mx-[8em]">
                  <div className="p-1 rounded-full flex items-center justify-center">
                    <Icon path={mdiSkipPrevious} size={0.7} />
                  </div>
                  <div
                    className="p-1 bg-white bg-opacity-50 rounded-full mx-2 flex items-center justify-center hover:cursor-pointer"
                    onClick={() => {
                      playPauseVideo();
                    }}
                  >
                    <Icon
                      path={!isPausedVideo ? mdiPause : mdiPlay}
                      size={0.7}
                    />
                  </div>
                  <div className="p-1 rounded-full flex items-center justify-center">
                    <Icon path={mdiSkipNext} size={0.7} />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <div className="bg-white bg-opacity-10 flex items-center justify-center rounded-full mx-1 py-1 px-2">
                    <Rating
                      name="size-small"
                      value={ratingValue}
                      onChange={(event, newValue) => {
                        ratedVideo(newValue, selectedVideo);
                      }}
                      precision={1}
                      size="small"
                    />
                  </div>
                  <div
                    className="px-2 hover:cursor-pointer"
                    onClick={toggleMute}
                  >
                    <Icon
                      path={!isMuted ? mdiVolumeHigh : mdiVolumeOff}
                      size={0.6}
                    />
                  </div>
                  <div
                    className="px-2 hover:cursor-pointer"
                    onClick={() => {
                      showScreen();
                    }}
                  >
                    <Icon
                      path={
                        viewPlayingVideo
                          ? mdiFitToScreenOutline
                          : mdiFitToScreen
                      }
                      size={0.7}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Tooltip
        id="toolTip"
        effect="solid"
        place="top"
        style={{
          backgroundColor: "white",
          color: "black",
          fontSize: "14px",
          zIndex: "1000",
        }}
      />
    </div>
  );
};
export default ExploreScreen;

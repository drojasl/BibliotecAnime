import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Rating from "@mui/material/Rating";
import Icon from "@mdi/react";
import {
  mdiMusicCircleOutline,
  mdiVolumeOff,
  mdiFullscreenExit,
  mdiFullscreen,
  mdiVolumeHigh
} from "@mdi/js";

export const LiveScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [firstVideoData, setFirstVideoData] = useState<any>(null);
  const [secondVideoData, setSecondVideoData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const firstVideoPlayer = useRef<any>(null);
  const secondVideoPlayer = useRef<any>(null);
  const [ratingFirst, setRatingFirst] = useState<any>(null);
  const [ratingSecond, setRatingSecond] = useState<any>(null);

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");

    if (loggedUserString) {
      const loggedUser = JSON.parse(loggedUserString);
      setUserData(loggedUser);
      getVideosData(loggedUser?.id);
    } else {
      getVideosData()
    }
  }, []);

  useEffect(() => {
    if (firstVideoData && isFirstPlayer) {
      if (firstVideoData.secondsElapsed) {
        firstVideoPlayer.current.currentTime = firstVideoData?.secondsElapsed;
      }
      firstVideoPlayer.current.addEventListener("ended", firstVideoEnded);
      firstVideoPlayer.current.play();
      secondVideoPlayer.current.pause();

      return () => {
        if (firstVideoPlayer.current !== null) {
          firstVideoPlayer.current.removeEventListener("ended", firstVideoEnded);
        }
      };
    }
  }, [firstVideoData, isFirstPlayer]);

  useEffect(() => {
    if (secondVideoData && !isFirstPlayer) {
      secondVideoPlayer.current.addEventListener("ended", secondVideoEnded);
      secondVideoPlayer.current.currentTime = 60; // TODO: REMOVE
      secondVideoPlayer.current.play();
      firstVideoPlayer.current.pause();

      return () => {
        if (secondVideoPlayer.current !== null) {
          secondVideoPlayer.current.removeEventListener("ended", secondVideoEnded);
        }
      };
    }
  }, [secondVideoData, isFirstPlayer]);

  const getVideosData = async (userId?: any) => {
    try {
      const response = await axios.get(`${apiUrl}/current/${userId}`);
      if (response.data.success) {
        setFirstVideoData({
          video: response.data.currentVideo,
          secondsElapsed: response.data.seconds_elapsed,
        });
        setRatingFirst(response.data.ratingCurrent)
        setSecondVideoData({
          video: response.data.nextVideo,
        });
        setRatingSecond(response.data.ratingNext)
      }
    } catch (error) {
      console.error("Error fetching current video:", error);
    }
  };

  const firstVideoEnded = async () => {
    await currentEnded(firstVideoData?.video?.id, 1);
  };

  const secondVideoEnded = async () => {
    await currentEnded(secondVideoData?.video?.id, 2);
  };

  const currentEnded = async (videoId: any, video: any) => {
    setIsFirstPlayer(!isFirstPlayer);
    if (videoId) {
      try {
        await axios.get(`${apiUrl}/currentEnded/${videoId}`);
        getNextVideo(userData?.id, video);
      } catch (error) {
        console.error("Error ending current video:", error);
      }
    }
  };

  const getNextVideo = async (userId: any, video: any) => {
    try {
      const response = await axios.get(`${apiUrl}/next/${userId}`);
      if (response.data.success) {
        if (video === 1) {
          setFirstVideoData({ video: response.data.video });
        } else {
          setSecondVideoData({
            video: response.data.video,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching next video:", error);
    }
  };

  const ratedVideo = async (rating: number, video: any, number: number) => {
    if (number === 1) {
      setRatingFirst(rating);
    } else {
      setRatingSecond(rating);
    }

    const videoData = {
      id_user: userData?.id,
      id_video: video?.video?.id,
      video_rating: rating,
    };

    try {
      await axios.post(
        `${apiUrl}/setRatingVideo`,
        { data: videoData },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    firstVideoPlayer.current.muted = !isMuted
    secondVideoPlayer.current.muted = !isMuted
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div className={`${isFullScreen ? 'absolute top-0 left-0 w-full' : 'relative md:p-5'} items-center h-[90vh] md:h-[100vh]`}>
      <div className={`relative flex items-center justify-center w-full h-full`}>
        <div className="flex absolute top-3 left-0 bg-white rounded-xl py-2 mx-3 px-3 items-center justify-between z-10">
          <div className="text-black">
            <div className="flex items-center">
              <Icon path={mdiMusicCircleOutline} size={0.6} />
              <p className="font-bold text-[1.3em] ml-1">
                {isFirstPlayer ? firstVideoData?.video?.anime : secondVideoData?.video?.anime}
              </p>
            </div>
            <p className="opacity-50">
              {isFirstPlayer ? firstVideoData?.video?.title : secondVideoData?.video?.title}
            </p>
            {userData?.id && (
              <div className="mt-1">
                <Rating
                  name="size-small"
                  value={isFirstPlayer ? parseFloat(ratingFirst) : parseFloat(ratingSecond)}
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      ratedVideo(newValue, isFirstPlayer ? firstVideoData : secondVideoData, isFirstPlayer ? 1 : 2);
                    }
                  }}
                  precision={1}
                  size="small"
                />
              </div>
            )}
          </div>
        </div>
        <div className={`relative h-full  w-full ${isFirstPlayer ? 'block' : 'hidden'}`}>
          <video
            ref={firstVideoPlayer}
            muted
            src={`../../anime/${firstVideoData?.video?.file_name}`}
            className={`${isFullScreen ? 'rounded-[0]' : 'rounded-xl'} w-full h-full object-cover`}
          ></video>
        </div>
        <div className={`relative h-full w-full ${isFirstPlayer ? 'hidden' : 'block'}`}>
          <video
            ref={secondVideoPlayer}
            muted
            src={`../../anime/${secondVideoData?.video?.file_name}`}
            className={`${isFullScreen ? 'rounded-[0]' : 'rounded-xl'} w-full h-full object-cover`}
          ></video>
        </div>
        <div className={`absolute inset-0 bg-black bg-opacity-50 ${isFullScreen ? 'rounded-[0]' : 'rounded-xl'}`}></div>
        <div className="absolute bottom-3 right-0 py-2 px-3 flex items-center justify-between ">
          <div>
            <button
              onClick={toggleMute}
              className="text-black hover:cursor mr-3 bg-white rounded-full p-1 bg-opacity-50"
            >
              <Icon
                path={!isMuted ? mdiVolumeHigh : mdiVolumeOff}
                size={0.6}
              />
            </button>
            <button
              onClick={toggleFullScreen}
              className="text-black hover:cursor mr-3 bg-white rounded-full p-1 bg-opacity-50"
            >
              <Icon
                path={!isFullScreen ? mdiFullscreen : mdiFullscreenExit}
                size={0.6}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

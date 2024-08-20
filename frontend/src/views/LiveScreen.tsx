import { useEffect, useRef, useState } from "react";
import axios from "../axios";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Icon from "@mdi/react";
import { useUser } from "../UserContext";

import {
  mdiVolumeOff,
  mdiFullscreenExit,
  mdiFullscreen,
  mdiVolumeHigh,
} from "@mdi/js";

export const LiveScreen = () => {
  const { user_id } = useUser();

  const [firstVideoData, setFirstVideoData] = useState<any>(null);
  const [secondVideoData, setSecondVideoData] = useState<any>(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const firstVideoPlayer = useRef<any>(null);
  const secondVideoPlayer = useRef<any>(null);
  const [ratingFirst, setRatingFirst] = useState<any>(null);
  const [ratingSecond, setRatingSecond] = useState<any>(null);
  const [videoUrlFirst, setVideoUrlFirst] = useState<string>("");
  const [videoUrlSecond, setVideoUrlSecond] = useState<string>("");

  useEffect(() => {
    if (user_id > 0) {
      getVideosData(user_id);
    } else {
      getVideosData();
    }
  }, []);

  useEffect(() => {
    const fetchAndPlayVideo = async () => {
      if (firstVideoData && isFirstPlayer) {
        try {
          const response = await axios.get(
            `/videos/anime/${firstVideoData?.video?.file_name}`,
            {
              responseType: "blob",
              headers: {
                "Content-Type": "video/mp4",
              },
            }
          );

          const videoBlobUrl = URL.createObjectURL(response.data);
          setVideoUrlFirst(videoBlobUrl);

          if (firstVideoPlayer.current) {
            if (firstVideoData.secondsElapsed) {
              firstVideoPlayer.current.currentTime =
                firstVideoData.secondsElapsed;
            }

            firstVideoPlayer.current.addEventListener("ended", firstVideoEnded);
            firstVideoPlayer.current.oncanplay = () => {
              firstVideoPlayer.current.play();
              if (secondVideoPlayer.current) {
                secondVideoPlayer.current.pause();
              }
            };
          }
        } catch (error) {
          console.error("Error fetching video:", error);
          setVideoUrlFirst("");
        }
      }
    };

    fetchAndPlayVideo();

    return () => {
      if (firstVideoPlayer.current) {
        firstVideoPlayer.current.removeEventListener("ended", firstVideoEnded);
      }
    };
  }, [firstVideoData, isFirstPlayer]);

  useEffect(() => {
    const fetchAndPlaySecondVideo = async () => {
      if (secondVideoData && !isFirstPlayer) {
        try {
          const response = await axios.get(
            `/videos/anime/${secondVideoData?.video?.file_name}`,
            {
              responseType: "blob",
              headers: {
                "Content-Type": "video/mp4",
              },
            }
          );

          const videoBlobUrl = URL.createObjectURL(response.data);
          setVideoUrlSecond(videoBlobUrl);

          const videoElement = secondVideoPlayer.current;

          if (videoElement) {
            videoElement.oncanplay = () => {
              videoElement.play();
              if (firstVideoPlayer.current) {
                firstVideoPlayer.current.pause();
              }
            };
            videoElement.addEventListener("ended", secondVideoEnded);
          }
        } catch (error) {
          console.error("Error fetching video:", error);
          setVideoUrlSecond("");
        }
      }
    };

    fetchAndPlaySecondVideo();

    return () => {
      if (secondVideoPlayer.current) {
        secondVideoPlayer.current.removeEventListener(
          "ended",
          secondVideoEnded
        );
      }
    };
  }, [secondVideoData, isFirstPlayer]);

  const getVideosData = async (userId?: any) => {
    try {
      const response = await axios.get(`/current/${userId}`);
      if (response.data.success) {
        setFirstVideoData({
          video: response.data.currentVideo,
          secondsElapsed: response.data.seconds_elapsed,
        });
        setRatingFirst(response.data.ratingCurrent);
        setSecondVideoData({
          video: response.data.nextVideo,
        });
        setRatingSecond(response.data.ratingNext);
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
        await axios.get(`/currentEnded/${videoId}`);
        getNextVideo(user_id, video);
      } catch (error) {
        console.error("Error ending current video:", error);
      }
    }
  };

  const getNextVideo = async (userId: any, video: any) => {
    try {
      const response = await axios.get(`/next/${userId}`);
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
      id_user: user_id,
      id_video: video?.video?.id,
      video_rating: rating,
    };

    try {
      await axios.post(
        `/setRatingVideo`,
        { data: videoData },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    firstVideoPlayer.current.muted = !isMuted;
    secondVideoPlayer.current.muted = !isMuted;
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div
      className={`${
        isFullScreen
          ? "fixed top-0 left-0 w-full h-screen z-[10]"
          : "relative h-full md:h-[calc(100vh-1rem)] md:rounded-xl"
      } flex items-center rounded-b-xl md:rounded-b-[0]`}
    >
      <div
        className={`relative flex items-center justify-center w-full h-full`}
      >
        <div className="hidden md:flex absolute top-3 left-0 bg-white rounded-xl py-2 mx-3 px-5 items-center justify-between z-[20]">
          <div className="text-black">
            <div className="flex items-center">
              <p className="font-bold text-[1.2em]">
                {isFirstPlayer
                  ? firstVideoData?.video?.anime
                  : secondVideoData?.video?.anime}
              </p>
            </div>
            <p className="opacity-50">
              {isFirstPlayer
                ? firstVideoData?.video?.title
                : secondVideoData?.video?.title}
            </p>
            {user_id > 0 && (
              <div className="mt-1">
                <Rating
                  emptyIcon={
                    <StarIcon
                      style={{ opacity: 0.5, color: "#747474" }}
                      fontSize="inherit"
                    />
                  }
                  name="size-small"
                  value={
                    isFirstPlayer
                      ? parseFloat(ratingFirst)
                      : parseFloat(ratingSecond)
                  }
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      ratedVideo(
                        newValue,
                        isFirstPlayer ? firstVideoData : secondVideoData,
                        isFirstPlayer ? 1 : 2
                      );
                    }
                  }}
                  precision={1}
                  size="small"
                />
              </div>
            )}
          </div>
        </div>
        <div className="absolute flex gap-4 bottom-5 left-5 z-[20] md:hidden">
          <div className="h-[10em] w-[8em] rounded-lg overflow-hidden">
            <img
              src={
                isFirstPlayer
                  ? firstVideoData?.video?.cover
                  : secondVideoData?.video?.cover
              }
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="text-white">
              <div className="flex items-center">
                <p className="font-bold text-[1.5rem]">
                  {isFirstPlayer
                    ? firstVideoData?.video?.anime
                    : secondVideoData?.video?.anime}
                </p>
              </div>
              <p className="opacity-50">
                {isFirstPlayer
                  ? firstVideoData?.video?.title
                  : secondVideoData?.video?.title}
              </p>
            </div>
            <Rating
              emptyIcon={
                <StarIcon
                  style={{ opacity: 0.5, color: "#747474" }}
                  fontSize="inherit"
                />
              }
              name="size-small"
              value={
                isFirstPlayer
                  ? parseFloat(ratingFirst)
                  : parseFloat(ratingSecond)
              }
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  ratedVideo(
                    newValue,
                    isFirstPlayer ? firstVideoData : secondVideoData,
                    isFirstPlayer ? 1 : 2
                  );
                }
              }}
              precision={1}
              size="small"
            />
          </div>
        </div>
        <div
          className={`relative h-full w-full ${
            isFirstPlayer ? "block" : "hidden"
          }`}
        >
          <video
            ref={firstVideoPlayer}
            muted
            src={videoUrlFirst}
            className={`${
              isFullScreen ? "rounded-[0]" : "rounded-b-xl md:rounded-xl"
            } w-full h-full object-cover`}
          ></video>
        </div>
        <div
          className={`relative h-full w-full ${
            isFirstPlayer ? "hidden" : "block"
          }`}
        >
          <video
            ref={secondVideoPlayer}
            muted
            src={videoUrlSecond}
            className={`${
              isFullScreen ? "rounded-[0]" : "rounded-b-xl md:rounded-xl"
            } w-full h-full object-cover`}
          ></video>
        </div>
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 ${
            isFullScreen ? "rounded-[0]" : "rounded-b-xl md:rounded-xl"
          }`}
        ></div>
        {/* ICONS SOUND AND FULL SCREEN */}
        <div className="hidden md:flex absolute bottom-3 right-0 py-2 px-3 items-center justify-between ">
          <div>
            <button
              onClick={toggleMute}
              className="text-black hover:cursor mr-3 bg-white rounded-full p-1 bg-opacity-50"
            >
              <Icon path={!isMuted ? mdiVolumeHigh : mdiVolumeOff} size={0.6} />
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

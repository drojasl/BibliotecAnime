import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Icon from "@mdi/react";
import {
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiMusicCircleOutline,
  mdiFullscreen,
  mdiFullscreenExit,
} from "@mdi/js";
import Rating from "@mui/material/Rating";
import Alert from "@mui/material/Alert";

export const LiveScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const videoPlayer1 = useRef<any>(null);
  const videoPlayer2 = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [firstVideoData, setFirstVideoData] = useState<any>(null);
  const [secondVideoData, setSecondVideoData] = useState<any>(null);
  const [isFirstPlayer, setIsFirstPlayer] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [ratingVideo1, setRatingVideo1] = useState<number | null>(null);
  const [ratingVideo2, setRatingVideo2] = useState<number | null>(null);

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");

    if (loggedUserString) {
      const loggedUser = JSON.parse(loggedUserString);
      setUser(loggedUser);
      getCurrentVideo(loggedUser?.id);
      getNextVideo(2, loggedUser?.id);
    } else {
      getCurrentVideo();
      getNextVideo(2);
    }

    return () => {
      const video1 = videoPlayer1.current;
      const video2 = videoPlayer2.current;

      if (video1) video1.removeEventListener("ended", endFirstVideo);
      if (video2) video2.removeEventListener("ended", endSecondVideo);
    };
  }, []);

  useEffect(() => {
    const video1 = videoPlayer1.current;
    const video2 = videoPlayer2.current;

    if (video1) video1.addEventListener("ended", endFirstVideo);
    if (video2) video2.addEventListener("ended", endSecondVideo);

    return () => {
      if (video1) video1.removeEventListener("ended", endFirstVideo);
      if (video2) video2.removeEventListener("ended", endSecondVideo);
    };
  }, [videoPlayer1, videoPlayer2]);

  const getCurrentVideo = async (userId?: any) => {
    try {
      const response = await axios.get(`${apiUrl}/current/${userId}`);
      if (response.data) {
        setFirstVideoData(response.data);
      }
    } catch (error) {
      console.error("Error fetching current video:", error);
      showAlert("Error fetching current video");
    }
  };

  const getNextVideo = async (order: any, userId?: any) => {
    try {
      const response = await axios.get(`${apiUrl}/next/${userId}`);
      if (response.data) {
        if (order === 1) {
          setFirstVideoData(response.data);
        } else {
          setSecondVideoData(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching next video:", error);
      showAlert("Error fetching next video");
    }
  };

  useEffect(() => {
    if (firstVideoData) {
      const video1 = videoPlayer1.current;
      video1.currentTime = firstVideoData?.seconds_elapsed || 0;
    }
  }, [firstVideoData]);

  useEffect(() => {
    if (isFirstPlayer) {
      videoPlayer1.current.play();
      videoPlayer2.current.pause();
    } else {
      videoPlayer1.current.pause();
      videoPlayer2.current.play();
    }
  }, [isFirstPlayer]);

  const endFirstVideo = async () => {
    const loggedUserString = localStorage.getItem("loggedUser");
    const loggedUser = JSON.parse(loggedUserString);

    setIsFirstPlayer(false);
    currentEnded();
    getNextVideo(1, loggedUser?.id);
  };

  const endSecondVideo = async () => {
    const loggedUserString = localStorage.getItem("loggedUser");
    const loggedUser = JSON.parse(loggedUserString);

    setIsFirstPlayer(true);
    currentEnded();
    getNextVideo(2, loggedUser?.id);
  };

  const currentEnded = async () => {
    try {
      await axios.get(`${apiUrl}/currentEnded`);
    } catch (error) {
      console.error("Error ending current video:", error);
      showAlert("Error ending current video");
    }
  };

  const showAlert = (message: string) => {
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const showVideoDetails = () => {
    if (isHovered) return;

    setIsHovered(true);
    let mouseInactiveTimeout: number;

    const handleMouseMove = () => {
      clearTimeout(mouseInactiveTimeout);
      mouseInactiveTimeout = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    mouseInactiveTimeout = setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  const ratedVideo = async (rating: number, video: any, number: number) => {
    if (number === 1) {
      setRatingVideo1(rating);
    } else {
      setRatingVideo2(rating);
    }

    const videoData = {
      id_user: user?.id || 1,
      id_video: video?.id,
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
      showAlert("Error submitting rating");
    }
  };

  return (
    <section className="flex justify-center items-center h-[100%] md:py-3">
      <div>
        <div
          className={`${!isFullScreen
            ? "md:h-[90vh] w-[80vw] relative"
            : "w-screen h-screen absolute top-0 left-0"
            }`}
        >
          <div
            className={`absolute bg-black bg-opacity-50 w-full h-full ${isHovered ? "opacity-100" : "opacity-10"} rounded-lg`}
            style={{ zIndex: 100 }}
            onMouseMove={showVideoDetails}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="hidden md:flex absolute top-3 left-0 bg-white rounded-lg py-2 mx-3 px-3 items-center justify-between">
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
                {user?.id && (
                  <div className="mt-1">
                    <Rating
                      name="size-small"
                      value={isFirstPlayer ? firstVideoData?.video?.rating : secondVideoData?.video?.rating}
                      onChange={(event, newValue) => {
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
            <div className="absolute bottom-3 right-0 py-2 px-3 flex items-center justify-between">
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
            {isMuted && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                <button
                  onClick={toggleMute}
                  className="text-white bg-red-600 hover:bg-red-700 rounded-full px-4 py-2"
                >
                  Activar sonido
                </button>
              </div>
            )}
          </div>

          <video
            ref={videoPlayer1}
            id="player1"
            autoPlay
            preload="auto"
            muted={isMuted}
            style={{ objectFit: "cover" }}
            className={`w-full md:h-full rounded-lg ${isFirstPlayer ? 'block' : 'hidden'}`}
            src={`../../anime/${firstVideoData?.video?.file_name}`}
          >
            Your browser does not support the video tag.
          </video>

          <video
            ref={videoPlayer2}
            id="player2"
            autoPlay
            preload="auto"
            muted={isMuted}
            style={{ objectFit: "cover" }}
            className={`w-full md:h-full rounded-lg ${isFirstPlayer ? 'hidden' : 'block'}`}
            src={`../../anime/${secondVideoData?.video?.file_name}`}
          >
            Your browser does not support the video tag.
          </video>

        </div>
        <div className="p-2 md:hidden">
          <Rating
            name="size-small"
            value={isFirstPlayer ? firstVideoData?.video?.rating : secondVideoData?.video?.rating}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                ratedVideo(newValue, isFirstPlayer ? firstVideoData : secondVideoData, isFirstPlayer ? 1 : 2);
              }
            }}
            className="bg-white p-2 rounded-md mt-2 bg-opacity-25"
            precision={1}
            size="small"
          />
          <div className="text-white mt-3">
            <div className="flex items-center">
              <Icon path={mdiMusicCircleOutline} size={0.6} />
              <p className="font-bold text-[1.3em] ml-1">
                {isFirstPlayer ? firstVideoData?.video?.anime : secondVideoData?.video?.anime}
              </p>
            </div>
            <p className="opacity-50">
              {isFirstPlayer ? firstVideoData?.video?.title : secondVideoData?.video?.title}
            </p>
          </div>
        </div>
      </div>
      {alertVisible && (
        <Alert severity="error" onClose={() => setAlertVisible(false)}>
          Error occurred. Please try again later.
        </Alert>
      )}
    </section>
  );
};

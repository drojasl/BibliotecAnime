import { useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiArrowExpand,
  mdiVolumeHigh,
  mdiArrowCollapse,
  mdiVolumeOff,
  mdiMusicCircleOutline,
} from "@mdi/js";
import Rating from "@mui/material/Rating";

import "../css/live.css";
import axios from "axios";

export const LiveScreen = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadFirstEver, setLoadFirstEver] = useState(true);
  const [firstPlayerVideo, setFirstPlayerVideo] = useState<any>(null);
  const [secondPlayerVideo, setSecondPlayerVideo] = useState<any>(null);
  const [actualVideo, setActualVideo] = useState(null);

  const [firstFileUrl, setFirstFileUrl] = useState("");
  const [secondFileUrl, setSecondFileUrl] = useState("");

  const [animeName, setAnimeName] = useState("");
  const [titleName, setTitleName] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(null);
  const [videoRating, setVideoRating] = useState(0);
  const [artistName, setArtistName] = useState("");

  const [isFirstPlayer, setFirstPlayer] = useState(true);
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const videoPlayer1 = useRef<any>(null);
  const videoPlayer2 = useRef<any>(null);

  const getCurrentVideo = () => {
    axios.get(`${apiUrl}/current`,)
      .then((data) => {
        const video = data?.data;
        setFirstPlayerVideo(video)
      })
      .catch((error) => {
        console.log({ error })
      });
  };

  const getNextVideo = async (videoNumber: number) => {
    try {
      const response = await axios.get(`${apiUrl}/next`);
      const video = response.data;

      if (videoNumber == 1) {
        setFirstPlayerVideo(video);
      } else {
        setSecondPlayerVideo(video);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const currentEnded = () => {
    console.log('CURRENT ENDED')
    axios.get(`${apiUrl}/currentEnded`,)
      .then((data) => {
      })
      .catch((error) => {
        console.log({ error })
      });
  };

  const loadVideoData = (videoData: any, video: number) => {
    setActualVideo(videoData)
    if (video == 1) {
      setVideoPlaying(videoData)
      setAnimeName(videoData?.anime);
      setTitleName(videoData?.title);
      setArtistName(videoData?.artist);
      setVideoRating(videoData?.nextVideoRating)
    }

    if (video == 2) {
      setVideoPlaying(videoData)
      setAnimeName(videoData?.anime);
      setTitleName(videoData?.title);
      setArtistName(videoData?.artist);
      setVideoRating(videoData?.nextVideoRating)
    }
  }

  const endFirstVideo = async () => {
    console.log('END FIRST VIDEO')
    setFirstPlayer(false);
    setFirstPlayerVideo(null);
    setFirstFileUrl('');

    if (secondPlayerVideo) {
      console.log('LOAD DATA SECOND VIDEO')
      loadVideoData(secondPlayerVideo, 2)
    }

    try {
      await currentEnded()
      await getNextVideo(1);
    } catch (error) {
      console.log("Error cleaning playing:", error);
    }
  };

  const endSecondVideo = async () => {
    console.log('END SECOND VIDEO')
    setFirstPlayer(true);
    setSecondPlayerVideo(null)
    setSecondFileUrl('')

    if (firstPlayerVideo) {
      console.log('LOAD DATA FISRT VIDEO')
      loadVideoData(firstPlayerVideo, 1);
    }

    try {
      await currentEnded()
      await getNextVideo(2);
    } catch (error) {
      console.log("Error cleaning playing:", error);
    }
  };

  useEffect(() => {
    getCurrentVideo();
    getNextVideo(2);
  }, []);

  useEffect(() => {
    if (firstPlayerVideo) {
      const video2 = videoPlayer2.current;

      console.log({ firstFileUrl })
      if (firstPlayerVideo && !firstFileUrl) {
        setFirstFileUrl(firstPlayerVideo?.file_name);
      }
      if (loadFirstEver) {
        console.log('LOAD FIRST EVER')
        setVideoPlaying(firstPlayerVideo)
        setAnimeName(firstPlayerVideo?.anime);
        setTitleName(firstPlayerVideo?.title);
        setArtistName(firstPlayerVideo?.artist);
        setVideoRating(firstPlayerVideo?.rating)
        setLoadFirstEver(false)
      }
      if (video2) {
        video2.addEventListener('ended', () => {
          console.log('END 2')
          endSecondVideo()
        });
      }
    }
  }, [firstPlayerVideo]);

  useEffect(() => {
    if (secondPlayerVideo) {
      const video1 = videoPlayer1.current;

      console.log({ secondFileUrl })
      if (secondPlayerVideo && !secondFileUrl) {
        setSecondFileUrl(secondPlayerVideo?.file_name);
      }

      if (video1) {
        video1.addEventListener('ended', () => {
          console.log('END 1')
          endFirstVideo()
        });
      }
    }

  }, [secondPlayerVideo]);

  useEffect(() => {
    if (firstFileUrl || secondFileUrl) {
      const video1 = videoPlayer1.current;
      const video2 = videoPlayer2.current;
      video1.currentTime = 75;
      video2.currentTime = 75;

      if (firstFileUrl && isFirstPlayer) {
        video2.pause();
        video1.play();
      }
      if (secondFileUrl && !isFirstPlayer) {
        video1.pause();
        video2.play();
      }
    }

  }, [firstFileUrl, secondFileUrl, isFirstPlayer]);

  // HOVER SHOW VIDEO DETAILS
  const showVideoDetails = () => {
    if (isHovered) {
      return;
    }

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

  // FULL SCREEN VIEW
  const toggleFullScreen = () => {
    const element = document.documentElement;

    if (!isFullScreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    setIsFullScreen(!isFullScreen);
  };

  // MUTE OR UNMUTE VIDEO
  const toggleMute = () => {
    const video1 = videoPlayer1.current;
    const video2 = videoPlayer2.current;

    if (video1) {
      video1.muted = !video1.muted;
    }
    if (video2) {
      video2.muted = !video2.muted;
    }

    setIsMuted(!isMuted);
  };

  const ratedVideo = async (rating: number, video: any) => {
    setVideoRating(rating);
    const videoData = {
      id_user: 1,
      id_video: video?.id,
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
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  return (
    <>
      <section className="flex justify-center items-center py-3 h-[100%]">
        <div
          className={`${!isFullScreen
            ? "w-full h-[95vh] relative"
            : "w-screen h-screen absolute top-0 left-0"
            } `}
        >
          <div
            className={`absolute bg-black bg-opacity-50 w-full h-full ${isHovered ? "opacity-100" : "opacity-10"
              }  rounded-lg`}
            style={{ zIndex: 100 }}
            onMouseMove={showVideoDetails}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute top-3 left-0 bg-white rounded-lg py-2 mx-3 px-3 bg-opacity-50 flex items-center justify-between text-white">
              <div>
                <div className="flex items-center">
                  <Icon path={mdiMusicCircleOutline} size={0.6} />
                  <p className="font-bold text-[1.3em] ml-1">
                    {animeName}
                  </p>
                </div>
                <p className="opacity-50">
                  {titleName}
                </p>
                <div className="mt-1">
                  <Rating
                    name="size-small"
                    value={videoRating}
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        ratedVideo(newValue, videoPlaying);
                      }
                    }}
                    precision={1}
                    size="small"
                  />
                </div>
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
                  className="text-black hover:cursor bg-white rounded-full p-1 bg-opacity-50"
                >
                  <Icon
                    path={!isFullScreen ? mdiArrowExpand : mdiArrowCollapse}
                    size={0.6}
                  />
                </button>
              </div>
            </div>
          </div>

          <video
            ref={videoPlayer1}
            id="player1"
            autoPlay
            preload="auto"
            style={{ objectFit: "cover" }}
            className={`w-full h-full rounded-lg p-5 bg-red-500 `}
            src={`../../anime/${firstFileUrl}`}
          >
            Your browser does not support the video tag.
          </video>

          <video
            ref={videoPlayer2}
            id="player2"
            autoPlay
            preload="auto"
            style={{ objectFit: "cover" }}
            className={`w-full h-full rounded-lg p-5 bg-blue-500 `}
            src={`../../anime/${secondFileUrl}`}
          >
            Your browser does not support the video tag.
          </video>

        </div>
      </section>
    </>
  );
};

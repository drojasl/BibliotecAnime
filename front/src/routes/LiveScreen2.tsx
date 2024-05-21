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
  const [firstFileUrl, setFirstFileUrl] = useState("");
  const [secondFileUrl, setSecondFileUrl] = useState("");
  const [firstVideoName, setFirstVideoName] = useState("");
  const [secondVideoName, setSecondVideoName] = useState("");
  const [secondTitleName, setSecondTitleName] = useState("");
  const [firstTitleName, setFirstTitleName] = useState("");
  const [isFirstPlayer, setFirstPlayer] = useState(true);
  const [isFirstVideo, setFirstVideo] = useState(true);
  const [ratingFirstVideoValue, setRatingFirstVideoValue] = useState(0);
  const [ratingSecondVideoValue, setRatingSecondVideoValue] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState();

  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const videoPlayer1 = useRef<any>(null);
  const videoPlayer2 = useRef<any>(null);

  useEffect(() => {
    async function loadVideo() {
      const getVideo = await getVideos();

      setFirstFileUrl(getVideo?.video?.file_name);
      setFirstVideoName(getVideo?.video?.anime);
      setFirstTitleName(getVideo?.video?.title);
      setRatingFirstVideoValue(getVideo?.rating);
    }

    loadVideo();
  }, []);
  
  useEffect(() => {
    if (firstFileUrl || secondFileUrl) {
      setFirstVideo(false);
  
      async function loadVideo() {
        console.log('loadVideos');
        const getVideo = await getVideos();
        const video1 = videoPlayer1.current;
        const video2 = videoPlayer2.current;
  
        if (video1 && !secondFileUrl) {
          console.log('video1Playing');
          setSecondFileUrl(getVideo?.video?.file_name);
          setSecondVideoName(getVideo?.video?.anime);
          setSecondTitleName(getVideo?.video?.title);
          setRatingSecondVideoValue(getVideo?.rating);
        }
  
        if (video2 && !firstFileUrl) {
          console.log('video2Playing');
          setFirstFileUrl(getVideo?.video?.file_name);
          setFirstVideoName(getVideo?.video?.anime);
          setFirstTitleName(getVideo?.video?.title);
          setRatingFirstVideoValue(getVideo?.rating);
        }
  
        const endFirstVideo = () => {
          console.log('video1Ended');
          setFirstPlayer(false);
          setFirstFileUrl("");
          setFirstVideoName("");
          setFirstTitleName("");
          setRatingFirstVideoValue(0);
        };
  
        const endSecondVideo = () => {
          console.log('video2Ended');
          setFirstPlayer(true);
          setSecondFileUrl("");
          setSecondVideoName("");
          setSecondTitleName("");
          setRatingSecondVideoValue(0);
        };
  
        if (video1) {
          console.log('AAAAAAAAAAAAAAA');
          video1.addEventListener('ended', endFirstVideo);
        }
  
        if (video2) {
          console.log('BBBBBBBBBBBBBB');
          video2.addEventListener('ended', endSecondVideo);
        }
      }
  
      if (isFirstVideo) {
        console.log('EOOOOOOOOO');
        loadVideo();
      }
    }
  }, [firstFileUrl, secondFileUrl, isFirstPlayer]);  

  const getVideos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/videos`, {
        params: {
          user_id: 1,
        },
      });
      setVideoPlaying(response?.data?.video?.id);
      const video = response?.data;
      return video;
    } catch (error) {
      console.error("Error en la solicitud GET", error);
    }
  };

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

  // const ratedVideo = async (rating: number, id: any) => {
  //   setRatingValue(rating);
  //   const videoData = {
  //     id_user: 1,
  //     id_video: id,
  //     video_rating: rating,
  //   };

  //   try {
  //     const response = await axios.post(
  //       `${apiUrl}/setRatingVideo`,
  //       {
  //         data: videoData,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     console.log(response);
  //   } catch (error) {
  //     console.error("Error en la solicitud POST", error);
  //   }
  // };

  return (
    <>
      <section className="flex justify-center items-center py-3 h-[100%]">
        <div
          className={`${
            !isFullScreen
              ? "w-full h-[95vh] relative"
              : "w-screen h-screen absolute top-0 left-0"
          } `}
        >
          <div
            className={`absolute bg-black bg-opacity-50 w-full h-full ${
              isHovered ? "opacity-100" : "opacity-10"
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
                    {isFirstPlayer ? firstTitleName : secondTitleName}
                  </p>
                </div>
                <p className="opacity-50">
                  {isFirstPlayer ? firstVideoName : secondVideoName}
                </p>
                <div className="mt-1">
                  <Rating
                    name="size-small"
                    value={
                      isFirstPlayer
                        ? ratingFirstVideoValue
                        : ratingSecondVideoValue
                    }
                    // onChange={(event, newValue) => {
                    //   ratedVideo(newValue, videoPlaying);
                    // }}
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
          {isFirstPlayer ? (
            <video
              ref={videoPlayer1}
              id="player1"
              autoPlay
              preload="auto"
              style={{ objectFit: "cover" }}
              className={"w-full h-full rounded-lg p-5 bg-red-500"}
              src={`../../anime/${firstFileUrl}`}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <video
              ref={videoPlayer2}
              id="player2"
              autoPlay
              preload="auto"
              style={{ objectFit: "cover" }}
              className={"w-full h-full rounded-lg p-5 bg-blue-500"}
              src={`../../anime/${secondFileUrl}`}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </section>
    </>
  );
};

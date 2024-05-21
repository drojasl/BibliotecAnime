import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Icon from "@mdi/react";
import {
  mdiArrowExpand,
  mdiVolumeHigh,
  mdiArrowCollapse,
  mdiVolumeOff,
  mdiMusicCircleOutline,
} from "@mdi/js";
import Rating from "@mui/material/Rating";

export const LiveScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const videoPlayer1 = useRef<any>(null);
  const videoPlayer2 = useRef<any>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [firstFileUrl, setFirstFileUrl] = useState("");
  const [secondFileUrl, setSecondFileUrl] = useState("");
  const [animeName1, setAnimeName1] = useState("");
  const [animeName2, setAnimeName2] = useState("");
  const [titleName1, setTitleName1] = useState("");
  const [titleName2, setTitleName2] = useState("");
  const [ratingVideo1, setRatingVideo1] = useState(0);
  const [ratingVideo2, setRatingVideo2] = useState(0);
  const [firstVideoData, setFirstVideoData] = useState<any>(null);
  const [secondVideoData, setSecondVideoData] = useState<any>(null);
  const [isFirstPlayer, setFirstPlayer] = useState(true);
  const [isFirstEver, setFirstEver] = useState(true);
  const [firstExecuted, setFirstExecuted] = useState(true);
  const [secondExecuted, setSecondExecuted] = useState(false);

  useEffect(() => {
    const video1 = videoPlayer1.current;
    const video2 = videoPlayer2.current;
    getCurrentVideo();
    getNextVideo(2);

    video1.addEventListener('ended', () => {
      endFirstVideo()
    });

    video2.addEventListener('ended', () => {
      endSecondVideo()
    });
  }, []);

  const getCurrentVideo = async () => {
    axios.get(`${apiUrl}/current`,)
      .then((data) => {
        const videData = data?.data;
        setFirstVideoData(videData)
      })
      .catch((error) => {
        console.log({ error })
      });
  }

  const getNextVideo = async (video: number) => {
    axios.get(`${apiUrl}/next`,)
      .then((data) => {

        const videData = data?.data
        if (video == 1) {
          setFirstVideoData(videData)
        } else {
          setSecondVideoData(videData)
        }
      })
      .catch((error) => {
        console.log({ error })
      });
  }

  useEffect(() => {
    if (firstVideoData) {
      if (isFirstEver) {
        setFirstFileUrl(firstVideoData?.video?.file_name)
        setAnimeName1(firstVideoData?.video?.anime)
        setTitleName1(firstVideoData?.video?.title)
        setRatingVideo1(firstVideoData?.video?.rating)
      } else {
        setFirstFileUrl(firstVideoData?.file_name)
        setAnimeName1(firstVideoData?.anime)
        setTitleName1(firstVideoData?.title)
        setRatingVideo1(firstVideoData?.rating)
      }
    }
  }, [firstVideoData]);

  useEffect(() => {
    if (secondVideoData) {
      setSecondFileUrl(secondVideoData?.file_name)
      setAnimeName2(secondVideoData.anime)
      setTitleName2(secondVideoData.title)
      setRatingVideo2(secondVideoData.rating)
    }
  }, [secondVideoData]);

  useEffect(() => {
    if (firstFileUrl && isFirstPlayer) {
      console.log('PLAY FIRST VIDEO')
      const video1 = videoPlayer1.current;
      const video2 = videoPlayer2.current;

      video2.addEventListener('loadedmetadata', () => {
        if (isFirstPlayer) {
          if (isFirstEver) {
            setFirstEver(false)
          }
          video2.pause();
          video1.play();
        }
      });
    }
  }, [firstFileUrl, isFirstPlayer]);

  useEffect(() => {
    if (secondFileUrl && !isFirstPlayer) {
      const video1 = videoPlayer1.current;
      const video2 = videoPlayer2.current;


      if (!isFirstPlayer) {
        video1.addEventListener('loadedmetadata', () => {
          video1.pause();
          video2.play();
        });
      }
    }
  }, [secondFileUrl, isFirstPlayer]);

  const endFirstVideo = async () => {
    setFirstPlayer(false)
    setAnimeName1('')

    try {
      await currentEnded()
      await getNextVideo(1)
    } catch (error) {

    }
  }

  const endSecondVideo = async () => {
    console.log('END SECOND VIDEO')
    setFirstPlayer(true)
    setAnimeName2('')

    try {
      await currentEnded()
      await getNextVideo(2)

    } catch (error) {

    }
  }

  const currentEnded = async () => {
    axios.get(`${apiUrl}/currentEnded`,)
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

  const ratedVideo = async (rating: number, video: any, number: number) => {

    if (number == 1) {
      setRatingVideo1(rating);
    } else {
      setRatingVideo2(rating);
    }

    const videoData = {
      id_user: 1,
      id_video: video?.id,
      video_rating: rating,
    };

    try {
      await axios.post(
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
                    {isFirstPlayer ? animeName1 : animeName2}
                  </p>
                </div>
                <p className="opacity-50">
                  {isFirstPlayer ? titleName1 : titleName2}
                </p>
                <div className="mt-1">
                  <Rating
                    name="size-small"
                    value={isFirstPlayer ? ratingVideo1 : ratingVideo2}
                    onChange={(event, newValue) => {
                      if (newValue !== null) {
                        ratedVideo(newValue, isFirstPlayer ? firstVideoData : secondVideoData, isFirstPlayer ? 1 : 2);
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
            className={`w-full h-full rounded-lg ${isFirstPlayer ? 'block' : 'hidden'}`}
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
            className={`w-full h-full rounded-lg ${isFirstPlayer ? 'hidden' : 'block'}`}

            src={`../../anime/${secondFileUrl}`}
          >
            Your browser does not support the video tag.
          </video>

        </div>
      </section>
    </>
  );
};
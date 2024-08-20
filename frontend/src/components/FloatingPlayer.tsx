import React, { useEffect, useRef } from "react";
import { useVideoContext } from "../VideoContext";
import Draggable from "react-draggable";
import Icon from "@mdi/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  mdiPause,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiPlay,
  mdiClose,
  mdiResize,
} from "@mdi/js";

const FloatingPlayer: React.FC = () => {
  const {
    currentVideo,
    currentTime,
    float,
    playlist,
    token,
    isPlaying,
    currentVideoIndex,
    currentPlayingVideo,
    setFloat,
    setCurrentTime,
    setCurrentVideoIndex,
    setCurrentVideo,
    setIsPlaying,
  } = useVideoContext();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const draggableRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex: number) => {
      return prevIndex < (playlist?.videos.length ?? 0) - 1 ? prevIndex + 1 : 0;
    });
  };

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prevIndex: number) => {
      return prevIndex > 0 ? prevIndex - 1 : (playlist?.videos.length ?? 1) - 1;
    });
  };

  useEffect(() => {
    if (playlist?.videos) {
      const video = playlist?.videos[currentVideoIndex] || {};
      setCurrentVideo(video);
      setCurrentTime(0);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = `/anime/${video.file_name}.mp4`;
        videoRef.current.load();
        videoRef.current.currentTime = 0;

        if (isPlaying) {
          videoRef.current.play();
        }
      }
    }
  }, [currentVideoIndex]);

  useEffect(() => {
    if (videoRef.current && currentVideo) {
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  }, [currentVideo, currentTime, isPlaying, float]);

  useEffect(() => {
    if (currentPlayingVideo) {
      setIsPlaying(false);
      setFloat(false);
      setCurrentTime(0);
      videoRef.current?.pause();
    }
  }, [currentPlayingVideo]);

  const togglePlayPause = () => {
    const video = videoRef.current;

    if (video) {
      setCurrentTime(video.currentTime);

      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openVideo = () => {
    const video = videoRef.current;

    if (!location.pathname.startsWith(`/playlist/${token}`)) {
      navigate(`/playlist/${token}`);
    }
    if (video) {
      setCurrentTime(video.currentTime);
    }

    setFloat(!float);
  };

  const closeVideo = () => {
    const video = videoRef.current;
    setFloat(false);
    if (video) {
      setCurrentTime(0);
      setCurrentVideoIndex(0);
      setCurrentVideo(null);
      setIsPlaying(false);
    }
  };

  return (
    <div>
      {float && (
        <Draggable nodeRef={draggableRef}>
          <div
            className="fixed bottom-5 left-5 bg-black rounded-lg shadow-lg z-[100] h-[10em] w-[15em]"
            ref={draggableRef}
          >
            <div className="flex items-center justify-center h-full w-full">
              <video
                ref={videoRef}
                className="w-full h-full rounded-lg object-cover"
                controls={false}
                onEnded={handleNextVideo}
              >
                <source
                  src={`/anime/${currentVideo?.file_name || "default"}.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="bg-black w-full h-full absolute top-0 rounded-lg bg-opacity-50 flex items-center justify-center gap-2">
              <div
                className="absolute top-1 left-1 text-white cursor-pointer opacity-50 hover:opacity-100"
                onClick={closeVideo}
              >
                <Icon path={mdiClose} size={0.8} />
              </div>
              <div
                className="absolute top-1 right-1 text-white cursor-pointer opacity-50 hover:opacity-100"
                onClick={openVideo}
              >
                <Icon path={mdiResize} size={0.8} />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousVideo();
                }}
                className="text-white opacity-50 hover:opacity-100 cursor-pointer"
              >
                <Icon path={mdiSkipPrevious} size={1} />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="p-2 rounded-full bg-black text-white opacity-50 hover:opacity-100 cursor-pointer"
              >
                <Icon path={isPlaying ? mdiPause : mdiPlay} size={1} />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextVideo();
                }}
                className="text-white opacity-50 hover:opacity-100 cursor-pointer"
              >
                <Icon path={mdiSkipNext} size={1} />
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default FloatingPlayer;

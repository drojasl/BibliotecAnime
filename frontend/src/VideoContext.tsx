import React, { createContext, useState, useContext, ReactNode } from "react";

interface Playlist {
  id: number;
  cover: string;
  name: string;
  token: string;
  video_count: number;
}

interface VideoContextProps {
  playlist: any;
  playlists: Playlist[];
  currentVideo: any;
  currentTime: number;
  currentVideoIndex: number;
  float: boolean;
  isPlaying: boolean;
  token: string;
  currentPlayingVideo: any;
  setPlaylist: (playlist: any[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setCurrentVideo: (video: any) => void;
  setCurrentTime: (time: number) => void;
  setCurrentVideoIndex: (
    index: number | ((prevIndex: number) => number)
  ) => void;
  setFloat: (shouldFloat: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setToken: (token: string) => void;
  setCurrentPlayingVideo: React.Dispatch<React.SetStateAction<any>>;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentVideo, setCurrentVideo] = useState<any>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [float, setFloat] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [token, setToken] = useState<string>("");
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<any>(null);

  return (
    <VideoContext.Provider
      value={{
        currentVideoIndex,
        playlist,
        playlists,
        currentVideo,
        currentTime,
        float,
        isPlaying,
        token,
        currentPlayingVideo,
        setPlaylist,
        setCurrentVideoIndex,
        setCurrentVideo,
        setCurrentTime,
        setFloat,
        setIsPlaying,
        setToken,
        setCurrentPlayingVideo,
        setPlaylists,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};

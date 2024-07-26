import Icon from "@mdi/react";
import { useEffect, useState, useRef } from "react";
import {
  mdiMagnify,
  mdiVideo,
  mdiPlaylistPlus,
  mdiMusicCircleOutline,
  mdiPlayBoxEditOutline,
  mdiMusicNotePlus,
} from "@mdi/js";
import Rating from "@mui/material/Rating";
import axios from "axios";
import Swal from 'sweetalert2'
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Textarea from '@mui/joy/Textarea';
import MenuItem from '@mui/material/MenuItem';

interface Video {
  id: number;
  user_id: number;
  file_name: string;
}

const style = {
  position: 'absolute',
  height: '80%',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  borderRadius: '1em'
};

const ExploreScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<any>([]);
  const [videoPlayingRoute, setVideoPlayingRoute] = useState("");
  const [viewPlayingVideo, setViewPlayingVideo] = useState(false);
  const [playingVideoTitle, setPlayingVideoTitle] = useState("");
  const [playingVideoAnime, setPlayingVideoAnime] = useState("");
  const [selectedVideo, setSelectedVideo] = useState();
  const [showAddPlaylists, setShowAddPlaylists] = useState(false);
  const [hiddenView, setHiddenView] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(0);
  const [isSelectingVideos, setIsSelectingVideos] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<any>([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const videoPlayer1 = useRef<any>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableVideoData, setEditableVideoData] = useState<any>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [actualSongUserId, setActualSongUserId] = useState(0);
  const [originalFile, setOriginalFile] = useState('');

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");
    if (loggedUserString) {
      const loggedUser = JSON.parse(loggedUserString);
      const userId = loggedUser.id;

      setUserId(userId);
      getVideosAndPlaylists(userId);
    } else {
      getVideosAndPlaylists();
    }
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.post(`${apiUrl}/languages`, {}, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setLanguages(response.data.response);

      } catch (error) {
        console.error("Error en la solicitud POST", error);
      }
    };

    fetchLanguages();
  }, []);

  const getVideosAndPlaylists = async (userId: any = null) => {
    try {
      const response = await axios.post(
        `${apiUrl}/getVideosQueue`,
        {
          user_id: userId,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setVideos(response.data.videos);
      setPlaylists(response.data.playlists);
    } catch (error) {
      console.error("Error en la solicitud POST", error);
    }
  };

  const playVideo = async (video: any) => {
    setSelectedVideos(video);
    setHiddenView(false)
    try {
      const response = await axios.post(
        `${apiUrl}/getVideoRating`,
        {
          user_id: userId,
          video_id: video.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setRatingValue(response.data.rating);
      } else {
        setRatingValue(0);
      }
    } catch (error) {
      console.error("Error al obtener el rating del video:", error);
    }

    setSelectedVideo(video.id);
    setViewPlayingVideo(!viewPlayingVideo);
    setPlayingVideoTitle(video.title);
    setPlayingVideoAnime(video.anime);
    setVideoPlayingRoute(video.file_name);
  };

  const ratedVideo = async (rating: number, id: any) => {
    setRatingValue(rating);
    const videoData = {
      id_user: userId,
      id_video: id,
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

  const addSong = async (playlistId: any) => {
    const videoIds = Array.isArray(selectedVideos) ? selectedVideos : [selectedVideos.id];

    const playlistData = {
      id_videos: videoIds,
      id_playlist: playlistId,
    };

    try {
      await axios.post(
        `${apiUrl}/addSongToPlaylist`,
        {
          data: playlistData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsSelectingVideos(false);
      setSelectedVideos([]);
      getVideosAndPlaylists(userId);
    } catch (error: any) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: error?.response?.data?.message,
        showConfirmButton: false,
        timer: 2500,
      });
      setIsSelectingVideos(false);
      setSelectedVideos([]);
    }
  };


  const handleSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const filteredVideos = videos.filter((video: any) =>
    video?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoSelect = (videoId: any) => {
    setSelectedVideos((prevSelected: any) =>
      prevSelected.includes(videoId)
        ? prevSelected.filter((id: any) => id !== videoId)
        : [...prevSelected, videoId]
    );
  };

  const createNewPlaylist = async () => {
    try {
      await axios.post(
        `${apiUrl}/createNewPlaylist`,
        {
          user_id: userId,
          playlist_name: newPlaylistName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      closeCreateModal();
      setNewPlaylistName("");
      getVideosAndPlaylists(userId);
    } catch (error) {
      console.error("Error creating new playlist:", error);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleNewPlaylistNameChange = (event: any) => {
    setNewPlaylistName(event.target.value);
  };

  const openEditModal = (videoId: any) => {
    const videoToEdit = videos.find(video => video.id === videoId);

    if (videoToEdit) {
      setActualSongUserId(videoToEdit?.user_id)
      setOriginalFile(videoToEdit?.file_name)
      setEditableVideoData(videoToEdit);
      setShowEditModal(true);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditableVideoData(null);
  };

  const saveVideoData = async () => {
    const formData = new FormData();

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    Object.entries({
      'id': editableVideoData?.id ?? '',
      'originalFile': originalFile ?? '',
      'userId': actualSongUserId ?? '',
      'artistName': editableVideoData?.artist ?? '',
      'animeFormat': editableVideoData?.format ?? '',
      'type': editableVideoData?.type ?? '',
      'animeNumber': editableVideoData?.number ?? '',
      'artistVersion': editableVideoData?.version ?? '',
      'releaseYear': editableVideoData?.year ?? '',
      'lyric': editableVideoData?.lyrics ?? '',
      'alternativeAnimeName': editableVideoData?.anime_alt ?? '',
      'alternativeAnimeTitle': editableVideoData?.title_alt ?? '',
      'fatherAnimeName': editableVideoData?.anime_parent ?? '',
      'selectedLanguage': editableVideoData?.language ?? '',
      'songName': editableVideoData?.title ?? '',
      'animeName': editableVideoData?.anime ?? '',
    }).forEach(([key, value]) => {
      formData.append(key, value);
    });
    try {
      await axios.post(
        `${apiUrl}/updateVideo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      closeEditModal();
      getVideosAndPlaylists(userId);
    } catch (error) {
      console.error("Error updating video data:", error);
    }
  };



  const handleVideoDataChange = (event: any) => {
    const { name, value } = event.target;
    setEditableVideoData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="text-white">
      <div className="flex justify-center p-3">
        <div className="relative w-full max-w-xl">
          <span className="absolute left-3 h-full items-center flex">
            <Icon path={mdiMagnify} size={0.7} />
          </span>
          <input
            type="text"
            className="bg-white bg-opacity-10 rounded-full py-2 px-10 w-full"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className={`col-span-12 ${userId > 0 ? 'md:col-span-9' : 'md:col-span-12'} flex flex-wrap`}>
          <p className="font-bold text-[1.4em] w-full mb-4">Explore Recommended Videos</p>
          {Array.isArray(filteredVideos) &&
            filteredVideos.map((video: any, index) => (
              < div key={index} className="my-2 px-2 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 relative" >
                {isSelectingVideos && (
                  <input
                    type="checkbox"
                    className="absolute top-2 left-5 z-10 appearance-none h-5 w-5 rounded-full border-2 border-gray-300 checked:bg-[#483EA8] checked:border-transparent focus:outline-none"
                    checked={selectedVideos.includes(video?.id)}
                    onChange={() => handleVideoSelect(video.id)}
                  />

                )}
                <div className="rounded-md h-[10em] w-full flex justify-center items-center">
                  <video
                    src={`../../anime/${video?.file_name}`}
                    className="w-full h-full rounded-md hover:cursor-pointer"
                    style={{ objectFit: "cover" }}
                    onClick={() => {
                      if (!isSelectingVideos) playVideo(video);
                    }}
                  ></video>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{video?.title}</p>
                    <p className="opacity-50 text-[0.9em]">{video?.anime}</p>
                  </div>
                  {userId > 0 && (
                    <div onClick={() => openEditModal(video?.id)}>
                      <Icon
                        path={mdiPlayBoxEditOutline}
                        size={0.7}
                        className="opacity-30 hover:opacity-100 hover:cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        {userId > 0 && (
          <div className="col-span-12 md:col-span-3 relative">
            <div className=" text-white pr-[1em] sticky top-5">
              <div className="flex items-center justify-between"
              >
                <p className="font-bold text-[1.4em]">Your Playlists</p>
                <div
                  onClick={openCreateModal}>
                  <Icon
                    path={mdiPlaylistPlus}
                    size={1}
                    className="hover:cursor-pointer"
                  />
                </div>
              </div>
              {playlists.length !== 0 ? (
                playlists.map((playlist: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-50 rounded-md h-[5em] w-full flex items-center my-4 p-2 justify-between"
                  >
                    <div className="flex h-full items-center">
                      <div className="h-[100%] w-[20%] md:w-[5vw] rounded-md">
                        <video
                          src={`../../anime/${playlist?.videos[0]?.file_name}`}
                          className="w-full h-full rounded-md hover:cursor-pointer"
                          style={{ objectFit: "cover" }}
                        ></video>
                      </div>
                      <div className="ml-2">
                        <p>{playlist?.name}</p>
                        <div className="flex items-center">
                          <Icon path={mdiVideo} size={0.7} className="opacity-30" />
                          <p className="text-[0.7em] ml-1">{playlist?.videos?.length} videos</p>
                        </div>
                      </div>
                    </div>
                    <div className="hover:cursor-pointer" onClick={() => {
                      setIsSelectingVideos(true);
                      setCurrentPlaylistId(playlist?.id);
                    }}>
                      <Icon
                        path={mdiMusicNotePlus}
                        size={1}

                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white bg-opacity-50 rounded-md h-[5em] w-full flex items-center my-4 p-2 justify-between">
                  <p>No playlists found</p>
                  <div onClick={openCreateModal}>
                    <Icon
                      path={mdiPlaylistPlus}
                      size={1}
                      className="hover:cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {
        isSelectingVideos && (
          <div className="flex justify-center mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
              onClick={() => addSong(currentPlaylistId)}
            >
              Add Selected Videos to Playlist
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-md ml-5 hover:bg-red-700 transition-colors duration-300 shadow-md"
              onClick={() => {
                setIsSelectingVideos(false);
                setSelectedVideos([]);
              }}
            >
              Cancel
            </button>
          </div>

        )
      }
      {
        showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <p className="text-black mb-4 text-lg font-semibold">Create New Playlist</p>
              <input
                type="text"
                className="border text-black border-gray-300 rounded-md px-3 py-2 w-full mb-4"
                placeholder="Enter playlist name"
                value={newPlaylistName}
                onChange={handleNewPlaylistNameChange}
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  onClick={createNewPlaylist}
                >
                  Create Playlist
                </button>
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }
      {
        viewPlayingVideo && (
          <div
            id="videoPlayer"
            className={`flex items-center justify-center fixed top-0 h-[100vh] left-2 right-2 bg-black bg-opacity-75 rounded-md p-4 ${hiddenView ? "hidden" : "block"
              }`}
          >
            <div className="relative rounded-md">
              <div className="absolute top-4 right-2 text-white flex justify-center items-center" style={{ zIndex: '1000' }}>
                {userId > 0 && (
                  <div
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md mr-3 hover:cursor-pointer"
                    onClick={() => setShowAddPlaylists(true)}
                  >
                    <p>Add to playlist</p>
                  </div>
                )}
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md"
                  onClick={() => {
                    setShowAddPlaylists(false);
                    setViewPlayingVideo(false);
                  }}
                >
                  Close
                </button>
              </div>

              <video
                ref={videoPlayer1}
                src={`../../anime/${videoPlayingRoute}`}
                className="rounded-md"
                style={{
                  objectFit: 'cover',
                  height: '90vh',
                  width: '80vw'
                }}
                controls
                autoPlay
                onEnded={() => setViewPlayingVideo(false)}
              /><div className="hidden md:flex absolute top-3 left-0 bg-black rounded-lg py-2 mx-3 px-3 bg-opacity-50 flex items-center justify-between text-white">
                <div>
                  <div className="flex items-center">
                    <p className="font-bold text-[1.3em] ml-1">
                      {playingVideoTitle}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Icon path={mdiMusicCircleOutline} size={0.6} />
                    <p className="opacity-50 ml-1">
                      {playingVideoAnime}
                    </p>
                  </div>
                  {userId > 0 && (
                    <div>
                      <Rating
                        name="video-rating"
                        value={ratingValue}
                        className="mt-2"
                        onChange={(_, newValue: any) => {
                          ratedVideo(newValue, selectedVideo);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        showAddPlaylists && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-md mx-auto">
              <p className="text-black mb-4 text-lg font-semibold">Add to Playlist</p>
              <div className="space-y-3">
                {playlists.map((playlist: any, index: any) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-black px-2 py-3 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-300"
                    onClick={() => {
                      addSong(playlist.id);
                      setShowAddPlaylists(false);
                    }}
                  >
                    <p className="font-medium">{playlist.name}</p>
                  </div>
                ))}
              </div>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-md mt-4 w-full hover:bg-red-700 transition-colors duration-300 shadow-md"
                onClick={() => {
                  setShowAddPlaylists(false);
                  setViewPlayingVideo(false);
                }}
              >
                Close
              </button>
            </div>
          </div>

        )
      }
      <Modal
        open={showEditModal}
        onClose={closeEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h2 className="font-bold text-[1.4em] mb-4">Edit Video Details</h2>

          <div className="mb-4">
            <label className="block mb-2">Upload Video</label>
            <input
              type="file"
              name="videoFile"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Title', name: 'title', value: editableVideoData?.title },
              { label: 'Anime', name: 'anime', value: editableVideoData?.anime },
              { label: 'Anime Padre', name: 'anime_parent', value: editableVideoData?.anime_parent },
              { label: 'Anime Alt', name: 'anime_alt', value: editableVideoData?.anime_alt },
              { label: 'Anime Type', name: 'type', value: editableVideoData?.type },
              { label: 'Anime Format', name: 'format', value: editableVideoData?.format },
              { label: 'Title Alt', name: 'title_alt', value: editableVideoData?.title_alt },
              { label: 'Artist', name: 'artist', value: editableVideoData?.artist },
              { label: 'Language', name: 'language', value: editableVideoData?.language },
              { label: 'Year', name: 'year', value: editableVideoData?.year },
              { label: 'Number', name: 'number', value: editableVideoData?.number },
              { label: 'Version', name: 'version', value: editableVideoData?.version },
            ].map((field, index) => (
              <div key={index}>
                <label className="block mb-2">{field.label}</label>
                {field.name === 'type' ? (
                  <TextField
                    select
                    className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name={field.name}
                    value={editableVideoData?.[field.name]}
                    onChange={handleVideoDataChange}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="Opening">Opening</MenuItem>
                    <MenuItem value="Ending">Ending</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                ) : field.name === 'format' ? (
                  <TextField
                    select
                    className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name={field.name}
                    value={editableVideoData?.[field.name]}
                    onChange={handleVideoDataChange}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="Pelicula">Pelicula</MenuItem>
                    <MenuItem value="Serie">Serie</MenuItem>
                  </TextField>
                ) : field.name === 'language' ? (
                  <TextField
                    select
                    className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name={field.name}
                    value={editableVideoData?.[field.name]}
                    onChange={handleVideoDataChange}
                  >
                    {languages.map((language, index) => (
                      <MenuItem key={index} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    type="text"
                    name={field.name}
                    value={field.value}
                    onChange={handleVideoDataChange}
                    className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block mb-2">Lyrics</label>
            <Textarea
              aria-label="empty textarea"
              name="lyrics"
              className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              minRows={4}
              maxRows={10}
              placeholder={editableVideoData?.lyrics}
              value={editableVideoData?.lyrics}
              onChange={handleVideoDataChange}
            />
          </div>

          <div className="flex justify-end mt-4 space-x-3">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
              onClick={saveVideoData}
            >
              Save
            </button>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md"
              onClick={closeEditModal}
            >
              Cancel
            </button>
          </div>
        </Box>
      </Modal>
    </div >
  );
};

export default ExploreScreen;

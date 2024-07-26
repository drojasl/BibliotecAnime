import Icon from "@mdi/react";
import {
  mdiClockTimeEight,
  mdiVideo,
  mdiDotsHorizontal,
  mdiAccount,
  mdiPencil,
  mdiClose,
} from "@mdi/js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const backgroundImageUrl = 'url("../../public/PlaylistImg.jpg")';

interface User {
  email: string;
  roles: string;
  id: number;
  nick_name: string;
}

const ProfileScreen = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [editPlaylistMode, setEditPlaylistMode] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const loggedUser: User = JSON.parse(localStorage.getItem('loggedUser') || '{}');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");
    if (loggedUserString) {
      const loggedUser = JSON.parse(loggedUserString);
      const userId = loggedUser.id;

      setUserId(userId);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users/${username}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
    setNewProfilePic(userData.profile_pic);
    setNewUsername(userData.nick_name);
  };

  const handleCancelEdit = () => {
    setEditPlaylistMode(false);
    setShowPlaylistMenu(false);
  };

  const handleSaveProfile = async () => {
    try {
      if (newUsername !== userData.nick_name) {
        await axios.post(`${apiUrl}/validate-username`, {
          username: newUsername,
        });
      }

      const response = await axios.put(`${apiUrl}/users/update/${userData.id}`, {
        profile_pic: newProfilePic,
        nick_name: newUsername,
      });

      if (response.status === 200) {
        const updatedUser = {
          ...loggedUser,
          nick_name: newUsername,
        };
        localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

        fetchUserData();
        setEditMode(false);
        navigate(`/profile/${newUsername}`);
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: 'An error occurred, try again',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } catch (error: any) {
      console.error("Error saving profile:", error?.response?.data?.message);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: error?.response?.data?.message,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'The image cannot be larger than 1MB.',
        });
        return;
      }

      const base64String = await convertFileToBase64(file);
      setNewProfilePic(base64String);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const togglePlaylistMenu = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setShowPlaylistMenu((prev) => !prev);
  };

  const handleEditPlaylist = () => {
    setEditPlaylistMode(true);
    setNewPlaylistName(selectedPlaylist.name);
    setShowPlaylistMenu(false);
  };

  const handleSavePlaylist = async () => {
    try {
      await axios.put(`${apiUrl}/playlists/update/${selectedPlaylist.id}`, {
        name: newPlaylistName,
      });

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: 'Playlist updated successfully',
        showConfirmButton: false,
        timer: 1500,
      });

      fetchUserData();
      setEditPlaylistMode(false);
    } catch (error) {
      console.error("Error updating playlist:", error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: 'An error occurred, try again',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await axios.delete(`${apiUrl}/deltePlaylist/${selectedPlaylist.id}`);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: 'Playlist deleted successfully',
        showConfirmButton: false,
        timer: 1500,
      });
      fetchUserData();
      setShowPlaylistMenu(false);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: 'An error occurred, try again',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      await axios.delete(`${apiUrl}/playlists/${selectedPlaylist.id}/delete/${videoId}`);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: 'Video deleted successfully',
        showConfirmButton: false,
        timer: 1500,
      });
      fetchUserData();
      setSelectedPlaylist((prev: any) => ({
        ...prev,
        videos: prev.videos.filter((video: any) => video.id !== videoId),
      }));
    } catch (error) {
      console.error("Error deleting video:", error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: 'An error occurred, try again',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleNewPlaylistNameChange = (event: any) => {
    setNewPlaylistName(event.target.value);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
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
      fetchUserData()
    } catch (error) {
      console.error("Error creating new playlist:", error);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="text-white flex justify-center items-center py-5">
      <div className="w-[90%] lg:w-[50%] md:px-5">
        <div className="bg-[#202021] px-3 py-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center relative">
              <div className="bg-[#636364] flex items-center justify-center rounded-full h-[5em] w-[5em]">
                {editMode ? (
                  <div className="relative h-full w-full rounded-full">
                    <label
                      htmlFor="profilePicUpload"
                      className="cursor-pointer h-full w-full rounded-full"
                    >
                      <input
                        type="file"
                        id="profilePicUpload"
                        accept="image/*"
                        className="absolute inset-0 opacity-0"
                        onChange={handleProfilePicChange}
                      />
                      <img
                        src={newProfilePic}
                        alt="Profile Pic"
                        className="rounded-full h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity duration-300">
                        <Icon path={mdiPencil} size={1} className="text-white" />
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="h-full w-full">
                    {userData && userData.profile_pic ? (
                      <img
                        src={userData.profile_pic}
                        alt="Profile Pic"
                        className="rounded-full h-full w-full object-cover"
                      />
                    ) : (
                      <Icon path={mdiAccount} className="p-3" />
                    )}
                  </div>
                )}
              </div>
              <div className="ml-3">
                {editMode ? (
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="border-b-2 border-gray-400 bg-transparent outline-none text-lg w-48 sm:w-auto"
                  />
                ) : (
                  <p>{userData ? userData?.nick_name : "Loading..."}</p>
                )}
                <p className="opacity-30">@{username}</p>
              </div>
            </div>
            {editMode ? (
              <div className="flex items-center">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  onClick={handleSaveProfile}
                >
                  Save
                </button>
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className="rounded-md py-1 px-2 bg-[#483EA8] hover:cursor-pointer"
                onClick={handleEditProfile}
              >
                Edit Profile
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between my-3 px-2">
          <p>Your playlists</p>
          <p className="opacity-30">{userData ? userData.playlists.length : 0}</p>
        </div>
        {userData && userData.playlists.length === 0 && (
          <div className="w-full bg-[#202021] rounded-md py-3 text-center">
            <p>
              Ops, no tienes ninguna playlist por ahora,{" "}
              <span className="rounded-md text-[#483EA8] font-bold hover:cursor-pointer" onClick={openCreateModal}>
                ¡Crea una!
              </span>
            </p>
          </div>
        )}
        {showCreateModal && (
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
        )}
        {editPlaylistMode && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex justify-center items-center">
            <div className="bg-white text-black rounded p-5 z-1 w-[95vw] md:w-[70vw]  xl:w-[40vw]">
              <h2 className="text-xl mb-4 font-bold">Edit Playlist</h2>
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="border-b-2 border-gray-400 bg-transparent outline-none text-lg w-full mr-5"
                />

                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
                  onClick={handleSavePlaylist}
                >
                  Save
                </button>
              </div>
              {selectedPlaylist.videos.length > 0 &&
                (
                  <>
                    <h3 className="text-lg font-bold">Videos</h3>
                    <ul>
                      {selectedPlaylist.videos.map((video: any) => (
                        <li key={video.id} className="flex justify-between items-center my-4">
                          <p>{video.title}</p>
                          <div onClick={() => handleDeleteVideo(video.id)}
                          >
                            <Icon
                              path={mdiClose}
                              size={1}
                              className="text-red-500 cursor-pointer"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>

                  </>
                )}
              <div className="flex justify-between">
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {userData &&
          userData.playlists.map((playlist: any) => (
            <div key={playlist.id} className="w-full bg-[#202021] rounded-md flex mb-3 relative">
              <div
                className="bg-blue-500 h-[8em] w-[30%] rounded-md"
                style={{
                  backgroundImage: backgroundImageUrl,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div className="w-full px-3">
                <div className="h-[50%] flex items-center justify-between">
                  <p>{playlist.name}</p>
                  <div onClick={() => togglePlaylistMenu(playlist)} >
                    <Icon path={mdiDotsHorizontal} size={0.6} className="cursor-pointer" />
                  </div>
                </div>
                <hr />
                <div className="h-[50%] flex items-center">
                  <div className="flex items-center">
                    <Icon path={mdiClockTimeEight} size={0.6} className="opacity-30" />
                    <p className="ml-1">{playlist.date}</p>
                  </div>
                  <div className="flex items-center ml-2">
                    <Icon path={mdiVideo} size={0.7} className="opacity-30" />
                    <p className="ml-1">
                      {playlist.videos.length} {playlist.videos.length === 1 ? "video" : "videos"}
                    </p>
                  </div>
                </div>
                {showPlaylistMenu && selectedPlaylist.id === playlist.id && (
                  <div className="absolute bg-white text-black rounded shadow-lg mt-1 bottom-[5em] right-0 whitespace-nowrap">
                    <button
                      onClick={handleEditPlaylist}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Edit Playlist
                    </button>
                    <button
                      onClick={handleDeletePlaylist}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Delete Playlist
                    </button>
                    <button
                      onClick={() => setShowPlaylistMenu(false)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div >
  );
};

export default ProfileScreen;

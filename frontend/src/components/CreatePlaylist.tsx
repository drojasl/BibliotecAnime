import Icon from "@mdi/react";
import { useState } from "react";
import { mdiPencil } from "@mdi/js";
import axios from "../axios";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { useUser } from "../UserContext";

interface CreatePlaylistProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePlaylist: React.FC<CreatePlaylistProps> = ({
  onClose,
  onSuccess,
}) => {
  const { user_id } = useUser();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistPic, setPlaylistPic] = useState("");

  const handlePlaylistPicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        // 1MB in bytes
        console.log("File size too large");
        return;
      }

      const base64String = await convertFileToBase64(file);
      setPlaylistPic(base64String);
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

  const createPlaylist = async () => {
    try {
      await axios.post(`/playlists/create`, {
        user_id: user_id,
        playlist_name: playlistName,
        cover: playlistPic,
      });
      alert("Playlist created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ClickAwayListener onClickAway={onClose}>
        <div className="bg-white rounded-lg text-black min-w-[30em]">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex gap-2 items-center justify-center">
              <p className="font-bold text-[1.2em]">Create Playlist</p>
            </div>
            <hr />
            <div className="flex gap-4">
              <div className="relative h-[13em] w-[13em] rounded-md">
                <label
                  htmlFor="playlistPicUpload"
                  className="cursor-pointer h-full w-full rounded-md"
                >
                  <input
                    type="file"
                    id="playlistPicUpload"
                    accept="image/*"
                    className="absolute inset-0 opacity-0"
                    onChange={handlePlaylistPicChange}
                  />
                  {playlistPic ? (
                    <div className="relative w-full h-full rounded-md">
                      <img
                        src={playlistPic}
                        alt="Playlist Cover"
                        className="rounded-md w-full h-full object-cover bg-grey-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-md bg-black bg-opacity-20 hover:bg-opacity-70 transition-opacity duration-300">
                        <Icon
                          path={mdiPencil}
                          size={1}
                          className="text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-md bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity duration-300">
                      <Icon path={mdiPencil} size={1} className="text-white" />
                    </div>
                  )}
                </label>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <label htmlFor="playlistName" className="font-bold">
                  Playlist Name
                </label>
                <input
                  type="text"
                  id="playlistName"
                  className="py-1 px-3 rounded-md bg-[#F2F2F2] font-bold text-[2em] mb-2 w-[300px]"
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="rounded-md py-2 px-8 bg-[#1A50FA] w-fit text-white"
                    onClick={createPlaylist}
                  >
                    Create
                  </button>
                  <button
                    className="rounded-md py-2 px-8 bg-[#FF2727] w-fit text-white"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
};

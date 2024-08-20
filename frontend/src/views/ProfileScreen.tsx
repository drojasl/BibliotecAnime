import Icon from "@mdi/react";
import { mdiVideo, mdiAccount, mdiDotsHorizontal, mdiPencil } from "@mdi/js";
import { useUser } from "../UserContext";
import { useEffect, useState } from "react";
import axios from "../axios";

const ProfileScreen = () => {
  const { name, token, user_id, nick_name, profile_pic, cover_photo, setUser } =
    useUser();

  const [posts, setPosts] = useState<any>([]);
  const [editProfile, setEditProfile] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState("");
  const [newCoverPic, setNewCoverPic] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileUserName, setNewProfileUserName] = useState("");

  useEffect(() => {
    const getUserPosts = async () => {
      try {
        const response = await axios.get(`/getUserPosts`, {
          params: { user_id },
          headers: { "Content-Type": "application/json" },
        });
        setPosts(response.data.videos);
      } catch (error) {
        console.error("Error en la solicitud GET", error);
      }
    };
    if (user_id) {
      getUserPosts();
    }
  }, [user_id]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        console.log("File size exceeds 1MB");
        return;
      }
      try {
        const base64String = await convertFileToBase64(file);
        setFile(base64String);
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const validateUsername = async (username: string) => {
    try {
      const response = await axios.post("/profile/validateUsername", {
        userName: username,
      });
      return response.status === 200;
    } catch (error) {
      console.error("Username validation error:", error);
      return false;
    }
  };

  const updateProfile = async () => {
    let isUsernameValid = true;

    if (newProfileUserName && newProfileUserName !== nick_name) {
      isUsernameValid = await validateUsername(newProfileUserName);
    }

    if (!isUsernameValid) {
      console.error("Username already exists");
      return;
    }

    try {
      await axios.put(`/profile/update/${token}`, {
        profilePic: newProfilePic ? newProfilePic : profile_pic,
        cover: newCoverPic ? newCoverPic : cover_photo,
        name: newProfileName ? newProfileName : name,
        userName: newProfileUserName ? newProfileUserName : nick_name,
      });

      setUser({
        profile_pic: newProfilePic || profile_pic,
        cover_photo: newCoverPic || cover_photo,
        name: newProfileName ? newProfileName.split(" ")[0] : name,
        nick_name: newProfileUserName || nick_name,
      });

      setEditProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div
      className="text-white bg-[#18181B] rounded-xl relative flex flex-col items-center overflow-y-auto"
      style={{ height: `calc(100vh - 1rem)` }}
    >
      <div className="h-[20em] bg-black w-full rounded-t-xl relative flex items-end">
        {editProfile ? (
          <div className="relative w-full h-full">
            <label
              htmlFor="coverPicUpload"
              className="cursor-pointer h-full w-full rounded-md"
            >
              <input
                type="file"
                id="coverPicUpload"
                accept="image/*"
                className="absolute inset-0 opacity-0"
                onChange={(e) => handleFileChange(e, setNewCoverPic)}
              />
              <div className="relative w-full h-full rounded-md">
                <img
                  src={newCoverPic || cover_photo}
                  alt="Cover"
                  className="rounded-md w-full h-full object-cover bg-grey-100"
                />
                <div className="absolute inset-0 flex items-center justify-center h-full w-full rounded-md bg-black bg-opacity-20 hover:bg-opacity-70 transition-opacity duration-300">
                  <Icon path={mdiPencil} size={1} className="text-white" />
                </div>
              </div>
            </label>
          </div>
        ) : (
          <img
            src={cover_photo || "../../public/DefaultCove.jpg"}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        )}

        <div className="absolute w-full px-[2vw] py-4 bottom-[-35%]">
          <div className="flex gap-4 items-end">
            <div
              className="h-40 w-40 bg-black flex items-center justify-center rounded-lg"
              style={{ boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.2)" }}
            >
              {editProfile ? (
                <div className="relative w-full h-full">
                  <label
                    htmlFor="profilePicUpload"
                    className="cursor-pointer h-full w-full rounded-md"
                  >
                    <input
                      type="file"
                      id="profilePicUpload"
                      accept="image/*"
                      className="absolute inset-0 opacity-0"
                      onChange={(e) => handleFileChange(e, setNewProfilePic)}
                    />
                    <div className="relative w-full h-full rounded-md">
                      <img
                        src={newProfilePic || profile_pic}
                        alt="Profile Pic"
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
                  </label>
                </div>
              ) : profile_pic ? (
                <img
                  src={profile_pic}
                  alt="Profile Pic"
                  className="object-cover rounded-lg h-full w-full"
                />
              ) : (
                <Icon path={mdiAccount} size={4} />
              )}
            </div>
            <div className="flex-grow flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[1.2em] font-bold">
                  {editProfile ? (
                    <input
                      type="text"
                      className="py-1 px-3 rounded-md bg-[#2E2F34] font-bold w-fit mb-2"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                  ) : (
                    <h1 className="font-bold">{name}</h1>
                  )}
                </p>
                <p className="opacity-50">
                  {editProfile ? (
                    <input
                      type="text"
                      className="py-1 px-3 rounded-md bg-[#2E2F34] font-bold w-fit mb-2"
                      value={newProfileUserName}
                      onChange={(e) => setNewProfileUserName(e.target.value)}
                    />
                  ) : (
                    <h1 className="font-bold">@{nick_name}</h1>
                  )}
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <button
                  className="rounded-md py-2 px-8 bg-[#1A50FA] w-fit"
                  onClick={() => {
                    if (editProfile) {
                      updateProfile();
                    } else {
                      setEditProfile(true);
                    }
                  }}
                >
                  {editProfile ? "Save" : "Edit Profile"}
                </button>
                {editProfile && (
                  <button
                    className="rounded-md py-2 px-8 bg-[#FF2727] w-fit"
                    onClick={() => {
                      setEditProfile(false),
                        setNewProfileUserName(""),
                        setNewProfileName(""),
                        setNewCoverPic(""),
                        setNewProfilePic("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[12em] w-full px-[2vw]">
        <div className="flex opacity-50 gap-2 p-2 border-b border-b-[5px] w-fit">
          <Icon path={mdiVideo} size={1} />
          <p>Your Posts</p>
        </div>
        <hr className="opacity-10" />
        <div className="flex py-5 gap-4 flex-wrap overflow-y-auto">
          {posts?.map((post: any, index: number) => (
            <div
              className="md:w-[calc(50%-1rem)] md:h-[30vh] lg:h-[15vw] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] relative rounded-lg"
              key={index}
            >
              <img
                src={post?.cover}
                className="object-cover h-full w-full rounded-lg"
                alt={post?.title}
              />
              <div className="h-full w-full bg-black bg-opacity-70 rounded-lg absolute top-0 flex flex-col items-center justify-between p-2 cursor-pointer">
                <div className="w-full flex justify-end">
                  <Icon path={mdiDotsHorizontal} size={1} />
                </div>
                <div className="flex flex-col w-full items-start">
                  <p className="font-bold">{post?.title}</p>
                  <p className="opacity-50 text-[0.8em]">{post?.anime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

import Icon from "@mdi/react";
import { mdiClockTimeEight, mdiVideo, mdiDotsHorizontal } from "@mdi/js";

const ProfileScreen = () => {
  return (
    <div className="text-white flex justify-center items-center py-5">
      <div className="w-[90%] lg:w-[50%] md:px-5">
        <div className="bg-[#202021] px-3 py-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center">
              <div className="rounded-full bg-red-500 h-[5em] w-[5em]"></div>
              <div className="ml-3">
                <p>Alejandro Ospina Rojas</p>
                <p className="opacity-30">@alejospinaro</p>
              </div>
            </div>
            <div className="bg-[#483ea8] rounded-md py-1 px-2">Edit Profile</div>
          </div>
        </div>
        <div className="flex justify-between my-3 px-2">
          <p>Your playlists</p>
          <p className="opacity-30">1</p>
        </div>
        <div className="w-full bg-[#202021] rounded-md flex">
          <div className="bg-blue-500 h-[8em] w-[30%] rounded-md"></div>
          <div className="w-full px-3">
            <div className="h-[50%] flex items-center justify-between">
              <p>My playlist name</p>
              <Icon
                path={mdiDotsHorizontal}
                size={0.6}
              />
            </div>
            <hr />
            <div className="h-[50%] flex items-center">
              <div className="flex items-center">
                <Icon
                  path={mdiClockTimeEight}
                  size={0.6}
                  className="opacity-30"
                />
                <p className="ml-1">Nov. 20 2023</p>
              </div>
              <div className="flex items-center ml-2">
                <Icon path={mdiVideo} size={0.7} className="opacity-30" />
                <p className="ml-1">6 videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileScreen;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import logo from "../../public/logo.png";
import {
  mdiPlayCircleOutline,
  mdiEarth,
  mdiLogin,
  mdiPlusCircleOutline,
  mdiAccount,
} from "@mdi/js";

export const Navbar = () => {
  const [isLogedUser, setIsLogedUser] = useState(false);

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");
    if (loggedUserString) {
      setIsLogedUser(true);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col justify-between pr-5">
        <div>
          <img src={logo} className="w-[4em]" alt="Logo" />
        </div>
        <div className="rounded-full p-2 max-w-min">
          <div className="my-3 max-w-min">
            <Link
              to="/"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1"
              data-tooltip-id="toolTip"
              data-tooltip-content="For you"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d={mdiPlayCircleOutline} />
              </svg>
            </Link>
          </div>
          <div className="my-3">
            <Link
              to="/Explore"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1"
              data-tooltip-id="toolTip"
              data-tooltip-content="Explore"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d={mdiEarth} />
              </svg>
            </Link>
          </div>
        </div>
        <div>
          {isLogedUser && (
            <div
              className="rounded-full p-2 mb-3 hover:cursor-pointer max-w-min"
              style={{ backgroundColor: "#483ea8", height: "fit-content" }}
              data-tooltip-id="toolTip"
              data-tooltip-content="Add song"
            >
              <Link
                to="/upload"
                className="text-white rounded-full flex justify-center items-center p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d={mdiPlusCircleOutline} />
                </svg>
              </Link>
            </div>
          )}
          {!isLogedUser ? (
            <Link
              to="/login"
              className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1 max-w-min"
            >
              <div
                className="rounded-full p-2"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  height: "fit-content",
                }}
                data-tooltip-id="toolTip"
                data-tooltip-content="Log in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d={mdiLogin} />
                </svg>
              </div>
            </Link>
          ) : (
            <div>
              <Link
                to="/profile"
                className="hover:bg-white hover:bg-opacity-50 text-white rounded-full flex justify-center items-center p-1 max-w-min"
              >
                <div
                  className="rounded-full p-2 hover:cursor-pointer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    height: "fit-content",
                  }}
                  data-tooltip-id="toolTip"
                  data-tooltip-content="Profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path d={mdiAccount} />
                  </svg>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Tooltip
        id="toolTip"
        effect="solid"
        place="top"
        style={{
          backgroundColor: "white",
          color: "black",
          fontSize: "14px",
          zIndex: "1000",
        }}
      />
    </>
  );
};

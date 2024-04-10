import Icon from "@mdi/react";
import {
  mdiApple,
  mdiFacebook,
  mdiGoogle,
  mdiEyeOutline,
  mdiEyeOffOutline,
} from "@mdi/js";
import { useState, useEffect } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

const ProfileScreen = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const location = useLocation();

  const [isLogInView, setIsLogInView] = useState(
    location.pathname === "/login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false);
  const [alertMessageLogIn, setAlertMessageLogIn] = useState("");
  const [alertLogInSeverity, setAlertLogInSeverity] = useState("success");
  const [showAlertLogIn, setShowAlertLogIn] = useState(false);
  const [alertMessageSignUp, setAlertMessageSignUp] = useState("");
  const [alertSignUpSeverity, setlertSignUpSeverity] = useState("success");
  const [showAlertSignUp, setShowAlertSignUp] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    passwordRep: "",
  });

  useEffect(() => {
    const loggedUserString = localStorage.getItem("loggedUser");
    if (loggedUserString) {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlertLogIn(false);
      setShowAlertSignUp(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showAlertLogIn, showAlertSignUp]);

  const toggleView = () => {
    setIsLogInView((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChangeSignUp = (e: any) => {
    const { name, value } = e.target;
    setSignUpData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const loginUser = async () => {
    try {
      const requestData = {
        email: loginData.email,
        password: loginData.password,
      };

      const response = await axios.post(`${apiUrl}/login`, requestData);
      setAlertMessageLogIn(response?.data?.message);
      setAlertLogInSeverity("success");
      setShowAlertLogIn(true);

      const { email, roles, id, nick_name } = response.data.user;

      const loggedUser = {
        email,
        roles,
        id,
        nick_name,
      };

      const loggedUserString = JSON.stringify(loggedUser);

      localStorage.setItem("loggedUser", loggedUserString);

      window.location.href = "/";
    } catch (error) {
      setAlertMessageLogIn(error?.response?.data?.message);
      setAlertLogInSeverity("warning");
      setShowAlertLogIn(true);
    }
  };

  const signUpUser = async () => {
    try {
      // Validar si password y passwordRep son iguales
      if (signUpData.password !== signUpData.passwordRep) {
        setAlertMessageSignUp("Las contraseñas no coinciden");
        setlertSignUpSeverity("error");
        setShowAlertSignUp(true);
        return;
      }

      const requestData = {
        username: signUpData.username,
        email: signUpData.email,
        password: signUpData.password,
      };

      const response = await axios.post(`${apiUrl}/signup`, requestData);

      console.log(response?.data?.message);

      setAlertMessageSignUp(response?.data?.message);
      setlertSignUpSeverity("success");
      setShowAlertSignUp(true);

      const { email, roles, id, nick_name } = response.data.user;

      const loggedUser = {
        email,
        roles,
        id,
        nick_name,
      };

      const loggedUserString = JSON.stringify(loggedUser);

      localStorage.setItem("loggedUser", loggedUserString);

      window.location.href = "/";
    } catch (error) {
      setAlertMessageSignUp(error?.response?.data?.message);
      setlertSignUpSeverity("warning");
      setShowAlertSignUp(true);
    }
  };

  const authUserGoogle = async (response: any, path: string) => {
    const responseDecoded = jwtDecode(response?.credential);

    if (path == "login") {
      try {
        const requestData = {
          email: responseDecoded?.email,
        };

        const response = await axios.post(
          `${apiUrl}/login/google`,
          requestData
        );
        setAlertMessageLogIn(response?.data?.message);
        setAlertLogInSeverity("success");
        setShowAlertLogIn(true);

        const { email, roles, id, nick_name } = response.data.user;

        const loggedUser = {
          email,
          roles,
          id,
          nick_name,
        };

        const loggedUserString = JSON.stringify(loggedUser);

        localStorage.setItem("loggedUser", loggedUserString);

        window.location.href = "/";
      } catch (error) {
        setAlertMessageLogIn(error?.response?.data?.message);
        setAlertLogInSeverity("warning");
        setShowAlertLogIn(true);
      }
    }
  };
  function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log("Name: " + profile.getName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.
  }

  return (
    <div className="text-white flex justify-center items-center flex-col py-5 h-full">
      {isLogInView ? (
        <>
          <div
            className="flex bg-[#121212] rounded-full p-1 mb-3 w-[20em]"
            style={{ boxShadow: "0px 0px 5px black" }}
          >
            <div className="w-[50%] justify-center flex items-center bg-[#212121] rounded-full p-1 hover:cursor-pointer">
              <p>Log in</p>
            </div>
            <div
              className="w-[50%] justify-center flex items-center hover:cursor-pointer rounded-full hover:bg-[#212121]"
              onClick={toggleView}
            >
              <p>Sign up</p>
            </div>
          </div>
          <div
            className="bg-[#121212] rounded-md mt-[0.5em] py-3 px-4 w-[25em]"
            style={{ boxShadow: "0px 0px 5px black" }}
          >
            {showAlertLogIn && (
              <Alert severity={alertLogInSeverity}>{alertMessageLogIn}</Alert>
            )}
            <p className="text-[2em] font-bold">Log in</p>
            <p>To enjoy the whole experience</p>
            <div className="mt-3 w-full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                type="text"
                className="w-full px-1 py-2 bg-[#212121] rounded-md mt-[0.5em]"
              />
            </div>
            <div className="mt-3 relative">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  value={loginData.password}
                  name="password"
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-1 py-2 bg-[#212121] rounded-md pl-8"
                />
                <Icon
                  path={showPassword ? mdiEyeOutline : mdiEyeOffOutline}
                  size={0.6}
                  className="text-white absolute top-1/2 transform -translate-y-1/2 right-2 hover:cursor-pointer"
                  onClick={() => {
                    togglePasswordVisibility();
                  }}
                />
              </div>
            </div>
            <div className="mt-3 w-[20em]">
              <a href="#" className="small">
                Forgot password?
              </a>
            </div>
            <div className="mt-3 ">
              <button
                className="w-full bg-[#483EA8] py-2 rounded-md mt-[0.5em]"
                onClick={loginUser}
              >
                Let's go
              </button>
            </div>
            <div className="mt-3 flex items-center">
              <hr className="w-[40%]" />
              <p className="w-[20%] text-center small">OR</p>
              <hr className="w-[40%]" />
            </div>
            <div className="mt-3 flex items-center justify-evenly">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  authUserGoogle(credentialResponse, "login");
                }}
                onError={() => {
                  setShowAlertLogIn(true);
                  setAlertLogInSeverity("Error");
                  setAlertMessageLogIn("Login Failed");
                }}
              />
              {/* <a href="">
                <div className="bg-[#EDF2F8] p-2 rounded-full">
                  <Icon
                    path={mdiFacebook}
                    size={0.6}
                    className="text-[#4E7CBF]"
                  />
                </div>
              </a>
              <a href="">
                <div className="bg-[#E9E9E9] p-2 rounded-full">
                  <Icon path={mdiApple} size={0.6} className="text-[#212121]" />
                </div>
              </a> */}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="flex bg-[#121212] rounded-full p-1 mb-3 w-[20em]"
            style={{ boxShadow: "0px 0px 5px black" }}
          >
            <div
              className="w-[50%] justify-center flex items-center hover:cursor-pointer rounded-full hover:bg-[#212121]"
              onClick={toggleView}
            >
              <p>Log in</p>
            </div>
            <div className="w-[50%] justify-center flex items-center bg-[#212121] rounded-full p-1 hover:cursor-pointer">
              <p>Sign up</p>
            </div>
          </div>
          <div
            className="bg-[#121212] rounded-md mt-[0.5em] py-3 px-4 w-[25em]"
            style={{ boxShadow: "0px 0px 5px black" }}
          >
            {showAlertSignUp && (
              <Alert severity={alertSignUpSeverity}>{alertMessageSignUp}</Alert>
            )}
            <p className="text-[2em] font-bold">Sign up</p>
            <p>
              Let's get started. Are you ready to be part of something new?.
            </p>
            <div className="mt-3 w-full">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                value={signUpData.username}
                onChange={handleChangeSignUp}
                type="text"
                className="w-full px-1 py-2 bg-[#212121] rounded-md mt-[0.5em]"
              />
            </div>
            <div className="mt-3 w-full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={signUpData.email}
                onChange={handleChangeSignUp}
                type="email"
                className="w-full px-1 py-2 bg-[#212121] rounded-md mt-[0.5em]"
              />
            </div>
            <div className="mt-3 relative">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={signUpData.password}
                  onChange={handleChangeSignUp}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-1 py-2 bg-[#212121] rounded-md pl-8"
                />
                <Icon
                  path={showPassword ? mdiEyeOutline : mdiEyeOffOutline}
                  size={0.6}
                  className="text-white absolute top-1/2 transform -translate-y-1/2 right-2 hover:cursor-pointer"
                  onClick={() => {
                    togglePasswordVisibility();
                  }}
                />
              </div>
            </div>
            <div className="mt-3 relative">
              <label htmlFor="passwordRep">Repeat Password</label>
              <div className="relative">
                <input
                  id="passwordRep"
                  name="passwordRep"
                  value={signUpData.passwordRep}
                  onChange={handleChangeSignUp}
                  type={showRepPassword ? "text" : "password"}
                  className="w-full px-1 py-2 bg-[#212121] rounded-md pl-8"
                />
                <Icon
                  path={showRepPassword ? mdiEyeOutline : mdiEyeOffOutline}
                  size={0.6}
                  className="text-white absolute top-1/2 transform -translate-y-1/2 right-2 hover:cursor-pointer"
                  onClick={toggleRepeatPasswordVisibility}
                />
              </div>
            </div>
            <div className="mt-3 ">
              <button
                className="w-full bg-[#483EA8] py-2 rounded-md mt-[0.5em]"
                onClick={signUpUser}
              >
                Start
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileScreen;

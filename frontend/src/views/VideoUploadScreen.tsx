import { useState, useEffect } from "react";
import axios from "../axios";
import Icon from "@mdi/react";
import { mdiCloudUploadOutline, mdiVideoOff } from "@mdi/js";
import Alert from "@mui/material/Alert";
import { useUser } from "../UserContext";

const VideoUploadScreen = () => {
  const { user_id } = useUser();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<any>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [sendingData, setSendingData] = useState(false);
  const [isRequiredDataEmpty, setIsRequiredDataEmpty] = useState(true);
  const [animeName, setAnimeName] = useState("");
  const [songName, setSongName] = useState("");
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [fatherAnimeName, setFatherAnimeName] = useState("");
  const [alternativeAnimeName, setAlternativeAnimeName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [animeFormat, setAnimeFormat] = useState("");
  const [animeType, setAnimeType] = useState("");
  const [number, setNumber] = useState("");
  const [version, setVersion] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<any>("info");
  const [alertMessage, setAlertMessage] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [previewCover, setPreviewCover] = useState<any>(null);
  const [differentLanguage, setDifferentLanguage] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get("/languages");
        setLanguages(response.data.response);
      } catch (error: any) {
        console.error(
          "Error en la solicitud GET:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (videoPreviewUrl) {
      const videoPlayer = document.getElementById(
        "previewPlayer"
      ) as HTMLVideoElement;

      if (videoPlayer) {
        videoPlayer.src = videoPreviewUrl;

        videoPlayer.onplaying = () => {
          setIsLoading(false);
          captureThumbnail();
        };

        videoPlayer.play();
      }
    }
  }, [videoPreviewUrl]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleFileChange = (event: any) => {
    setIsLoading(true);
    const file = event.target.files[0];
    setVideoPreviewUrl("");
    setPreviewCover(null);

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setVideoPreviewUrl(reader.result);
      };

      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      setVideoPreviewUrl("");
      setSelectedFile(null);
    }
    validateForm();
  };

  const validateForm = () => {
    setIsRequiredDataEmpty(
      !(
        animeName &&
        songName &&
        artistName &&
        selectedLanguage &&
        releaseYear &&
        selectedFile &&
        previewCover
      )
    );
  };

  const handleInformationChange = (event: any, data: string) => {
    const value = event.target.value;

    switch (data) {
      case "animeName":
        setAnimeName(value);
        break;
      case "songName":
        setSongName(value);
        break;
      case "fatherAnimeName":
        setFatherAnimeName(value);
        break;
      case "alternativeAnimeName":
        setAlternativeAnimeName(value);
        break;
      case "artistName":
        setArtistName(value);
        break;
      default:
        break;
    }

    validateForm();
  };

  const handleFormSubmit = async (event: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSendingData(true);
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", selectedFile);

    Object.entries({
      userId: user_id,
      artistName: artistName,
      animeFormat: animeFormat,
      type: animeType,
      animeNumber: number,
      artistVersion: version,
      releaseYear: releaseYear,
      alternativeAnimeName: alternativeAnimeName,
      fatherAnimeName: fatherAnimeName,
      selectedLanguage: selectedLanguage,
      songName: songName,
      animeName: animeName,
      cover: previewCover,
    }).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    axios
      .post(`/uploadVideo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setShowAlert(true);
        setAlertMessage("Video uploaded successfully!!");
        setAlertSeverity("success");
        resetForm();
      })
      .catch(() => {
        setShowAlert(true);
        setAlertMessage(
          "An error occurred while uploading the video, please try again"
        );
        setAlertSeverity("warning");
      })
      .finally(() => {
        setSendingData(false);
      });
  };

  const deleteVideo = () => {
    setIsLoading(false);
    setVideoPreviewUrl("");
    setPreviewCover(null);
    setSelectedFile(null);
    validateForm();
    resetForm();
  };

  const handleLanguageChange = (event: any) => {
    const value = event.target.value;
    console.log(value);
    if (value !== "Other") {
      setSelectedLanguage(value);
      setDifferentLanguage(false);
    } else {
      setDifferentLanguage(true);
    }
    validateForm();
  };

  const captureThumbnail = () => {
    const videoPlayer = document.getElementById(
      "previewPlayer"
    ) as HTMLVideoElement;

    if (videoPlayer) {
      const videoUrl = videoPlayer.src;

      const tempVideo = document.createElement("video");
      tempVideo.src = videoUrl;
      tempVideo.style.display = "none";

      tempVideo.onloadeddata = () => {
        setTimeout(() => {
          tempVideo.currentTime = 25;
        }, 100);

        tempVideo.onseeked = () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = tempVideo.videoWidth;
            canvas.height = tempVideo.videoHeight;
            context.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL("image/png");
            if (imageUrl) {
              setPreviewCover(imageUrl);
            } else {
              console.error("Failed to generate image URL from canvas");
            }

            tempVideo.remove();
          } else {
            console.error("Failed to get canvas context");
          }
        };
      };

      document.body.appendChild(tempVideo);
    } else {
      console.error("Video element not found");
    }
  };

  const resetForm = () => {
    setAnimeName("");
    setSongName("");
    setFatherAnimeName("");
    setAlternativeAnimeName("");
    setArtistName("");
    setAnimeFormat("");
    setAnimeType("");
    setNumber("");
    setVersion("");
    setReleaseYear("");
    setSelectedLanguage("");
    setDifferentLanguage(false);
    setPreviewCover(null);
    setVideoPreviewUrl("");
    setSelectedFile(null);
    setIsRequiredDataEmpty(true);
  };
  return (
    <div
      className="text-white bg-[#18181B] rounded-xl p-2 flex flex-col items-center gap-5 overflow-auto"
      style={{ height: `calc(100vh - 1rem)` }}
    >
      {showAlert && (
        <Alert severity={alertSeverity} className="absolute top-5 left-5">
          {alertMessage}
        </Alert>
      )}
      <h2 className="font-bold text-center text-[2.5em]">Upload Video</h2>
      {!videoPreviewUrl ? (
        <div className="w-[90%] lg:w-[55%] rounded-lg min-h-[20em] max-h-[20em] border-dashed border-[2px] border-spacing-8 w-[100%] flex flex-col justify-center text-center items-center bg-[#212123]">
          {!videoPreviewUrl && !isLoading && (
            <>
              <Icon path={mdiCloudUploadOutline} size={2} />
              <p className="text-[1.2em] font-bold">
                Drag & drop the file you want to upload
              </p>
              <p className="font-bold">
                <span className="opacity-50 ">Or </span>
                <label className="font-bold text-[#1A50FA] opacity-100 cursor-pointer">
                  click here
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>{" "}
                <span className="opacity-50 ">to select a file.</span>
              </p>
            </>
          )}
          {isLoading && videoPreviewUrl === "" && (
            <>
              <div>
                <img width="100px" src="./loadingCat.gif" alt="loading" />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-[90%] lg:w-[55%] grid grid-cols-12 gap-4">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
            }}
            className="col-span-6"
          >
            <video
              id="previewPlayer"
              width="100%"
              height="100%"
              className="rounded-md"
              style={{ position: "relative", zIndex: 0, maxHeight: "100%" }}
            >
              <source src={videoPreviewUrl} type="video/mp4" />
              <source src={videoPreviewUrl} type="video/ogg" />
              <source src={videoPreviewUrl} type="video/webm" />
              Tu navegador no soporta el tag de video.
            </video>
            <div
              className="bg-black rounded-md flex"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.5,
              }}
            >
              <div
                className="w-full h-full py-2 flex flex-column justify-center items-center text-center cursor-pointer hover:bg-white hover:text-black rounded-md"
                onClick={deleteVideo}
              >
                <Icon path={mdiVideoOff} size={1} />
                <p className="text-xs">Delete</p>
              </div>
            </div>
          </div>
          <div className="col-span-6">
            <img
              src={previewCover}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        </div>
      )}
      <form
        className="flex flex-col gap-5 px-2 pt-5 pb-2 w-[90%] lg:w-[55%] text-[0.8em]"
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="animeName" className="font-bold">
              Anime Name*
            </label>
            <input
              id="animeName"
              type="text"
              placeholder="Anime Name"
              value={animeName}
              onChange={(e) => handleInformationChange(e, "animeName")}
              className="p-2 rounded-md  bg-[#212123] "
            />
          </div>
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="songName" className="font-bold">
              Song Name*
            </label>
            <input
              id="songName"
              type="text"
              placeholder="Song Name"
              value={songName}
              onChange={(e) => handleInformationChange(e, "songName")}
              className="p-2 rounded-md  bg-[#212123] "
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="fatherAnimeName" className="font-bold">
              Father Anime Name
            </label>
            <input
              id="fatherAnimeName"
              type="text"
              placeholder="Father Anime Name"
              value={fatherAnimeName}
              onChange={(e) => handleInformationChange(e, "fatherAnimeName")}
              className="p-2 rounded-md  bg-[#212123] "
            />
          </div>
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="alternativeAnimeName" className="font-bold">
              Alternative Anime Name
            </label>
            <input
              id="alternativeAnimeName"
              type="text"
              placeholder="Alternative Anime Name"
              value={alternativeAnimeName}
              onChange={(e) =>
                handleInformationChange(e, "alternativeAnimeName")
              }
              className="p-2 rounded-md  bg-[#212123] "
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="artistName" className="font-bold">
              Artist Name*
            </label>
            <input
              id="artistName"
              type="text"
              placeholder="Artist Name"
              value={artistName}
              onChange={(e) => handleInformationChange(e, "artistName")}
              className="p-2 rounded-md bg-[#212123] "
            />
          </div>
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="videoType" className="font-bold">
              Format
            </label>
            <select
              className="p-2 rounded-md bg-[#212123]"
              id="videoType"
              value={animeFormat}
              onChange={(e) => setAnimeFormat(e.target.value)}
            >
              <option value=""></option>
              <option value="Pelicula">Pelicula</option>
              <option value="Serie">Serie</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="number">Number</label>
            <input
              type="number"
              className="p-2 rounded-md bg-[#212123] "
              id="number"
              value={number}
              min="0"
              onChange={(e) => {
                const value = e.target.value;
                if (parseInt(value, 10) >= 0 || value === "") {
                  setNumber(value);
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="version">Version</label>
            <input
              type="number"
              className="p-2 rounded-md bg-[#212123] "
              id="version"
              value={version}
              min="0"
              onChange={(e) => {
                const value = e.target.value;
                if (parseInt(value, 10) >= 0 || value === "") {
                  setVersion(value);
                }
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div
            className={`flex flex-col gap-2 col-span-12 ${
              differentLanguage ? "md:col-span-6" : "md:col-span-12"
            }`}
          >
            <label htmlFor="language" className="font-bold">
              Language*
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="p-2 rounded-md bg-[#212123] "
            >
              <option value="">Select Language</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          {differentLanguage && (
            <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
              <label htmlFor="language" className="font-bold">
                Diferrent Languague*
              </label>
              <input
                id="otherLanguage"
                type="text"
                placeholder="Please specify"
                className="p-2 rounded-md  bg-[#212123] "
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="releaseYear" className="font-bold">
              Release Year*
            </label>
            <input
              id="releaseYear"
              type="date"
              placeholder="Release Year"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              className="p-2 rounded-md  bg-[#212123] "
            />
          </div>
          <div className="flex flex-col gap-2 col-span-12 md:col-span-6">
            <label htmlFor="videoType">Type</label>
            <select
              className="p-2 rounded-md bg-[#212123] "
              id="videoType"
              value={animeType}
              onChange={(e) => setAnimeType(e.target.value)}
            >
              <option value=""></option>
              <option value="Opening">Opening</option>
              <option value="Ending">Ending</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isRequiredDataEmpty || sendingData}
          className={`bg-[#1A50FA] text-white p-2 rounded-md font-bold ${
            isRequiredDataEmpty || sendingData
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#1A50FA]"
          }`}
        >
          {sendingData ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default VideoUploadScreen;

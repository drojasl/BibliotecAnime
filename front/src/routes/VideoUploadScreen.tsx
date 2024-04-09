import React, { useState, useEffect } from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiCloudUploadOutline, mdiVideoOff, mdiVideoSwitch } from "@mdi/js";

const VideoUploadScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [isVideoPlayable, setIsVideoPlayable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequiredDataEmpty, setIsRequiredDataEmpty] = useState(true);
  const [animeName, setAnimeName] = useState("");
  const [songName, setSongName] = useState("");
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [fatherAnimeName, setFatherAnimeName] = useState("");
  const [alternativeAnimeName, setAlternativeAnimeName] = useState("");
  const [alternativeTitle, setAlternativeTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [animeFormat, setAnimeFormat] = useState("");
  const [animeType, setAnimeType] = useState("");
  const [number, setNumber] = useState("");
  const [version, setVersion] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [lyrics, setLyrics] = useState("");
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const handleLanguageChange = (event: any) => {
    const value = event.target.value;
    setSelectedLanguage(value);

    if (value === "Otro") {
      console.log("eo");
    }
  };

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

  const handleFileChange = (event: any) => {
    setIsLoading(true);
    const file = event.target.files[0];
    setVideoPreviewUrl("");

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
  };

  useEffect(() => {
    if (videoPreviewUrl) {
      setIsVideoPlayable(false);
      const videoPlayer = document.getElementById("previewPlayer");

      if (videoPlayer) {
        videoPlayer.src = videoPreviewUrl;

        videoPlayer.onplaying = () => {
          setIsLoading(false);
          setIsVideoPlayable(true);
        };

        videoPlayer.play();
      }
    }
  }, [videoPreviewUrl]);

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

    if (songName && animeName) {
      setIsRequiredDataEmpty(false);
    }
  };

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    if (!apiUrl) {
      throw new Error(
        "La URL de la API no está definida en las variables de entorno."
      );
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    Object.entries({
      'userId': 1,
      'artistName': artistName,
      'animeFormat': animeFormat,
      'type': animeType,
      'animeNumber': number,
      'artistVersion': version,
      'releaseYear': releaseYear,
      'lyric': lyrics,
      'alternativeAnimeName': alternativeAnimeName,
      'alternativeAnimeTitle': alternativeTitle,
      'fatherAnimeName': fatherAnimeName,
      'selectedLanguage': selectedLanguage,
      'songName': songName,
      'animeName': animeName,
    }).forEach(([key, value]) => {
        formData.append(key, value);
    });

    axios
      .post(`${apiUrl}/uploadVideo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      })
  };

  const deleteVideo = () => {
    setIsLoading(false);
    setVideoPreviewUrl("");
  };

  return (
    <div className="text-white flex justify-center items-center py-5">
      <div className="bg-[#202021] w-[90%] lg:w-[50%] px-3 md:px-5 py-5 rounded-lg">
        <h2 className="font-bold text-center">Upload Video</h2>

        <div className="rounded-md mt-5 h-[15em] max-h-[15em] bg-[#272727] w-[100%] flex flex-column justify-center text-center items-center">
          {!videoPreviewUrl && !isLoading && (
            <>
              <Icon path={mdiCloudUploadOutline} size={2} />
              <p>
                Drag & drop the file you want to upload <br /> or{" "}
                <label className="font-bold text-[#4D45A8] cursor-pointer">
                  click here
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>{" "}
                to select a file.
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
          {videoPreviewUrl !== "" && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                }}
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
                    className="w-full h-[30%] py-2 flex flex-column justify-center items-center text-center cursor-pointer hover:bg-white hover:text-black rounded-md"
                    onClick={deleteVideo}
                  >
                    <Icon path={mdiVideoOff} size={1} />
                    <p className="font-bold text-[0.8em]">Descartar Video</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {videoPreviewUrl !== "" && (
          <>
            <form onSubmit={handleFormSubmit}>
              <p className="text-center py-5 font-bold">
                {selectedFile && selectedFile?.name}
              </p>
              <div className="grid grid-cols-12">
                <div className="col-span-12  md:col-span-6 px-2">
                  <label htmlFor="videoName">Anime</label>
                  <label className="text-red-500 ml-2">*</label>
                  <br />
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="videoName"
                    value={animeName}
                    onChange={(e) => handleInformationChange(e, "animeName")}
                  />
                </div>
                <div className="px-2 col-span-12 md:col-span-6">
                  <label htmlFor="videoType">Tipo</label>
                  <br />
                  <select
                    className="rounded-md bg-[#151517] p-2  mt-2 w-full"
                    id="videoType"
                    value={animeType}
                    onChange={(e) => setAnimeType(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Opening">Opening</option>
                    <option value="Ending">Ending</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div className="col-span-12  md:col-span-6 px-2">
                  <label htmlFor="fatherAnimeName">Anime padre</label>
                  <br />
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="fatherAnimeName"
                    onChange={(e) =>
                      handleInformationChange(e, "fatherAnimeName")
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-6 px-2">
                  <label htmlFor="alternativeAnimeName">
                    Anime ( nombre alternativo )
                  </label>
                  <br />
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="alternativeAnimeName"
                    onChange={(e) =>
                      handleInformationChange(e, "alternativeAnimeName")
                    }
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div className="col-span-12  md:col-span-6 px-2">
                  <label htmlFor="songName">Título de la canción</label>
                  <label className="text-red-500 ml-2">*</label>
                  <br />
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="songName"
                    value={songName}
                    onChange={(e) => handleInformationChange(e, "songName")}
                  />
                </div>
                <div className="col-span-12  md:col-span-6 px-2">
                  <label htmlFor="alternativeSongName">
                    Título ( alternativo )
                  </label>
                  <br />
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="alternativeSongName"
                    onChange={(e) => setAlternativeTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div className="col-span-12  md:col-span-6 px-2">
                  <label htmlFor="artistName">Artista</label>
                  <input
                    type="text"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="artistName"
                    onChange={(e) => handleInformationChange(e, "artistName")}
                  />
                </div>
                <div className="px-2 col-span-12 md:col-span-6">
                  <label htmlFor="animeFormat">Formato anime</label>
                  <br />
                  <select
                    className="rounded-md bg-[#151517] p-2  mt-2 w-full"
                    id="animeFormat"
                    value={animeFormat}
                    onChange={(e) => setAnimeFormat(e.target.value)}
                  >
                    <option value=""></option>
                    <option value="Pelicula">Pelicula</option>
                    <option value="Serie">Serie</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div
                  className={`px-2 col-span-${
                    selectedLanguage === "Otro" ? "6" : "12"
                  }`}
                >
                  <label htmlFor="videoType">Idioma</label>
                  <select
                    className="rounded-md bg-[#151517] p-2 mt-2 w-full"
                    id="videoType"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    <option value="">Seleccionar Idioma</option>
                    {languages.map((language, index) => (
                      <option key={index} value={language}>
                        {language}
                      </option>
                    ))}
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {selectedLanguage === "Otro" && (
                  <div className=" col-span-12 md:col-span-6 grid grid-cols-12 px-2">
                    <label htmlFor="otherLanguage" className="col-span-12">
                      Especificar otro idioma
                    </label>
                    <input
                      type="text"
                      className="rounded-md bg-[#151517] p-2 w-full col-span-12 mt-2"
                      id="otherLanguage"
                      placeholder="Escribe el nuevo idioma"
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div className="px-2 col-span-12 lg:col-span-6">
                  <label htmlFor="number">Número</label>
                  <br />
                  <input
                    type="number"
                    className="rounded-md bg-[#151517] p-2 mt-2 w-full"
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>
                <div className="px-2 col-span-12 lg:col-span-6">
                  <label htmlFor="version">Versión</label>
                  <br />
                  <input
                    type="number"
                    className="rounded-md bg-[#151517] p-2 mt-2 w-full"
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <div className="col-span-12 px-2">
                  <label htmlFor="releaseYear">Año emisión</label>
                  <br />
                  <input
                    type="number"
                    className="rounded-md bg-[#151517] p-2 w-full mt-2"
                    id="releaseYear"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-12">
                <label htmlFor="lyrics" className="mx-2">
                  Lyrics
                </label>
                <br />
                <textarea
                  className="rounded-md bg-[#151517] p-2 col-span-12 mt-2 min-h-[10em] mx-2"
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                ></textarea>
              </div>
              <button
                className={
                  isRequiredDataEmpty
                    ? "flex w-full justify-center items-center bg-[#483EA8] rounded-md p-2 mt-3 opacity-30"
                    : "flex w-full justify-center items-center bg-[#483EA8] rounded-md p-2 mt-3"
                }
                type="submit"
                disabled={isRequiredDataEmpty}
              >
                Subir Video
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default VideoUploadScreen;

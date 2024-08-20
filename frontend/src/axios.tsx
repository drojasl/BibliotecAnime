import axios from "axios";

const instance = axios.create({
  baseURL: "https://coral-swallow-434124.hostingersite.com/api",
  // baseURL: 'http://localhost:8000/api',
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;

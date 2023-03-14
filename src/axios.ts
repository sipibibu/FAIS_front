import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://localhost:7067/",
  withCredentials: true,
});
//http://212.96.201.66:8000/
//https://localhost:7067/
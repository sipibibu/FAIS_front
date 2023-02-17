import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://212.96.201.66:8000/",
  withCredentials: true,
});
//http://212.96.201.66:8000/
//https://localhost:7067/
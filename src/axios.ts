import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://418c-94-140-132-141.eu.ngrok.io/",
  withCredentials: true,
});

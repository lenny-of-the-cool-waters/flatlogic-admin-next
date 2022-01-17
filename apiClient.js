import axios from "axios";

const apiClient = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:5000",
  exposedHeaders: ["set-cookie"],
});

export default apiClient;
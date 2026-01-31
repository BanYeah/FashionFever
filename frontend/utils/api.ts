import axios from "axios";
import { DefaultDeserializer } from "v8";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
});

export default api;

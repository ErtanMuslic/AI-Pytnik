import axios from 'axios';

const api = axios.create({
  baseURL: "https://ertan.pythonanywhere.com/",
  // You can add other configuration options here
});

export default api;

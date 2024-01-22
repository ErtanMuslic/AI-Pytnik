import axios from 'axios';

const api = axios.create({
  baseURL: "http://ertan.pythonanywhere.com/",
  // You can add other configuration options here
});

export default api;

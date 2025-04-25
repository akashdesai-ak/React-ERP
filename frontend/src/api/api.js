import axios from "axios";

 const API_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const logRequest = (config) => {
  console.log("API Request:", config.url, config.data);
  return config;
};

const logResponse = (response) => {
  console.log(
    "API Response:",
    response.config.url,
    response.status,
    response.data
  );
  return response;
};

const logError = (error) => {
  console.error(
    "API Error:",
    error.config.url,
    error.response?.status,
    error.response?.data
  );
  throw error;
};

axios.interceptors.request.use(logRequest);
axios.interceptors.response.use(logResponse, logError);




export const getProducts = () => axios.get(`${API_URL}/products`);
export const addProduct = (product) =>
  axios.post(`${API_URL}/products`, product);
export const updateProduct = (id, product) =>
  axios.put(`${API_URL}/products/${id}`, product);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

export const getUsers = () => axios.get(`${API_URL}/users`);
export const updateUser = (id, user) => axios.put(`${API_URL}/users/${id}`, user);
export const addUser = (user) => axios.post(`${API_URL}/users`, user);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

export const getRoles = () => axios.get(`${API_URL}/users/roles`);

export const getOrders = () => axios.get(`${API_URL}/orders`);
export const addOrder = (order) => axios.post(`${API_URL}/orders`, order);
export const updateOrder = (id, order) => axios.put(`${API_URL}/orders/${id}`, order);
export const deleteOrder = (id) => axios.delete(`${API_URL}/orders/${id}`);

export default API_URL
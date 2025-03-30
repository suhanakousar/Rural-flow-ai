import axios from "axios";

// API key and endpoint
const API_KEY = process.env.API_KEY || "ddc-cIQS0nlp0vaG2A4vfnvghXhfwhYGgsmmOb84bRabCHh7gxt0Qe";
const API_ENDPOINT = process.env.API_ENDPOINT || "https://api.sree.shop/v1";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
  }
});

// API service methods
export const apiService = {
  // Dashboard data
  getDashboardData: async () => {
    try {
      const response = await apiClient.get("/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },
  
  // Energy data
  getEnergyData: async () => {
    try {
      const response = await apiClient.get("/energy");
      return response.data;
    } catch (error) {
      console.error("Error fetching energy data:", error);
      throw error;
    }
  },
  
  // Water data
  getWaterData: async () => {
    try {
      const response = await apiClient.get("/water");
      return response.data;
    } catch (error) {
      console.error("Error fetching water data:", error);
      throw error;
    }
  },
  
  // Agriculture data
  getAgricultureData: async () => {
    try {
      const response = await apiClient.get("/agriculture");
      return response.data;
    } catch (error) {
      console.error("Error fetching agriculture data:", error);
      throw error;
    }
  },
  
  // Alerts
  getAlerts: async () => {
    try {
      const response = await apiClient.get("/alerts");
      return response.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  },
  
  // Irrigation zones
  getIrrigationZones: async () => {
    try {
      const response = await apiClient.get("/irrigation");
      return response.data;
    } catch (error) {
      console.error("Error fetching irrigation zones:", error);
      throw error;
    }
  },
  
  // Weather forecast
  getWeatherForecast: async () => {
    try {
      const response = await apiClient.get("/weather");
      return response.data;
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      throw error;
    }
  },
  
  // AI chat
  sendChatMessage: async (message: string, history: Array<{role: string, content: string}>) => {
    try {
      const response = await apiClient.post("/chat", {
        message,
        history
      });
      return response.data;
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }
};

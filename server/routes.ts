import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { apiService } from "./services/apiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard data route
  app.get('/api/dashboard', async (req, res) => {
    try {
      // This is where we'd call the actual API
      // const data = await apiService.getDashboardData();
      
      // For now, return structured but simulated data
      const dashboardData = {
        energy: {
          solar: "3.4",
          battery: "78",
          grid: "5.2",
          status: "optimal"
        },
        water: {
          reservoir: "68",
          flow: "45",
          quality: "92",
          status: "attention"
        },
        agriculture: {
          soil: "42",
          temp: "27",
          irrigation: "ON",
          status: "optimal"
        },
        insights: {
          energy: "Peak energy demand predicted at 7PM today. Consider optimizing load distribution.",
          water: "Water usage elevated in northern sector. Potential leak detected with 87% confidence."
        }
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });
  
  // Energy data route
  app.get('/api/energy', async (req, res) => {
    try {
      // const data = await apiService.getEnergyData();
      const energyData = {
        solar: "3.4",
        battery: "78",
        grid: "5.2",
        status: "optimal",
        history: [
          { time: '00:00', value: 40 },
          { time: '04:00', value: 30 },
          { time: '08:00', value: 60 },
          { time: '12:00', value: 80 },
          { time: '16:00', value: 70 },
          { time: '20:00', value: 90 },
          { time: '24:00', value: 50 }
        ]
      };
      
      res.json(energyData);
    } catch (error) {
      console.error('Error fetching energy data:', error);
      res.status(500).json({ error: 'Failed to fetch energy data' });
    }
  });
  
  // Water data route
  app.get('/api/water', async (req, res) => {
    try {
      // const data = await apiService.getWaterData();
      const waterData = {
        reservoir: "68",
        flow: "45",
        quality: "92",
        status: "attention",
        history: [
          { time: '00:00', value: 65 },
          { time: '04:00', value: 55 },
          { time: '08:00', value: 70 },
          { time: '12:00', value: 60 },
          { time: '16:00', value: 80 },
          { time: '20:00', value: 70 },
          { time: '24:00', value: 60 }
        ]
      };
      
      res.json(waterData);
    } catch (error) {
      console.error('Error fetching water data:', error);
      res.status(500).json({ error: 'Failed to fetch water data' });
    }
  });
  
  // Agriculture data route
  app.get('/api/agriculture', async (req, res) => {
    try {
      // const data = await apiService.getAgricultureData();
      const agricultureData = {
        soil: "42",
        temp: "27",
        irrigation: "ON",
        status: "optimal"
      };
      
      res.json(agricultureData);
    } catch (error) {
      console.error('Error fetching agriculture data:', error);
      res.status(500).json({ error: 'Failed to fetch agriculture data' });
    }
  });
  
  // Alerts route
  app.get('/api/alerts', async (req, res) => {
    try {
      // const data = await apiService.getAlerts();
      const alerts = [
        {
          id: "1",
          type: "warning",
          title: "Potential Water Leak Detected",
          location: "Northern Sector - Pipeline Junction B7",
          time: "10 min ago",
          icon: "fas fa-exclamation-triangle",
          primaryAction: "Dispatch",
          secondaryAction: "Ignore"
        },
        {
          id: "2",
          type: "danger",
          title: "Power Outage Warning",
          location: "East Grid - Sector 4",
          time: "25 min ago",
          icon: "fas fa-bolt",
          primaryAction: "Fix Now",
          secondaryAction: "Ignore"
        },
        {
          id: "3",
          type: "info",
          title: "Scheduled Maintenance Alert",
          location: "Solar Panel Array - Module 12",
          time: "2 hours ago",
          icon: "fas fa-info-circle",
          primaryAction: "Schedule",
          secondaryAction: "Postpone"
        }
      ];
      
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });
  
  // Irrigation zones route
  app.get('/api/irrigation', async (req, res) => {
    try {
      // const data = await apiService.getIrrigationZones();
      const irrigationData = {
        zones: [
          { id: "zone1", name: "North Field Zone", active: true, duration: "15 min" },
          { id: "zone2", name: "East Field Zone", active: false, duration: "0 min" },
          { id: "zone3", name: "South Field Zone", active: true, duration: "8 min" }
        ],
        recommendation: "Increase irrigation in northeast zones. Reduce water in central area to prevent overwatering."
      };
      
      res.json(irrigationData);
    } catch (error) {
      console.error('Error fetching irrigation data:', error);
      res.status(500).json({ error: 'Failed to fetch irrigation data' });
    }
  });
  
  // Weather forecast route
  app.get('/api/weather', async (req, res) => {
    try {
      // const data = await apiService.getWeatherForecast();
      const weatherData = [
        { day: "Mon", icon: "fa-sun", temperature: "32°C" },
        { day: "Tue", icon: "fa-cloud", temperature: "28°C" },
        { day: "Wed", icon: "fa-cloud-rain", temperature: "25°C" },
        { day: "Thu", icon: "fa-cloud-sun", temperature: "27°C" },
        { day: "Fri", icon: "fa-sun", temperature: "30°C" }
      ];
      
      res.json(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });
  
  // AI chat route
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // In production, this would call the actual AI API
      // const response = await apiService.sendChatMessage(message, history);
      
      // Sample responses based on keywords
      let aiResponse = "I'm analyzing the data now. Is there anything specific you'd like to know about?";
      
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("water") || lowerMessage.includes("leak")) {
        aiResponse = "The water supply system is currently running at 68% capacity with a flow rate of 45L/m. There's a potential leak detected in the northern sector that needs investigation. Would you like me to dispatch a maintenance alert?";
      } else if (lowerMessage.includes("energy") || lowerMessage.includes("power")) {
        aiResponse = "Energy consumption is currently optimal. Solar panels are generating 3.4 kW and battery storage is at 78%. Grid usage is minimal at this time due to good weather conditions.";
      } else if (lowerMessage.includes("agriculture") || lowerMessage.includes("irrigation") || lowerMessage.includes("farm")) {
        aiResponse = "The smart irrigation system is active in North and South Field zones. Soil moisture levels are at 42%, which is within optimal range. The system is scheduled to run for another 15 minutes before automatic shutdown.";
      } else if (lowerMessage.includes("weather") || lowerMessage.includes("forecast")) {
        aiResponse = "The weather forecast shows sunny conditions today with a high of 32°C. There's a chance of rain on Wednesday which should help with water conservation. I've already adjusted irrigation schedules accordingly.";
      }
      
      res.json({
        response: aiResponse,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer } from "ws";

// server/services/simulationService.ts
var randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};
var generateTrendingValue = (baseValue, amplitude, noiseLevel, timestamp) => {
  const hourOfDay = new Date(timestamp).getHours();
  const dayFactor = Math.sin(hourOfDay / 24 * Math.PI * 2);
  const noise = randomInRange(-noiseLevel, noiseLevel);
  return baseValue + amplitude * dayFactor + noise;
};
var simulateEnergyData = (timestamp = Date.now()) => {
  const hourOfDay = new Date(timestamp).getHours();
  const solarFactor = hourOfDay >= 6 && hourOfDay <= 18 ? Math.sin((hourOfDay - 6) / 12 * Math.PI) : 0;
  const solarValue = generateTrendingValue(2, 3, 0.5, timestamp);
  const batteryValue = generateTrendingValue(65, 15, 5, timestamp);
  const gridValue = generateTrendingValue(4, 2, 1, timestamp);
  let status = "optimal";
  if (batteryValue < 30) {
    status = "critical";
  } else if (batteryValue < 50) {
    status = "attention";
  }
  const history = Array.from({ length: 7 }).map((_, i) => {
    const historyTimestamp = timestamp - (24 - i * 4) * 60 * 60 * 1e3;
    const time = `${i * 4}:00`;
    const value = Math.round(generateTrendingValue(60, 30, 10, historyTimestamp));
    return { time, value };
  });
  return {
    solar: solarValue.toFixed(1),
    battery: Math.round(batteryValue).toString(),
    grid: gridValue.toFixed(1),
    status,
    history
  };
};
var simulateWaterData = (timestamp = Date.now()) => {
  const hourOfDay = new Date(timestamp).getHours();
  const usageFactor = hourOfDay >= 6 && hourOfDay <= 9 || hourOfDay >= 18 && hourOfDay <= 22 ? 1.5 : 1;
  const reservoirValue = generateTrendingValue(70, 8, 3, timestamp);
  const flowValue = generateTrendingValue(40, 10, 5, timestamp) * usageFactor;
  const qualityValue = generateTrendingValue(95, 5, 2, timestamp);
  let status = "optimal";
  if (reservoirValue < 40) {
    status = "critical";
  } else if (reservoirValue < 60) {
    status = "attention";
  }
  const history = Array.from({ length: 7 }).map((_, i) => {
    const historyTimestamp = timestamp - (24 - i * 4) * 60 * 60 * 1e3;
    const historyHour = new Date(historyTimestamp).getHours();
    const historyUsageFactor = historyHour >= 6 && historyHour <= 9 || historyHour >= 18 && historyHour <= 22 ? 1.5 : 1;
    const time = `${i * 4}:00`;
    const value = Math.round(generateTrendingValue(65, 15, 5, historyTimestamp) * historyUsageFactor);
    return { time, value };
  });
  return {
    reservoir: Math.round(reservoirValue).toString(),
    flow: Math.round(flowValue).toString(),
    quality: Math.round(qualityValue).toString(),
    status,
    history
  };
};
var simulateAgricultureData = (timestamp = Date.now()) => {
  const hourOfDay = new Date(timestamp).getHours();
  const date = new Date(timestamp);
  const month = date.getMonth();
  const seasonalFactor = month >= 5 && month <= 8 ? 0.7 : 1.2;
  const soilValue = generateTrendingValue(45, 10, 5, timestamp) * seasonalFactor;
  const tempValue = generateTrendingValue(24, 6, 2, timestamp);
  const irrigation = soilValue < 38 && hourOfDay >= 6 && hourOfDay <= 18 ? "ON" : "OFF";
  let status = "optimal";
  if (soilValue < 30) {
    status = "critical";
  } else if (soilValue < 38) {
    status = "attention";
  }
  return {
    soil: Math.round(soilValue).toString(),
    temp: Math.round(tempValue).toString(),
    irrigation,
    status
  };
};
var simulateWeatherForecast = (timestamp = Date.now()) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weatherTypes = [
    { icon: "fa-sun", temp: [28, 35], probability: 0.3 },
    { icon: "fa-cloud", temp: [24, 30], probability: 0.3 },
    { icon: "fa-cloud-sun", temp: [26, 32], probability: 0.2 },
    { icon: "fa-cloud-rain", temp: [20, 28], probability: 0.15 },
    { icon: "fa-cloud-showers-heavy", temp: [18, 25], probability: 0.05 }
  ];
  return Array.from({ length: 5 }).map((_, i) => {
    const forecastDate = new Date(timestamp);
    forecastDate.setDate(forecastDate.getDate() + i);
    const rand = Math.random();
    let cumProb = 0;
    let selectedWeather = weatherTypes[0];
    for (const weather of weatherTypes) {
      cumProb += weather.probability;
      if (rand <= cumProb) {
        selectedWeather = weather;
        break;
      }
    }
    const [minTemp, maxTemp] = selectedWeather.temp;
    const temperature = `${Math.round(randomInRange(minTemp, maxTemp))}\xB0C`;
    return {
      day: days[forecastDate.getDay()],
      icon: selectedWeather.icon,
      temperature
    };
  });
};
var simulateAlerts = (timestamp = Date.now()) => {
  const baseAlerts = [
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
  const dynamicAlerts = [];
  const hourOfDay = new Date(timestamp).getHours();
  const minuteStr = String(new Date(timestamp).getMinutes()).padStart(2, "0");
  if (hourOfDay >= 7 && hourOfDay <= 9 && Math.random() > 0.6) {
    dynamicAlerts.push({
      id: `${Date.now()}-1`,
      type: "warning",
      title: "Morning Peak Energy Usage",
      location: "All Sectors - Residential Areas",
      time: `${hourOfDay}:${minuteStr}`,
      icon: "fas fa-lightbulb",
      primaryAction: "Optimize",
      secondaryAction: "Ignore"
    });
  }
  if (hourOfDay >= 17 && hourOfDay <= 19 && Math.random() > 0.6) {
    dynamicAlerts.push({
      id: `${Date.now()}-2`,
      type: "info",
      title: "Smart Irrigation Activated",
      location: "South Fields - Zones 3, 4, 7",
      time: `${hourOfDay}:${minuteStr}`,
      icon: "fas fa-tint",
      primaryAction: "View",
      secondaryAction: "Postpone"
    });
  }
  return [...baseAlerts, ...dynamicAlerts];
};
var simulateIrrigationZones = (timestamp = Date.now()) => {
  const hourOfDay = new Date(timestamp).getHours();
  const optimalIrrigationTime = hourOfDay >= 5 && hourOfDay <= 8 || hourOfDay >= 18 && hourOfDay <= 21;
  const zones = [
    {
      id: "zone1",
      name: "North Field Zone",
      active: optimalIrrigationTime && Math.random() > 0.3,
      duration: optimalIrrigationTime ? `${Math.floor(randomInRange(10, 20))} min` : "0 min"
    },
    {
      id: "zone2",
      name: "East Field Zone",
      active: optimalIrrigationTime && Math.random() > 0.5,
      duration: optimalIrrigationTime && Math.random() > 0.5 ? `${Math.floor(randomInRange(5, 15))} min` : "0 min"
    },
    {
      id: "zone3",
      name: "South Field Zone",
      active: optimalIrrigationTime && Math.random() > 0.4,
      duration: optimalIrrigationTime && Math.random() > 0.4 ? `${Math.floor(randomInRange(8, 18))} min` : "0 min"
    }
  ];
  const recommendations = [
    "Increase irrigation in northeast zones. Reduce water in central area to prevent overwatering.",
    "Soil moisture levels optimal. Consider reducing irrigation duration by 10% in all zones.",
    "Weather forecast indicates rain tomorrow. Consider postponing irrigation for water conservation.",
    "Soil sensors in South Field Zone indicate dryness. Consider extending irrigation duration.",
    "North Field Zone approaching optimal moisture levels. System will automatically stop irrigation in 5 minutes."
  ];
  return {
    zones,
    recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
  };
};
var simulateDashboardData = (timestamp = Date.now()) => {
  const energy = simulateEnergyData(timestamp);
  const water = simulateWaterData(timestamp);
  const agriculture = simulateAgricultureData(timestamp);
  const insights = {
    energy: generateEnergyInsight(energy, timestamp),
    water: generateWaterInsight(water, timestamp)
  };
  return {
    energy,
    water,
    agriculture,
    insights
  };
};
function generateEnergyInsight(energyData, timestamp = Date.now()) {
  const hourOfDay = new Date(timestamp).getHours();
  const energyInsights = [
    `Peak energy demand predicted at ${hourOfDay + 2 > 23 ? hourOfDay + 2 - 24 : hourOfDay + 2}:00 today. Consider optimizing load distribution.`,
    `Solar generation efficiency at ${parseInt(energyData.solar) + 10}% today. Battery predicted to reach full charge by ${hourOfDay + 4 > 23 ? hourOfDay + 4 - 24 : hourOfDay + 4}:00.`,
    `AI analysis indicates potential for ${Math.round(randomInRange(15, 30))}% energy savings by shifting irrigation to off-peak hours.`,
    `Grid demand expected to decrease by ${Math.round(randomInRange(10, 25))}% if forecasted sunshine materializes tomorrow.`,
    `Battery storage trending downward. AI recommends reducing non-essential consumption over next 3 hours.`
  ];
  return energyInsights[Math.floor(Math.random() * energyInsights.length)];
}
function generateWaterInsight(waterData, timestamp = Date.now()) {
  const waterInsights = [
    `Water usage elevated in northern sector. Potential leak detected with ${Math.round(randomInRange(75, 95))}% confidence.`,
    `Reservoir levels will reach optimal capacity in approximately ${Math.round(randomInRange(2, 8))} hours based on current inflow.`,
    `Smart water allocation has reduced consumption by ${Math.round(randomInRange(10, 30))}% compared to last month.`,
    `Flow rate fluctuations detected in east pipeline. Preventative maintenance recommended within 48 hours.`,
    `AI predicts water demand spike in 3 hours based on historical patterns. Automated pressure adjustment scheduled.`
  ];
  return waterInsights[Math.floor(Math.random() * waterInsights.length)];
}
var generateAIResponse = (message, history) => {
  const timestamp = Date.now();
  const lowerMessage = message.toLowerCase();
  let aiResponse = "I'm analyzing the data now. Is there anything specific you'd like to know about?";
  if (lowerMessage.includes("water") || lowerMessage.includes("leak") || lowerMessage.includes("flow")) {
    const waterData = simulateWaterData(timestamp);
    aiResponse = `The water supply system is currently running at ${waterData.reservoir}% capacity with a flow rate of ${waterData.flow}L/m. Water quality is at ${waterData.quality}%. ${lowerMessage.includes("leak") ? "There's a potential leak detected in the northern sector that needs investigation. Would you like me to dispatch a maintenance alert?" : ""}`;
  } else if (lowerMessage.includes("energy") || lowerMessage.includes("power") || lowerMessage.includes("solar") || lowerMessage.includes("battery")) {
    const energyData = simulateEnergyData(timestamp);
    aiResponse = `Energy consumption is currently ${energyData.status}. Solar panels are generating ${energyData.solar} kW and battery storage is at ${energyData.battery}%. Grid usage is ${parseFloat(energyData.grid) < 3 ? "minimal" : "moderate"} at this time.`;
  } else if (lowerMessage.includes("agriculture") || lowerMessage.includes("irrigation") || lowerMessage.includes("farm") || lowerMessage.includes("soil")) {
    const agricultureData = simulateAgricultureData(timestamp);
    const irrigationData = simulateIrrigationZones(timestamp);
    aiResponse = `The smart irrigation system is ${irrigationData.zones.some((z) => z.active) ? "active in " + irrigationData.zones.filter((z) => z.active).map((z) => z.name.split(" ")[0]).join(" and ") + " zones" : "currently inactive"}. Soil moisture levels are at ${agricultureData.soil}%, which is ${parseFloat(agricultureData.soil) > 40 ? "within optimal range" : "below optimal range"}. ${irrigationData.recommendation}`;
  } else if (lowerMessage.includes("weather") || lowerMessage.includes("forecast") || lowerMessage.includes("temperature")) {
    const forecast = simulateWeatherForecast(timestamp);
    aiResponse = `The weather forecast shows ${forecast[0].icon.includes("sun") ? "sunny" : forecast[0].icon.includes("rain") ? "rainy" : "cloudy"} conditions today with a high of ${forecast[0].temperature}. ${forecast[2].icon.includes("rain") ? "There's a chance of rain on " + forecast[2].day + " which should help with water conservation. I've already adjusted irrigation schedules accordingly." : "The next few days look " + (forecast.every((f) => f.icon.includes("sun")) ? "consistently sunny" : "mixed") + ". I'll optimize irrigation based on this forecast."}`;
  } else if (lowerMessage.includes("system") || lowerMessage.includes("overall") || lowerMessage.includes("status")) {
    const dashboard = simulateDashboardData(timestamp);
    aiResponse = `Overall system status is ${dashboard.energy.status === "optimal" && dashboard.water.status === "optimal" && dashboard.agriculture.status === "optimal" ? "optimal" : "requiring attention"}. ${dashboard.energy.status !== "optimal" ? "Energy systems need attention. " : ""}${dashboard.water.status !== "optimal" ? "Water systems need monitoring. " : ""}${dashboard.agriculture.status !== "optimal" ? "Agricultural systems require adjustment. " : ""} Would you like detailed information about a specific subsystem?`;
  }
  return {
    response: aiResponse,
    timestamp
  };
};

// server/routes.ts
import fetch from "node-fetch";
var ML_API_BASE_URL = process.env.ML_API_URL || "http://localhost:5001";
async function registerRoutes(app2) {
  app2.get("/api/dashboard", async (req, res) => {
    try {
      const dashboardData = simulateDashboardData();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      res.status(500).json({ error: "Failed to generate dashboard data" });
    }
  });
  app2.get("/api/energy", async (req, res) => {
    try {
      const energyData = simulateEnergyData();
      res.json(energyData);
    } catch (error) {
      console.error("Error generating energy data:", error);
      res.status(500).json({ error: "Failed to generate energy data" });
    }
  });
  app2.get("/api/water", async (req, res) => {
    try {
      const waterData = simulateWaterData();
      res.json(waterData);
    } catch (error) {
      console.error("Error generating water data:", error);
      res.status(500).json({ error: "Failed to generate water data" });
    }
  });
  app2.get("/api/agriculture", async (req, res) => {
    try {
      const agricultureData = simulateAgricultureData();
      res.json(agricultureData);
    } catch (error) {
      console.error("Error generating agriculture data:", error);
      res.status(500).json({ error: "Failed to generate agriculture data" });
    }
  });
  app2.get("/api/alerts", async (req, res) => {
    try {
      const alerts = simulateAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error generating alerts:", error);
      res.status(500).json({ error: "Failed to generate alerts" });
    }
  });
  app2.get("/api/irrigation", async (req, res) => {
    try {
      const irrigationData = simulateIrrigationZones();
      res.json(irrigationData);
    } catch (error) {
      console.error("Error generating irrigation data:", error);
      res.status(500).json({ error: "Failed to generate irrigation data" });
    }
  });
  app2.get("/api/weather", async (req, res) => {
    try {
      const weatherData = simulateWeatherForecast();
      res.json(weatherData);
    } catch (error) {
      console.error("Error generating weather data:", error);
      res.status(500).json({ error: "Failed to generate weather data" });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const aiResponse = generateAIResponse(message, history);
      res.json(aiResponse);
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });
  app2.post("/api/ml/energy/predict", async (req, res) => {
    try {
      const { forecast, timestamp } = req.body;
      try {
        const response = await fetch(`${ML_API_BASE_URL}/api/energy/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ forecast, timestamp })
        });
        if (!response.ok) {
          throw new Error(`ML API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return res.json(data);
      } catch (mlError) {
        console.warn("ML API unavailable, using simulation fallback:", mlError.message);
        const timestamp2 = Date.now();
        const energyData = simulateEnergyData(timestamp2);
        if (forecast) {
          const hourlyData = Array.from({ length: 24 }, (_, i) => {
            const hourTimestamp = timestamp2 + i * 60 * 60 * 1e3;
            const hourlyOutput = simulateEnergyData(hourTimestamp);
            return {
              time: new Date(hourTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              output: parseFloat(hourlyOutput.solar),
              timestamp: hourTimestamp
            };
          });
          return res.json({
            success: true,
            forecast: hourlyData,
            source: "simulation"
          });
        }
        return res.json({
          success: true,
          prediction: {
            solar_output: parseFloat(energyData.solar),
            timestamp: new Date(timestamp2).toISOString()
          },
          source: "simulation"
        });
      }
    } catch (error) {
      console.error("Error in energy prediction:", error);
      res.status(500).json({ error: "Failed to generate energy prediction" });
    }
  });
  app2.post("/api/ml/water/detect-leak", async (req, res) => {
    try {
      const { water_usage, timestamp } = req.body;
      if (water_usage === void 0) {
        return res.status(400).json({ error: "water_usage parameter is required" });
      }
      try {
        const response = await fetch(`${ML_API_BASE_URL}/api/water/detect-leak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ water_usage, timestamp })
        });
        if (!response.ok) {
          throw new Error(`ML API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return res.json(data);
      } catch (mlError) {
        console.warn("ML API unavailable, using simulation fallback:", mlError.message);
        const isAbnormal = water_usage > 90 || water_usage < 10;
        const confidence = isAbnormal ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20);
        return res.json({
          success: true,
          result: {
            leak_detected: isAbnormal,
            confidence: isAbnormal ? confidence : 100 - confidence,
            severity: isAbnormal ? confidence > 80 ? "high" : "medium" : "none",
            recommendation: isAbnormal ? "Investigate unusual water usage patterns" : "No action needed",
            anomaly_details: {
              is_anomaly: isAbnormal,
              anomaly_score: isAbnormal ? -0.5 : 0.5,
              water_usage
            }
          },
          source: "simulation"
        });
      }
    } catch (error) {
      console.error("Error in water leak detection:", error);
      res.status(500).json({ error: "Failed to detect water leaks" });
    }
  });
  app2.post("/api/ml/agriculture/optimize-irrigation", async (req, res) => {
    try {
      const { soil_moisture, temperature, timestamp } = req.body;
      if (soil_moisture === void 0 || temperature === void 0) {
        return res.status(400).json({
          error: "soil_moisture and temperature parameters are required"
        });
      }
      try {
        const response = await fetch(`${ML_API_BASE_URL}/api/agriculture/optimize-irrigation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ soil_moisture, temperature, timestamp })
        });
        if (!response.ok) {
          throw new Error(`ML API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return res.json(data);
      } catch (mlError) {
        console.warn("ML API unavailable, using simulation fallback:", mlError.message);
        const irrigationData = simulateIrrigationZones();
        const recommendations = [
          `Optimal irrigation time: ${Math.round(30 - soil_moisture / 2)} minutes to reach target soil moisture.`,
          `Expected soil moisture after irrigation: ${Math.min(95, Math.round(soil_moisture + 30))}%.`
        ];
        if (temperature > 30) {
          recommendations.push("High temperature detected. Consider irrigating during early morning or evening for better efficiency.");
        }
        return res.json({
          success: true,
          result: {
            zones: irrigationData,
            recommendation: recommendations.join(" "),
            moisture_deficit: Math.round(50 - soil_moisture),
            current_moisture: soil_moisture,
            target_moisture: 50,
            expected_moisture: Math.min(95, Math.round(soil_moisture + 30))
          },
          source: "simulation"
        });
      }
    } catch (error) {
      console.error("Error in irrigation optimization:", error);
      res.status(500).json({ error: "Failed to optimize irrigation" });
    }
  });
  app2.get("/api/blockchain/energy-market", async (req, res) => {
    try {
      try {
        const response = await fetch(`${ML_API_BASE_URL}/api/blockchain/market-stats`);
        if (!response.ok) {
          throw new Error(`Blockchain API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return res.json(data);
      } catch (blockchainError) {
        console.warn("Blockchain API unavailable, using simulation fallback:", blockchainError.message);
        const marketData = {
          success: true,
          stats: {
            total_energy_traded: Math.round(Math.random() * 1e3 + 500),
            total_value_traded: Math.round(Math.random() * 5e3 + 1e3) / 100,
            transaction_count: Math.floor(Math.random() * 50 + 10),
            average_price: (Math.random() * 0.2 + 0.1).toFixed(4),
            active_users: Math.floor(Math.random() * 10 + 5),
            pending_transactions: Math.floor(Math.random() * 3)
          },
          source: "simulation"
        };
        return res.json(marketData);
      }
    } catch (error) {
      console.error("Error fetching energy market data:", error);
      res.status(500).json({ error: "Failed to fetch energy market data" });
    }
  });
  const httpServer = createServer(app2);
  const wss2 = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss2.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    const initialData = {
      type: "initial",
      data: simulateDashboardData()
    };
    ws.send(JSON.stringify(initialData));
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        const realTimeData = {
          type: "update",
          timestamp: Date.now(),
          data: {
            energy: simulateEnergyData(),
            water: simulateWaterData(),
            agriculture: simulateAgricultureData()
          }
        };
        ws.send(JSON.stringify(realTimeData));
      }
    }, 5e3);
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log("Received message from client:", parsedMessage);
        if (parsedMessage.type === "request_data") {
          const dataType = parsedMessage.dataType;
          let responseData;
          switch (dataType) {
            case "alerts":
              responseData = simulateAlerts();
              break;
            case "irrigation":
              responseData = simulateIrrigationZones();
              break;
            case "weather":
              responseData = simulateWeatherForecast();
              break;
            default:
              responseData = simulateDashboardData();
          }
          ws.send(JSON.stringify({
            type: "response",
            requestId: parsedMessage.requestId,
            dataType,
            data: responseData
          }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      clearInterval(interval);
    });
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: server2 },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { WebSocketServer as WebSocketServer2 } from "ws";
import { createServer as createServer2 } from "http";
var app = express2();
var server = createServer2(app);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
var wss = new WebSocketServer2({
  server,
  path: "/ws",
  perMessageDeflate: false,
  clientTracking: true,
  verifyClient: (info) => {
    log(`WebSocket connection attempt from ${info.req.socket.remoteAddress}`);
    return true;
  }
});
wss.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  log(`New WebSocket connection established from ${clientIp}`);
  ws.send(JSON.stringify({ type: "welcome", message: "Connected to WebSocket server" }));
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      log(`Received WebSocket message from ${clientIp}: ${JSON.stringify(data)}`);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      log(`Error processing WebSocket message from ${clientIp}: ${error}`);
    }
  });
  ws.on("close", (code, reason) => {
    log(`WebSocket connection closed from ${clientIp}. Code: ${code}, Reason: ${reason}`);
  });
  ws.on("error", (error) => {
    log(`WebSocket error from ${clientIp}: ${error}`);
  });
});
server.on("upgrade", (request, socket, head) => {
  log(`Upgrade request received for ${request.url}`);
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

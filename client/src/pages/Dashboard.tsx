import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

// Components
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import StatusCard from "@/components/dashboard/StatusCard";
import PredictiveInsights from "@/components/dashboard/PredictiveInsights";
import AIAssistant from "@/components/dashboard/AIAssistant";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import SmartIrrigationPanel from "@/components/dashboard/SmartIrrigationPanel";

// Types
import {
  StatusCardData,
  Weather,
  Alert,
  IrrigationZone,
  EnergyData,
  WaterData,
  AgricultureData
} from "@/lib/types";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states (these would come from API in production)
  const [energyData, setEnergyData] = useState<EnergyData>({
    solar: "3.4",
    battery: "78",
    grid: "5.2"
  });
  
  const [waterData, setWaterData] = useState<WaterData>({
    reservoir: "68",
    flow: "45",
    quality: "92"
  });
  
  const [agricultureData, setAgricultureData] = useState<AgricultureData>({
    soil: "42",
    temp: "27",
    irrigation: "ON"
  });
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Update simulated data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small variations in energy data
      setEnergyData(prev => ({
        solar: (parseFloat(prev.solar) + (Math.random() * 0.4 - 0.2)).toFixed(1),
        battery: Math.min(100, Math.max(0, parseInt(prev.battery) + Math.floor(Math.random() * 3 - 1))).toString(),
        grid: (parseFloat(prev.grid) + (Math.random() * 0.2 - 0.1)).toFixed(1)
      }));
      
      // Simulate small variations in water data
      setWaterData(prev => ({
        reservoir: Math.min(100, Math.max(0, parseInt(prev.reservoir) + Math.floor(Math.random() * 3 - 1))).toString(),
        flow: Math.min(100, Math.max(20, parseInt(prev.flow) + Math.floor(Math.random() * 3 - 1))).toString(),
        quality: Math.min(100, Math.max(70, parseInt(prev.quality) + Math.floor(Math.random() * 3 - 1))).toString()
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Status cards data
  const energyCardData: StatusCardData = {
    title: "Energy Status",
    status: "optimal",
    metrics: [
      { label: "Solar", value: energyData.solar, unit: "kW" },
      { label: "Battery", value: energyData.battery, unit: "%" },
      { label: "Grid", value: energyData.grid, unit: "kW" }
    ],
    chartData: [87, 62, 75, 50, 100, 87, 62] // percentage heights
  };
  
  const waterCardData: StatusCardData = {
    title: "Water Supply",
    status: "attention",
    metrics: [
      { label: "Reservoir", value: waterData.reservoir, unit: "%" },
      { label: "Flow Rate", value: waterData.flow, unit: "L/m" },
      { label: "Quality", value: waterData.quality, unit: "%" }
    ],
    chartData: [62, 50, 87, 75, 44, 56, 69]
  };
  
  const agricultureCardData: StatusCardData = {
    title: "Smart Agriculture",
    status: "optimal",
    metrics: [
      { label: "Soil Moisture", value: agricultureData.soil, unit: "%" },
      { label: "Temperature", value: agricultureData.temp, unit: "°C" },
      { label: "Irrigation", value: agricultureData.irrigation }
    ],
    chartData: [50, 62, 44, 56, 75, 62, 50]
  };
  
  // Weather forecast data
  const weatherForecast: Weather[] = [
    { day: "Mon", icon: "fa-sun", temperature: "32°C" },
    { day: "Tue", icon: "fa-cloud", temperature: "28°C" },
    { day: "Wed", icon: "fa-cloud-rain", temperature: "25°C" },
    { day: "Thu", icon: "fa-cloud-sun", temperature: "27°C" },
    { day: "Fri", icon: "fa-sun", temperature: "30°C" }
  ];
  
  // Alerts data
  const alerts: Alert[] = [
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
  
  // Irrigation zones data
  const irrigationZones: IrrigationZone[] = [
    { id: "zone1", name: "North Field Zone", active: true, duration: "15 min" },
    { id: "zone2", name: "East Field Zone", active: false, duration: "0 min" },
    { id: "zone3", name: "South Field Zone", active: true, duration: "8 min" }
  ];
  
  // AI insights
  const energyInsight = "Peak energy demand predicted at 7PM today. Consider optimizing load distribution.";
  const waterInsight = "Water usage elevated in northern sector. Potential leak detected with 87% confidence.";
  const irrigationRecommendation = "Increase irrigation in northeast zones. Reduce water in central area to prevent overwatering.";
  
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Dashboard header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Smart Infrastructure Overview</h2>
                <div className="flex space-x-2 text-sm">
                  <button className="px-3 py-1 rounded-lg bg-gray-700/40 text-gray-300 hover:bg-gray-700/70 hover:text-white">
                    Today
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30">
                    Week
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-gray-700/40 text-gray-300 hover:bg-gray-700/70 hover:text-white">
                    Month
                  </button>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 flex justify-end">
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary bg-opacity-20 text-primary rounded-lg hover:bg-opacity-30 transition-all">
                <i className="fas fa-file-export"></i>
                <span>Export Report</span>
              </button>
            </div>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StatusCard 
                data={energyCardData} 
                color="primary" 
                glowClass="dashboard-card shadow-lg shadow-primary/25"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatusCard 
                data={waterCardData} 
                color="secondary" 
                glowClass="dashboard-card shadow-lg shadow-secondary/25"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatusCard 
                data={agricultureCardData} 
                color="accent" 
                glowClass="dashboard-card shadow-lg shadow-accent/25"
              />
            </motion.div>
          </div>
          
          {/* Analytics and AI Assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <PredictiveInsights 
                energyInsight={energyInsight}
                waterInsight={waterInsight}
                weatherForecast={weatherForecast}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIAssistant />
            </motion.div>
          </div>
          
          {/* Alerts and Irrigation */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <AlertsPanel alerts={alerts} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <SmartIrrigationPanel 
                zones={irrigationZones}
                aiRecommendation={irrigationRecommendation}
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

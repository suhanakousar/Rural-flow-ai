import { useState } from "react";
import { Weather } from "@/lib/types";
import { 
  Area, 
  AreaChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

interface PredictiveInsightsProps {
  energyInsight: string;
  waterInsight: string;
  weatherForecast: Weather[];
}

export default function PredictiveInsights({ 
  energyInsight, 
  waterInsight, 
  weatherForecast 
}: PredictiveInsightsProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('week');
  
  // Sample data for energy demand forecast
  const energyData = [
    { time: '00:00', value: 40 },
    { time: '04:00', value: 30 },
    { time: '08:00', value: 60 },
    { time: '12:00', value: 80 },
    { time: '16:00', value: 70 },
    { time: '20:00', value: 90 },
    { time: '24:00', value: 50 }
  ];
  
  // Sample data for water utilization forecast
  const waterData = [
    { time: '00:00', value: 65 },
    { time: '04:00', value: 55 },
    { time: '08:00', value: 70 },
    { time: '12:00', value: 60 },
    { time: '16:00', value: 80 },
    { time: '20:00', value: 70 },
    { time: '24:00', value: 60 }
  ];
  
  return (
    <div className="lg:col-span-2 rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Predictive Insights & AI Forecasts</h3>
          <div className="flex space-x-2 text-sm">
            <button 
              className={`px-3 py-1 rounded-lg ${activeTab === 'today' ? 'bg-primary/20 text-primary' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/70 hover:text-white'}`}
              onClick={() => setActiveTab('today')}
            >
              Today
            </button>
            <button 
              className={`px-3 py-1 rounded-lg ${activeTab === 'week' ? 'bg-primary/20 text-primary' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/70 hover:text-white'}`}
              onClick={() => setActiveTab('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 rounded-lg ${activeTab === 'month' ? 'bg-primary/20 text-primary' : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/70 hover:text-white'}`}
              onClick={() => setActiveTab('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Energy Prediction */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                <i className="fas fa-bolt text-primary"></i>
              </div>
              <h4 className="font-medium">Energy Demand Forecast</h4>
            </div>
            
            <div className="h-40 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={energyData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00a3ff" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#00a3ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#475569" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00a3ff" 
                    strokeWidth={2}
                    fill="url(#energyGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-sm text-gray-300">
              <p>
                <span className="text-primary font-semibold">AI Insight:</span> {energyInsight}
              </p>
            </div>
          </div>
          
          {/* Water Prediction */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center mr-2">
                <i className="fas fa-water text-secondary"></i>
              </div>
              <h4 className="font-medium">Water Utilization Forecast</h4>
            </div>
            
            <div className="h-40 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={waterData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9d00ff" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#9d00ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#475569" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9d00ff" 
                    strokeWidth={2}
                    fill="url(#waterGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-sm text-gray-300">
              <p>
                <span className="text-secondary font-semibold">AI Insight:</span> {waterInsight}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-4 pt-3">
          <h4 className="font-medium mb-2">Upcoming Weather Impact</h4>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {weatherForecast.map((day, index) => (
              <div key={index} className="flex flex-col items-center bg-gray-700/30 rounded-lg p-3 min-w-[70px]">
                <span className="text-xs text-gray-400">{day.day}</span>
                <i className={`fas ${day.icon} ${day.icon.includes('sun') ? 'text-warning' : day.icon.includes('rain') ? 'text-primary' : 'text-gray-400'} text-xl my-2`}></i>
                <span className="font-mono text-sm">{day.temperature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

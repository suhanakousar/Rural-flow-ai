import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { IrrigationZone } from "@/lib/types";

interface SmartIrrigationPanelProps {
  zones: IrrigationZone[];
  aiRecommendation: string;
}

export default function SmartIrrigationPanel({ zones: initialZones, aiRecommendation }: SmartIrrigationPanelProps) {
  const [zones, setZones] = useState(initialZones);
  
  const handleToggleZone = (zoneId: string) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, active: !zone.active } : zone
    ));
  };
  
  // Create a grid of cells for the soil moisture heatmap
  const generateHeatmapCells = () => {
    const cells = [];
    const rows = 6;
    const cols = 6;
    
    // This would come from real sensor data in a production environment
    const moistureLevels = [
      [10, 20, 30, 40, 50, 30],
      [20, 40, 60, 80, 60, 30],
      [10, 30, 70, 80, 50, 20],
      [10, 20, 40, 50, 30, 10],
      [5, 10, 20, 30, 20, 5],
      [5, 5, 10, 10, 5, 5]
    ];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const opacity = moistureLevels[row][col];
        cells.push(
          <motion.div 
            key={`${row}-${col}`}
            className={`bg-accent rounded`}
            style={{ opacity: opacity / 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity / 100 }}
            transition={{ duration: 1, delay: (row + col) * 0.05 }}
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div className="lg:col-span-3 rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Smart Irrigation Management</h3>
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/40 rounded-lg p-3">
            <h4 className="font-medium text-white mb-3">Active Zones</h4>
            
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${zone.active ? 'bg-accent' : 'bg-gray-600'} mr-2`}></div>
                    <span className="text-sm">{zone.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-mono mr-2">
                      {zone.active ? zone.duration : 'OFF'}
                    </span>
                    <Switch
                      checked={zone.active}
                      onCheckedChange={() => handleToggleZone(zone.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-700/40 rounded-lg p-3">
            <h4 className="font-medium text-white mb-3">Soil Moisture Map</h4>
            
            <div className="relative h-40 rounded-lg overflow-hidden bg-gray-900/80 p-1">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1">
                {generateHeatmapCells()}
              </div>
              
              <div className="absolute bottom-2 right-2 bg-gray-800/80 text-xs p-1 rounded">
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-accent/10 rounded"></span>
                  <span>Dry</span>
                  <span className="block w-2 h-2 bg-accent/80 rounded"></span>
                  <span>Wet</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-gray-400">
                <span className="text-accent font-semibold">AI Recommendation:</span> {aiRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

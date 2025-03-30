import { useState } from "react";
import { motion } from "framer-motion";
import { Alert } from "@/lib/types";

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [displayedAlerts, setDisplayedAlerts] = useState(alerts);
  
  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          border: 'border-warning',
          bg: 'bg-warning/20',
          text: 'text-warning',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'danger':
        return {
          border: 'border-danger',
          bg: 'bg-danger/20',
          text: 'text-danger',
          icon: 'fas fa-bolt'
        };
      case 'info':
      default:
        return {
          border: 'border-primary',
          bg: 'bg-primary/20',
          text: 'text-primary',
          icon: 'fas fa-info-circle'
        };
    }
  };
  
  const handlePrimaryAction = (alertId: string) => {
    // In a real application, this would handle the primary action based on the alert type
    console.log(`Primary action for alert ${alertId}`);
  };
  
  const handleSecondaryAction = (alertId: string) => {
    // Remove the alert from the displayed list
    setDisplayedAlerts(alerts.filter(alert => alert.id !== alertId));
  };
  
  return (
    <div className="lg:col-span-3 rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">System Alerts & Notifications</h3>
          <div className="flex space-x-2">
            <span className="bg-warning/20 text-warning text-xs rounded-full px-2 py-0.5">
              {displayedAlerts.length} New
            </span>
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {displayedAlerts.length > 0 ? (
            displayedAlerts.map((alert) => {
              const styles = getAlertStyles(alert.type);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`bg-gray-700/40 rounded-lg p-3 border-l-4 ${styles.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${styles.bg} flex items-center justify-center mr-3`}>
                        <i className={`${alert.icon} ${styles.text}`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{alert.title}</h4>
                        <p className="text-xs text-gray-400">{alert.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">{alert.time}</span>
                      <div className="flex mt-1 space-x-2">
                        <button 
                          className={`text-xs ${styles.bg} hover:bg-opacity-30 ${styles.text} rounded px-2 py-0.5`}
                          onClick={() => handlePrimaryAction(alert.id)}
                        >
                          {alert.primaryAction}
                        </button>
                        <button 
                          className="text-xs bg-gray-600 hover:bg-gray-700 text-gray-300 rounded px-2 py-0.5"
                          onClick={() => handleSecondaryAction(alert.id)}
                        >
                          {alert.secondaryAction}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-check-circle text-3xl mb-2"></i>
              <p>No new alerts to display</p>
            </div>
          )}
        </div>
        
        {displayedAlerts.length > 0 && (
          <div className="mt-3 text-center">
            <button className="text-sm text-primary hover:text-primary/80">
              View All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

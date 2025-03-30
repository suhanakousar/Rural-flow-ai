import { motion } from "framer-motion";
import { StatusCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  data: StatusCardData;
  color: string;
  glowClass: string;
}

export default function StatusCard({ data, color, glowClass }: StatusCardProps) {
  const statusColors = {
    optimal: "bg-accent",
    attention: "bg-warning",
    critical: "bg-danger"
  };
  
  const chartBarVariants = {
    initial: { scaleY: 0, opacity: 0 },
    animate: (i: number) => ({
      scaleY: 1,
      opacity: 0.8,
      transition: {
        duration: 0.5,
        delay: i * 0.1
      }
    })
  };
  
  return (
    <div className={`rounded-xl overflow-hidden ${glowClass}`}>
      <div className={`bg-gradient-to-r from-${color}/20 to-transparent p-4`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-white">{data.title}</h3>
          <div className="flex items-center space-x-1 text-sm bg-gray-700/60 rounded-lg px-2 py-1">
            <span className={`h-2 w-2 rounded-full ${statusColors[data.status]}`}></span>
            <span>{data.status === 'optimal' ? 'Optimal' : data.status === 'attention' ? 'Attention' : 'Critical'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          {data.metrics.map((metric, index) => (
            <div key={index}>
              <p className="text-xs text-gray-400">{metric.label}</p>
              <p className="font-mono text-lg font-medium text-white">
                {metric.value}
                {metric.unit && <small>{metric.unit}</small>}
              </p>
            </div>
          ))}
        </div>
        
        <div className="relative h-16">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
            {data.chartData.map((value, index) => (
              <motion.div
                key={index}
                className={`bg-${color} w-6 mx-1 rounded`}
                style={{ height: `${value}%` }}
                custom={index}
                variants={chartBarVariants}
                initial="initial"
                animate="animate"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

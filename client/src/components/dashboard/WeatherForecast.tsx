import { Weather } from "@/lib/types";

interface WeatherForecastProps {
  forecast: Weather[];
}

export default function WeatherForecast({ forecast }: WeatherForecastProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2">
      {forecast.map((day, index) => (
        <div key={index} className="flex flex-col items-center bg-gray-700/30 rounded-lg p-3 min-w-[70px]">
          <span className="text-xs text-gray-400">{day.day}</span>
          <i className={`fas ${day.icon} ${
            day.icon.includes('sun') 
              ? 'text-warning' 
              : day.icon.includes('rain') 
                ? 'text-primary' 
                : 'text-gray-400'
          } text-xl my-2`}></i>
          <span className="font-mono text-sm">{day.temperature}</span>
        </div>
      ))}
    </div>
  );
}

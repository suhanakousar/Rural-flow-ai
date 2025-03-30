import { useState } from "react";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [location, setLocation] = useState("Sundarpur Village");
  const [searchQuery, setSearchQuery] = useState("");
  
  const locations = [
    "Sundarpur Village",
    "Greenfield District",
    "Lakeside Community"
  ];
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          className="md:hidden text-gray-400 hover:text-white focus:outline-none mr-3"
          onClick={onMenuToggle}
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex items-center bg-gray-700/60 rounded-lg px-3 py-1.5">
          <i className="fas fa-map-marker-alt text-primary mr-2"></i>
          <select 
            className="bg-transparent text-gray-300 text-sm focus:outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <i className="fas fa-search text-gray-400"></i>
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-gray-700/40 border border-gray-600 text-sm rounded-lg pl-8 pr-4 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="relative p-2 rounded-full text-gray-400 hover:text-white">
          <i className="fas fa-bell"></i>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-warning"></span>
        </button>
        
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Admin</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <span className="text-sm font-semibold text-white">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export interface StatusCardData {
  title: string;
  status: 'optimal' | 'attention' | 'critical';
  metrics: {
    label: string;
    value: string;
    unit?: string;
  }[];
  chartData: number[];
}

export interface Weather {
  day: string;
  icon: string;
  temperature: string;
}

export interface IrrigationZone {
  id: string;
  name: string;
  active: boolean;
  duration: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  location: string;
  time: string;
  icon: string;
  primaryAction: string;
  secondaryAction: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

export interface EnergyData {
  solar: string;
  battery: string;
  grid: string;
}

export interface WaterData {
  reservoir: string;
  flow: string;
  quality: string;
}

export interface AgricultureData {
  soil: string;
  temp: string;
  irrigation: string;
}

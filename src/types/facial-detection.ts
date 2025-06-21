export interface DetectionResult {
  result?: Array<{
    box: {
      x_min: number;
      y_min: number;
      x_max: number;
      y_max: number;
      probability: number;
    };
    gender?: {
      value: string;
    };
    age?: {
      low: number;
      high: number;
    };
    execution_time?: {
      detector: number;
    };
  }>;
}

export interface CapturedFace {
  id: string;
  image: string; // base64
  timestamp: Date;
  detectionInfo: {
    probability: number;
    gender?: string;
    age?: { low: number; high: number };
    box: { x_min: number; y_min: number; x_max: number; y_max: number };
  };
}

export type ServiceStatus = 'checking' | 'online' | 'offline'; 
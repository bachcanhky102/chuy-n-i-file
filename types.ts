export interface FileData {
  name: string;
  mimeType: string;
  data: string; // Base64 string
  size: number;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ConversionResult {
  text: string;
}

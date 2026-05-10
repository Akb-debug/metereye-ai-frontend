// ✅ CRÉÉ — reading.model.ts

export interface ReadingResponse {
  id:          number;
  meterId:     number;
  value:       number;
  dateTime:    string;
  source:      'MANUAL' | 'ESP32_CAM' | 'SENSOR';
  comment:     string;
  imageUrl:    string;
  consumption: number;
  status:      string;
}

export interface CreateReadingRequest {
  meterId:  number;
  value:    number;
  comment?: string;
  source:   'MANUAL';
}

export interface PagedReadings {
  content:          ReadingResponse[];
  totalElements:    number;
  totalPages:       number;
  number:           number;
  size:             number;
}

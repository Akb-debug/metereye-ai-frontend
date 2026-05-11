// 🔄 MODIFIÉ — reading.model.ts — corrections: date au lieu de dateTime, CreateReadingRequest avec date, PagedReadings structure backend

export interface ReadingResponse {
  id:           number;
  meterId:      number;
  value:        number;
  date:         string;
  source:       'MANUAL' | 'IMAGE' | 'SENSOR' | 'ESP32_CAM';
  consumption?: number;
  imageUrl?:    string;
}

export interface ManualReadingRequest {
  meterId: number;
  value:   number;
  date:    string;
}

export interface CreateReadingRequest {
  meterId: number;
  value:   number;
  date:    string;
}

export interface PagedReadings {
  content:       ReadingResponse[];
  pageable: {
    page:          number;
    size:          number;
    totalElements: number;
    totalPages:    number;
  };
  totalElements?: number;
  totalPages?:    number;
}

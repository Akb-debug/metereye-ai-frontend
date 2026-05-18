export interface ReadingResponse {
  id:           number;
  meterId?:     number;
  value:        number;
  date?:        string;
  dateTime?:    string;
  source:       'MANUAL' | 'MANUEL' | 'IMAGE' | 'SENSOR' | 'ESP32_CAM';
  consumption?: number;
  imageUrl?:    string;
  statut?:      string;
  comment?:     string;
}

// Correspond exactement au ManualReadingRequest du backend
export interface CreateReadingRequest {
  meterId:  number;
  value:    number;
  comment?: string;
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

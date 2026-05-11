// ✅ CRÉÉ — device.model.ts

export interface DeviceScanRequest {
  qrCodeValue: string;
  deviceCode: string;
  serialNumber: string;
}

export interface DeviceAssociateRequest {
  compteurId: number;
  captureInterval: number;
}

export interface DeviceResponse {
  id: number;
  deviceCode: string;
  statut: string;
  configured: boolean;
  enLigne?: boolean;
  lastSeenAt?: string;
  ipAddress?: string;
  captureInterval?: number;
  compteur?: { id: number; reference: string };
}

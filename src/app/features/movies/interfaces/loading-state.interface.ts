/**
 * Interface para el estado de carga
 * Responsabilidad: Definir los estados de carga y error
 */

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  timestamp: Date;
  endpoint?: string;
}

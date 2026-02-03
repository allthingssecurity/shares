import axios from 'axios';
import { LedgerData, TaxConfig, ClosingBalance, Summary, CapitalGains } from '../types';

// Prefer runtime env via <meta> override when hosted on Pages, fallback to build-time REACT_APP_API_URL
const metaApi = typeof document !== 'undefined' ? document.querySelector('meta[name="API_BASE_URL"]')?.getAttribute('content') : undefined;
const API_BASE_URL = metaApi || process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export const uploadFile = async (file: File): Promise<LedgerData> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getLedgerData = async (): Promise<LedgerData> => {
  const response = await api.get('/ledger');
  return response.data;
};

export const getClosingBalances = async (): Promise<ClosingBalance[]> => {
  const response = await api.get('/closing-balances');
  return response.data;
};

export const getCapitalGains = async (): Promise<CapitalGains> => {
  const response = await api.get('/capital-gains');
  return response.data;
};

export const getSummary = async (): Promise<Summary> => {
  const response = await api.get('/summary');
  return response.data;
};

export const getTaxConfig = async (): Promise<TaxConfig> => {
  const response = await api.get('/config');
  return response.data;
};

export const updateTaxConfig = async (config: Partial<TaxConfig>): Promise<{ message: string; config: TaxConfig }> => {
  const response = await api.put('/config', config);
  return response.data;
};

export const exportNextYear = (): string => {
  return `${API_BASE_URL}/export/next-year`;
};

export const exportCurrentReport = (): string => {
  return `${API_BASE_URL}/export/current`;
};

export default api;

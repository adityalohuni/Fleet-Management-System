import api from './api';
import { MonthlyFinancialSummary, VehicleProfitability } from '../types';

export const FinancialService = {
  getMonthlySummary: async (startDate?: string, endDate?: string): Promise<MonthlyFinancialSummary[]> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/financial/summary?${queryString}` : '/financial/summary';
      
      const { data: summary } = await api.get<any[]>(url);
      if (!Array.isArray(summary)) {
        console.warn('Unexpected response format from getMonthlySummary');
        return [];
      }
      return summary.map(s => ({
        month: s.month || '',
        revenue: String(s.revenue || '0'),
        cost: String(s.cost || '0'),
        profit: String(s.profit || '0'),
      }));
    } catch (error) {
      console.error('Failed to fetch financial summary', error);
      return [];
    }
  },

  getVehicleProfitability: async (startDate?: string, endDate?: string): Promise<VehicleProfitability[]> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/financial/vehicle-profitability?${queryString}` : '/financial/vehicle-profitability';
      
      const { data: profitability } = await api.get<any[]>(url);
      if (!Array.isArray(profitability)) {
        console.warn('Unexpected response format from getVehicleProfitability');
        return [];
      }
      return profitability.map(p => ({
        vehicle_id: p.vehicle_id || '',
        vehicle_plate: p.vehicle_plate || '',
        revenue: String(p.revenue || '0'),
        cost: String(p.cost || '0'),
        profit: String(p.profit || '0'),
        rank: p.rank || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch vehicle profitability', error);
      return [];
    }
  }
};

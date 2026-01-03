import { FinancialService as ClientFinancialService } from '../client';
import { MonthlyFinancialSummary, VehicleProfitability } from '../types';

export const FinancialService = {
  getMonthlySummary: async (): Promise<MonthlyFinancialSummary[]> => {
    try {
      const summary = await ClientFinancialService.getMonthlySummary();
      return summary.map(s => ({
        month: s.month || '',
        revenue: s.revenue || '0',
        cost: s.cost || '0',
        profit: s.profit || '0',
      }));
    } catch (error) {
      console.error('Failed to fetch financial summary', error);
      return [];
    }
  },

  getVehicleProfitability: async (): Promise<VehicleProfitability[]> => {
    try {
      const profitability = await ClientFinancialService.getVehicleProfitability();
      return profitability.map(p => ({
        vehicle_id: p.vehicle_id || '',
        vehicle_plate: p.vehicle_plate || '',
        revenue: p.revenue || '0',
        cost: p.cost || '0',
        profit: p.profit || '0',
        rank: p.rank || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch vehicle profitability', error);
      return [];
    }
  }
};

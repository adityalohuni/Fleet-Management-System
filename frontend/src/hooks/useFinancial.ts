import { useQuery } from '@tanstack/react-query';
import { FinancialService } from '../services/financial.service';

export function useMonthlySummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['financial-summary', startDate, endDate],
    queryFn: () => FinancialService.getMonthlySummary(startDate, endDate),
  });
}

export function useVehicleProfitability(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['vehicle-profitability', startDate, endDate],
    queryFn: () => FinancialService.getVehicleProfitability(startDate, endDate),
  });
}

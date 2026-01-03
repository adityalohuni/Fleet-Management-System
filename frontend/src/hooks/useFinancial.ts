import { useQuery } from '@tanstack/react-query';
import { FinancialService } from '../services/financial.service';

export function useMonthlySummary() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: FinancialService.getMonthlySummary,
  });
}

export function useVehicleProfitability() {
  return useQuery({
    queryKey: ['vehicle-profitability'],
    queryFn: FinancialService.getVehicleProfitability,
  });
}

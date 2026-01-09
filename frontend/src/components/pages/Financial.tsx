import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Download, TrendingUp, DollarSign, Truck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMonthlySummary, useVehicleProfitability } from "../../hooks/useFinancial";
import { toast } from "../../lib/toast";
import React from "react";

export function Financial() {
  const [period, setPeriod] = useState("current-year");
  
  // Calculate date range based on period
  const getDateRange = (selectedPeriod: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    if (selectedPeriod === "current-year") {
      startDate = `${now.getFullYear()}-01-01`;
      endDate = `${now.getFullYear()}-12-31`;
    } else if (selectedPeriod === "last-year") {
      const lastYear = now.getFullYear() - 1;
      startDate = `${lastYear}-01-01`;
      endDate = `${lastYear}-12-31`;
    } else if (selectedPeriod === "last-12-months") {
      const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      startDate = lastYear.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange(period);
  const { data: monthlySummary, isLoading: isSummaryLoading } = useMonthlySummary(startDate, endDate);
  const { data: vehicleProfitability, isLoading: isProfitabilityLoading } = useVehicleProfitability(startDate, endDate);

  const chartData = monthlySummary?.map(item => ({
    month: item.month,
    revenue: parseFloat(item.revenue) || 0,
    costs: parseFloat(item.cost) || 0,
    profit: parseFloat(item.profit) || 0,
  })).filter(item => !isNaN(item.revenue) && !isNaN(item.costs)) || [];

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalProfit = chartData.reduce((acc, curr) => acc + curr.profit, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const sortedByMonthAsc = [...chartData].sort((a, b) => a.month.localeCompare(b.month));
  const last = sortedByMonthAsc.at(-1);
  const prev = sortedByMonthAsc.at(-2);

  const percentChange = (current?: number, previous?: number) => {
    if (current == null || previous == null) return null;
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const revenueMoM = percentChange(last?.revenue, prev?.revenue);
  const profitMoM = percentChange(last?.profit, prev?.profit);
  const marginMoM = percentChange(
    last && last.revenue > 0 ? (last.profit / last.revenue) * 100 : undefined,
    prev && prev.revenue > 0 ? (prev.profit / prev.revenue) * 100 : undefined
  );

  const formatSignedPercent = (v: number | null) => {
    if (v == null) return "—";
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(1)}%`;
  };

  const handleExportPDF = () => {
    if (!monthlySummary || monthlySummary.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    
    // Create CSV content (browser-compatible fallback to PDF)
    const headers = ['Month', 'Revenue', 'Costs', 'Profit', 'Margin %'];
    const rows = chartData.map(item => [
      item.month,
      `$${item.revenue.toLocaleString()}`,
      `$${item.costs.toLocaleString()}`,
      `$${item.profit.toLocaleString()}`,
      `${((item.profit / item.revenue) * 100).toFixed(1)}%`
    ]);
    
    // Add summary row
    rows.push(['', '', '', '', '']);
    rows.push(['TOTAL', `$${totalRevenue.toLocaleString()}`, '', `$${totalProfit.toLocaleString()}`, `${profitMargin.toFixed(1)}%`]);
    
    const csvContent = [
      `Fleet Management - Financial Report`,
      `Period: ${period.replace('-', ' ').toUpperCase()}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download as CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Financial report exported successfully');
  };

  if (isSummaryLoading || isProfitabilityLoading) {
    return <div>Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="page-header mb-2">Financial Dashboard</h1>
          <p className="page-subtitle">
            Analyze profitability and financial performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="last-12-months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-foreground-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-foreground-tertiary">
              {formatSignedPercent(revenueMoM)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-foreground-tertiary">
              {formatSignedPercent(profitMoM)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-foreground-tertiary">
              {formatSignedPercent(marginMoM)} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Profitability Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleProfitability?.map((vehicle) => {
                const profit = parseFloat(vehicle.profit);
                const isNegative = profit < 0;
                return (
                  <TableRow key={vehicle.vehicle_id}>
                    <TableCell className="font-medium">#{vehicle.rank}</TableCell>
                    <TableCell>{vehicle.vehicle_plate}</TableCell>
                    <TableCell className="text-right">${parseFloat(vehicle.revenue).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${parseFloat(vehicle.cost).toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      ${profit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

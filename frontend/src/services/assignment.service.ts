import api from './api';
import { Assignment } from '../types';

export const AssignmentService = {
  getAll: async (): Promise<Assignment[]> => {
    try {
      const { data: assignments } = await api.get<any[]>('/assignments');
      if (!Array.isArray(assignments)) {
        console.error('Expected array from assignments endpoint, got:', typeof assignments);
        return [];
      }
      return assignments.map(a => ({
        id: a.id || '',
        vehicleId: a.vehicle_id || '',
        driverId: a.driver_id || '',
        status: (a.status as any) || 'Scheduled',
        startDate: a.start_time || new Date().toISOString(),
        endDate: a.end_time || new Date().toISOString(),
        location: 'Unknown', // Placeholder
        progress: 0, // Placeholder
      }));
    } catch (error) {
      console.error('Failed to fetch assignments', error);
      return [];
    }
  },

  create: async (assignment: Omit<Assignment, 'id'>): Promise<Assignment> => {
    try {
      // Ensure dates are in ISO format with timezone
      const startTime = new Date(assignment.startDate).toISOString();
      
      const endTime = assignment.endDate 
        ? new Date(assignment.endDate).toISOString()
        : null;

      const { data: a } = await api.post<any>('/assignments', {
        vehicle_id: assignment.vehicleId,
        driver_id: assignment.driverId,
        start_time: startTime,
        end_time: endTime,
        status: 'Scheduled',
      });
      return {
        id: a.id || '',
        vehicleId: a.vehicle_id || '',
        driverId: a.driver_id || '',
        status: (a.status as any) || 'Scheduled',
        startDate: a.start_time || '',
        endDate: a.end_time || '',
        location: 'Unknown',
        progress: 0,
      };
    } catch (error) {
      console.error('Failed to create assignment', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  updateStatus: async (id: string, status: Assignment['status']): Promise<Assignment> => {
    try {
      const { data: a } = await api.put<any>(`/assignments/${id}`, {
        status: status,
      });
      return {
        id: a.id || '',
        vehicleId: a.vehicle_id || '',
        driverId: a.driver_id || '',
        status: (a.status as any) || 'Scheduled',
        startDate: a.start_time || '',
        endDate: a.end_time || '',
        location: 'Unknown',
        progress: 0,
      };
    } catch (error) {
      console.error('Failed to update assignment status', error);
      throw error;
    }
  },

  getByVehicleId: async (vehicleId: string): Promise<Assignment[]> => {
    try {
      const assignments = await AssignmentService.getAll();
      return assignments.filter(a => a.vehicleId === vehicleId);
    } catch (error) {
      console.error('Failed to fetch assignments for vehicle', error);
      return [];
    }
  },
};

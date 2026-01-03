import { AssignmentService as ClientAssignmentService } from '../client';
import { Assignment } from '../types';

export const AssignmentService = {
  getAll: async (): Promise<Assignment[]> => {
    try {
      const assignments = await ClientAssignmentService.getAssignments();
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
      const a = await ClientAssignmentService.createAssignment({
        vehicle_id: assignment.vehicleId,
        driver_id: assignment.driverId,
        start_time: assignment.startDate,
        end_time: assignment.endDate,
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
      throw error;
    }
  },

  updateStatus: async (id: string, status: Assignment['status']): Promise<Assignment> => {
    try {
      const a = await ClientAssignmentService.updateAssignment(id, {
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
};

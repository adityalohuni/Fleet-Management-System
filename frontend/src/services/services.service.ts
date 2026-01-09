import api from './api';
import type { CustomerDto, RouteDto, ShipmentDto, TransportJobDto, CreateCustomerDto, CreateRouteDto, CreateShipmentDto, CreateTransportJobDto } from '../dto/services.dto';

export interface TransportServiceView {
  id: string;
  client: string;
  origin: string;
  destination: string;
  loadType: string;
  serviceFee: number;
  cost: number | null;
  paymentStatus: 'Paid' | 'Invoiced' | 'Pending';
  status: 'Delivered' | 'In Progress' | 'Scheduled';
  assignedVehicle: string | null;
  assignedDriver: string | null;
  date: string;
}

const statusToUiStatus = (status: TransportJobDto['status']): TransportServiceView['status'] => {
  switch (status) {
    case 'Pending':
      return 'Scheduled';
    case 'InProgress':
      return 'In Progress';
    case 'Delivered':
    case 'Invoiced':
    case 'Paid':
      return 'Delivered';
    default:
      return 'Scheduled';
  }
};

const statusToPaymentStatus = (
  status: TransportJobDto['status']
): TransportServiceView['paymentStatus'] => {
  switch (status) {
    case 'Paid':
      return 'Paid';
    case 'Invoiced':
      return 'Invoiced';
    default:
      return 'Pending';
  }
};

const formatGeoPointLabel = (geo: unknown): string => {
  // Backend stores GeoJSON-ish values (origin/destination). Keep display safe and simple.
  if (!geo || typeof geo !== 'object') return '—';
  const anyGeo = geo as any;
  const coords = anyGeo?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const [lng, lat] = coords;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }
  return '—';
};

export const ServicesService = {
  getAll: async (): Promise<TransportServiceView[]> => {
    const { data: jobs } = await api.get<TransportJobDto[]>('/logistics/jobs');

    const rows = await Promise.all(
      jobs.map(async (job) => {
        const [customerRes, routeRes, shipmentsRes] = await Promise.allSettled([
          api.get<CustomerDto>(`/logistics/customers/${job.customer_id}`),
          api.get<RouteDto | null>(`/logistics/routes/job/${job.id}`),
          api.get<ShipmentDto[]>(`/logistics/shipments/job/${job.id}`),
        ]);

        const customer = customerRes.status === 'fulfilled' ? customerRes.value.data : null;
        const route = routeRes.status === 'fulfilled' ? routeRes.value.data : null;
        const shipments = shipmentsRes.status === 'fulfilled' ? shipmentsRes.value.data : [];

        const serviceFee = Number(job.agreed_price);

        return {
          id: job.id,
          client: customer?.name ?? job.customer_id,
          origin: route ? formatGeoPointLabel(route.origin) : '—',
          destination: route ? formatGeoPointLabel(route.destination) : '—',
          loadType: shipments[0]?.type ?? '—',
          serviceFee: Number.isFinite(serviceFee) ? serviceFee : 0,
          cost: null,
          paymentStatus: statusToPaymentStatus(job.status),
          status: statusToUiStatus(job.status),
          assignedVehicle: null,
          assignedDriver: null,
          date: job.created_at ? new Date(job.created_at).toISOString().slice(0, 10) : '—',
        } satisfies TransportServiceView;
      })
    );

    // newest first
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  getById: async (id: string): Promise<TransportServiceView | null> => {
    // No dedicated endpoint; reuse list and pick.
    const all = await ServicesService.getAll();
    return all.find((s) => s.id === id) ?? null;
  },

  // Create operations
  createCustomer: async (customer: CreateCustomerDto): Promise<CustomerDto> => {
    const { data } = await api.post<CustomerDto>('/logistics/customers', customer);
    return data;
  },

  createJob: async (job: CreateTransportJobDto): Promise<TransportJobDto> => {
    const { data } = await api.post<TransportJobDto>('/logistics/jobs', job);
    return data;
  },

  createRoute: async (route: CreateRouteDto): Promise<RouteDto> => {
    const { data } = await api.post<RouteDto>('/logistics/routes', route);
    return data;
  },

  createShipment: async (shipment: CreateShipmentDto): Promise<ShipmentDto> => {
    const { data } = await api.post<ShipmentDto>('/logistics/shipments', shipment);
    return data;
  },

  listCustomers: async (): Promise<CustomerDto[]> => {
    const { data } = await api.get<CustomerDto[]>('/logistics/customers');
    return Array.isArray(data) ? data : [];
  },
};

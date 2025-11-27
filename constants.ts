import { Ticket, Technician, Part } from './types';

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    number: '11447115',
    customer: {
      name: 'DMK Milchkontor',
      debitorId: '11316498',
      contact: 'Arnold Kampers',
      phone: '+49 (0)5494 / 801-56143',
      email: 'arnold.kampers@dmk.de',
      location: 'Hamburg, Warehouse District'
    },
    equipment: {
      model: 'EJC 220',
      serialNumber: '51654367',
      operatingHours: 8247,
      lastService: '2024-07-22'
    },
    error: {
      code: 'E0015',
      description: 'Hydraulic system fault',
      customerReport: 'Hydraulic arm not lifting when button pressed. Strange grinding noise from pump area. Started this morning.'
    },
    priority: 'HIGH',
    status: 'READY',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 2.3).toISOString(), // ~2h left
  },
  {
    id: 't2',
    number: '11447112',
    customer: {
      name: 'Logistics Pro GmbH',
      debitorId: '11316220',
      contact: 'Sarah Weber',
      phone: '+49 (0)89 / 123-4567',
      email: 's.weber@logisticspro.de',
      location: 'Munich, North'
    },
    equipment: {
      model: 'EFG 216',
      serialNumber: '51659912',
      operatingHours: 4100,
      lastService: '2024-09-10'
    },
    error: {
      code: 'E0402',
      description: 'Traction controller timeout',
      customerReport: 'Vehicle stops intermittently during operation.'
    },
    priority: 'MEDIUM',
    status: 'DISPATCHED',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 't3',
    number: '11447098',
    customer: {
      name: 'AutoParts Berlin',
      debitorId: '11315588',
      contact: 'Klaus Meyer',
      phone: '+49 (0)30 / 987-6543',
      email: 'kmeyer@autoparts.de',
      location: 'Berlin, Spandau'
    },
    equipment: {
      model: 'RR 20',
      serialNumber: '51651100',
      operatingHours: 12500,
      lastService: '2024-01-15'
    },
    error: {
      code: 'W2201',
      description: 'Battery electrolyte low',
      customerReport: 'Maintenance warning light flashing.'
    },
    priority: 'LOW',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    slaDeadline: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  }
];

export const MOCK_TECHNICIAN: Technician = {
  id: 'tech1',
  name: 'Stefan K.',
  distance: '12km',
  eta: '18 min',
  experience: '23 EJC hydraulic repairs',
  ftfr: 91,
  available: true
};

export const RECOMMENDED_PARTS: Part[] = [
  { id: 'p1', name: 'Pump motor 51408011', price: 472, inStock: true, quantity: 2 },
  { id: 'p2', name: 'Fluid 2L 51506072', price: 18, inStock: true, quantity: 50 },
  { id: 'p3', name: 'Seal kit 51408019', price: 45, inStock: true, quantity: 12 },
];
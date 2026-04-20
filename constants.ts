
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
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 2.3).toISOString(),
  }
];

export const MOCK_TECHNICIAN: Technician = {
  id: 'tech1',
  name: 'Stefan K.',
  distance: '12km',
  eta: '18 min',
  experience: 'L3 Heavy Mechanic (Steering/Hydraulics)',
  ftfr: 94,
  available: true
};

// --- UPDATED PARTS PER TECHNICAL REPORT (GOLD STANDARD) ---
export const RECOMMENDED_PARTS: Part[] = [
  // PDF GOLDEN PATH: RANG 1
  { id: '50452065', name: 'Rep. Satz; Drehkranzlager', price: 183.71, inStock: true, quantity: 2 },
  // PDF GOLDEN PATH: RANG 2
  { id: '51509314', name: 'Sensorlager; kpl. montiert', price: 161.65, inStock: true, quantity: 5 },
  // PDF GOLDEN PATH: RANG 3
  { id: '51470075', name: 'Initiator (Sonder NPN)', price: 22.26, inStock: true, quantity: 12 },
  
  // Standard Catalog
  { id: '50432291', name: 'Antriebsrad Vulkollan', price: 185.00, inStock: true, quantity: 12 },
  { id: '50054881', name: 'Lastrad Polyurethan', price: 62.00, inStock: true, quantity: 40 },
  { id: '51103422', name: 'Lenkistwertsensor', price: 85.00, inStock: true, quantity: 8 },
  { id: '50998877', name: 'Lenkmotor', price: 420.00, inStock: true, quantity: 2 },
  { id: '51506072', name: 'Hydrauliköl HLP 46 (5L)', price: 45.00, inStock: true, quantity: 50 },
  { id: '50000001', name: 'Sicherung 80A', price: 4.00, inStock: true, quantity: 100 },
];
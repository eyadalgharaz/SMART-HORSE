import type { Farm } from '../types';

/**
 * The one farm this SmartHorse workspace manages.
 *
 * The id and name deliberately match the farm object already embedded in the
 * Dashboard's own mock summary (`dashboard-mock-data.ts`) — both describe the
 * same farm, so Farm Profile and the Dashboard header can never disagree
 * about its name. Everything else here is new: Dashboard's mock never needed
 * a farm type, contact details or a location, because nothing before Phase G
 * displayed them.
 *
 * This file is fake data only — nothing here implies a backend exists.
 */
export function buildFarmMock(): Farm {
  return {
    id: 'farm-green-valley',
    name: 'Green Valley Farm',
    type: 'boarding',
    description:
      'A family-run boarding and training stable set across 40 acres, home to competition and leisure horses alike.',
    email: 'info@greenvalleyfarm.example',
    phone: '+20 100 555 0142',
    website: 'https://greenvalleyfarm.example',
    address: '14 Nile Valley Road',
    city: 'Fayoum',
    country: 'Egypt',
    createdAt: new Date(2022, 2, 1).toISOString(),
  };
}

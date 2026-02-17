import type { EmergencyContact } from '../../backend';

export function generateEmergencyTemplates(destination: string): EmergencyContact[] {
  return [
    {
      name: 'Local Emergency Services',
      phone: '911 (or local equivalent)',
      type: 'Emergency',
    },
    {
      name: 'Nearest Hospital',
      phone: 'Search "hospital near me" upon arrival',
      type: 'Hospital',
    },
    {
      name: 'Local Police',
      phone: 'Contact hotel/accommodation for local number',
      type: 'Police',
    },
    {
      name: 'Embassy/Consulate',
      phone: 'Look up your country\'s embassy in ' + destination,
      type: 'Embassy',
    },
  ];
}

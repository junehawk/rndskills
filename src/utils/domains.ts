import domainsData from '../../content/domains.json';

export interface Domain {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  priority: number;
  status: 'active' | 'upcoming';
}

export const domains: Domain[] = domainsData as Domain[];

export function getDomain(id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}

export function getActiveDomains(): Domain[] {
  return domains.filter((d) => d.status === 'active').sort((a, b) => a.priority - b.priority);
}

export function getAllDomains(): Domain[] {
  return [...domains].sort((a, b) => a.priority - b.priority);
}

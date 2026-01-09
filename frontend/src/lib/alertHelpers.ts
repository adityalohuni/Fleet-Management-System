import { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function getAlertIcon(type: string): string {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('maintenance') || lowerType.includes('service')) {
    return '🔧';
  }
  if (lowerType.includes('license') || lowerType.includes('expir')) {
    return '📋';
  }
  if (lowerType.includes('fuel') || lowerType.includes('gas')) {
    return '⛽';
  }
  if (lowerType.includes('accident') || lowerType.includes('damage')) {
    return '⚠️';
  }
  if (lowerType.includes('inspection')) {
    return '🔍';
  }
  return '🔔';
}

export function getAlertMessage(alert: Alert): string {
  // Return the type as the message - can be enhanced with more context
  return alert.type;
}

export function getAlertTimeAgo(createdAt: string): string {
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

export function getSeverityBadgeColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

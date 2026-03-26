import { Badge } from '../ui/badge';
import type { Campaign } from '../../types';

const statusConfig: Record<
  Campaign['status'],
  { label: string; variant: 'secondary' | 'default' | 'outline' | 'success' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  scheduled: { label: 'Scheduled', variant: 'default' },
  sending: { label: 'Sending', variant: 'outline' },
  sent: { label: 'Sent', variant: 'success' },
};

export function StatusBadge({ status }: { status: Campaign['status'] }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {status === 'sending' && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {config.label}
    </Badge>
  );
}

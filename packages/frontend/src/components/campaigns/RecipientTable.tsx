import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import type { RecipientWithStatus } from '../../types';
import { Users } from 'lucide-react';

const statusVariant: Record<string, 'secondary' | 'success' | 'destructive'> = {
  pending: 'secondary',
  sent: 'success',
  failed: 'destructive',
};

export function RecipientTable({ recipients }: { recipients: RecipientWithStatus[] }) {
  if (recipients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12">
        <Users className="mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No recipients added yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Opened At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.sentAt ? new Date(r.sentAt).toLocaleString() : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.openedAt ? new Date(r.openedAt).toLocaleString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="space-y-2 md:hidden">
        {recipients.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.email}</p>
              </div>
              <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
            </div>
            {(r.sentAt || r.openedAt) && (
              <div className="mt-2 flex gap-4 border-t pt-2 text-xs text-muted-foreground">
                {r.sentAt && <span>Sent: {new Date(r.sentAt).toLocaleDateString()}</span>}
                {r.openedAt && <span>Opened: {new Date(r.openedAt).toLocaleDateString()}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { useRecipients } from '../../hooks/useRecipients';
import type { Recipient } from '../../types';
import { Users, Check } from 'lucide-react';

interface CampaignFormData {
  name: string;
  subject: string;
  body: string;
  recipientIds: number[];
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  isLoading?: boolean;
}

export function CampaignForm({ onSubmit, isLoading }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);

  const { data: recipients = [], isLoading: recipientsLoading } = useRecipients();

  const toggleRecipient = (id: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map((r: Recipient) => r.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, subject, body, recipientIds: selectedRecipients });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spring Sale Announcement"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Don't Miss Our Spring Sale!"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email content here..."
            rows={6}
            required
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label>Recipients</Label>
            {selectedRecipients.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {selectedRecipients.length} selected
              </span>
            )}
          </div>
          {recipients.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
              {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
        {recipientsLoading ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recipients available. Create some first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recipients.map((r: Recipient) => {
              const selected = selectedRecipients.includes(r.id);
              return (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-150 ${
                    selected
                      ? 'border-primary/50 bg-primary/5'
                      : 'hover:border-border hover:bg-muted/50'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleRecipient(r.id)}
                    className="sr-only"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        {isLoading ? 'Creating...' : 'Create Campaign'}
      </Button>
    </form>
  );
}

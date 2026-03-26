import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCampaign,
  useDeleteCampaign,
  useScheduleCampaign,
  useSendCampaign,
} from '../hooks/useCampaigns';
import { StatusBadge } from '../components/campaigns/StatusBadge';
import { StatsDisplay } from '../components/campaigns/StatsDisplay';
import { RecipientTable } from '../components/campaigns/RecipientTable';
import { ErrorFallback } from '../components/layout/ErrorFallback';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Send, Trash2, ArrowLeft, Clock, User, Pencil } from 'lucide-react';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, isError, refetch } = useCampaign(Number(id));

  const deleteMutation = useDeleteCampaign();
  const scheduleMutation = useScheduleCampaign();
  const sendMutation = useSendCampaign();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <ErrorFallback
        title="Campaign not found"
        message="The campaign could not be loaded. It may have been deleted or the server is unavailable."
        onRetry={() => refetch()}
        onBack={() => navigate('/campaigns')}
        backLabel="Back to Campaigns"
      />
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(campaign.id, {
      onSuccess: () => {
        toast.success('Campaign deleted');
        navigate('/campaigns');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to delete');
      },
    });
    setShowDeleteDialog(false);
  };

  const handleSchedule = () => {
    if (!scheduledAt) return;
    scheduleMutation.mutate(
      { id: campaign.id, scheduledAt: new Date(scheduledAt).toISOString() },
      {
        onSuccess: () => {
          toast.success('Campaign scheduled');
          setShowScheduleDialog(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || 'Failed to schedule');
        },
      }
    );
  };

  const handleSend = () => {
    sendMutation.mutate(campaign.id, {
      onSuccess: () => {
        toast.success('Campaign sent successfully');
        setShowSendDialog(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to send');
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Navigation */}
      <button
        onClick={() => navigate('/campaigns')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Campaigns
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-muted-foreground">{campaign.subject}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {campaign.status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </Button>
              <Button size="sm" onClick={() => setShowSendDialog(true)}>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
          {campaign.status === 'scheduled' && (
            <Button size="sm" onClick={() => setShowSendDialog(true)}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Now
            </Button>
          )}
          {campaign.status === 'sending' && (
            <Button size="sm" disabled>
              <span className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sending...
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Content */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Email Body</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{campaign.body}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
          {campaign.scheduledAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}
            </span>
          )}
          {campaign.creator && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {campaign.creator.name}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      {campaign.stats && campaign.stats.total > 0 && <StatsDisplay stats={campaign.stats} />}

      {/* Recipients */}
      <div>
        <h3 className="mb-3 font-semibold">Recipients</h3>
        <RecipientTable recipients={campaign.recipients || []} />
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Campaign</DialogTitle>
            <DialogDescription>
              Choose a future date and time to send this campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={!scheduledAt || scheduleMutation.isPending}>
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              This will send the campaign to all recipients. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? 'Sending...' : 'Send Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

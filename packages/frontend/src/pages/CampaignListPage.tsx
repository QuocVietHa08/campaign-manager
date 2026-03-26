import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns, useDeleteCampaign } from '../hooks/useCampaigns';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { ErrorFallback } from '../components/layout/ErrorFallback';
import { Button } from '../components/ui/button';
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
import { Plus, Megaphone, Loader2 } from 'lucide-react';

export function CampaignListPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCampaigns();
  const deleteMutation = useDeleteCampaign();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Campaign deleted');
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to delete');
        setDeleteTarget(null);
      },
    });
  };

  if (isError) {
    return (
      <ErrorFallback
        title="Failed to load campaigns"
        message="Could not connect to the server. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  const allCampaigns = data?.pages.flatMap((page) => page.campaigns) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : allCampaigns.length === 0 ? (
        <div className="animate-fade-in-up py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No campaigns yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Create your first campaign to get started.
          </p>
          <Link to="/campaigns/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCampaigns.map((campaign, i) => (
              <div
                key={campaign.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(i % 10) * 50}ms` }}
              >
                <CampaignCard
                  campaign={campaign}
                  onDelete={(id) => setDeleteTarget({ id, name: campaign.name })}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
            {!hasNextPage && allCampaigns.length > 10 && (
              <p className="text-sm text-muted-foreground">You've reached the end</p>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

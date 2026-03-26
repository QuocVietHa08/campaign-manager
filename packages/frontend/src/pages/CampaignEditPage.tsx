import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign, useUpdateCampaign } from '../hooks/useCampaigns';
import { CampaignForm } from '../components/campaigns/CampaignForm';
import { ErrorFallback } from '../components/layout/ErrorFallback';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, isError, refetch } = useCampaign(Number(id));
  const updateMutation = useUpdateCampaign();

  const handleSubmit = (data: {
    name: string;
    subject: string;
    body: string;
    recipientIds: number[];
  }) => {
    updateMutation.mutate(
      { id: Number(id), ...data },
      {
        onSuccess: () => {
          toast.success('Campaign updated successfully');
          navigate(`/campaigns/${id}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || 'Failed to update campaign');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4 rounded-xl border p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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

  if (campaign.status !== 'draft') {
    return (
      <ErrorFallback
        title="Cannot edit campaign"
        message="Only draft campaigns can be edited."
        onBack={() => navigate(`/campaigns/${id}`)}
        backLabel="Back to Campaign"
      />
    );
  }

  const initialValues = {
    name: campaign.name,
    subject: campaign.subject,
    body: campaign.body,
    recipientIds: campaign.recipients?.map((r) => r.id) ?? [],
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/campaigns/${id}`)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Campaign</h1>
      </div>
      <CampaignForm
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        initialValues={initialValues}
        submitLabel="Save Changes"
      />
    </div>
  );
}

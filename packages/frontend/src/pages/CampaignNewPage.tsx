import { useNavigate } from 'react-router-dom';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { CampaignForm } from '../components/campaigns/CampaignForm';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function CampaignNewPage() {
  const navigate = useNavigate();
  const createMutation = useCreateCampaign();

  const handleSubmit = (data: {
    name: string;
    subject: string;
    body: string;
    recipientIds: number[];
  }) => {
    createMutation.mutate(data, {
      onSuccess: (campaign) => {
        toast.success('Campaign created successfully');
        navigate(`/campaigns/${campaign.id}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to create campaign');
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
      </div>
      <CampaignForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}

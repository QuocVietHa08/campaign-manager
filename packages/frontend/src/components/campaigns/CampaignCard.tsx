import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { StatusBadge } from './StatusBadge';
import type { Campaign } from '../../types';
import { ChevronRight, Trash2 } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete?: (id: number) => void;
}

export function CampaignCard({ campaign, onDelete }: CampaignCardProps) {
  return (
    <Link to={`/campaigns/${campaign.id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:border-ring/50 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate text-base">{campaign.name}</CardTitle>
            <StatusBadge status={campaign.status} />
          </div>
          <CardDescription className="truncate">{campaign.subject}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              {onDelete && campaign.status === 'draft' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(campaign.id);
                  }}
                  className="rounded p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

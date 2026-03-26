import { CampaignRecipient } from '../models';
import { Stats } from '../types';

export function computeStats(campaignRecipients: CampaignRecipient[]): Stats {
  const total = campaignRecipients.length;
  const sent = campaignRecipients.filter((cr) => cr.status === 'sent').length;
  const failed = campaignRecipients.filter((cr) => cr.status === 'failed').length;
  const opened = campaignRecipients.filter((cr) => cr.openedAt !== null).length;

  return {
    total,
    sent,
    failed,
    opened,
    open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    send_rate: total > 0 ? Math.round((sent / total) * 100) : 0,
  };
}

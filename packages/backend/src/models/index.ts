import { sequelize } from '../config/database';
import { User, initUser } from './User';
import { Campaign, initCampaign } from './Campaign';
import { Recipient, initRecipient } from './Recipient';
import { CampaignRecipient, initCampaignRecipient } from './CampaignRecipient';

// Initialize all models with the sequelize instance
initUser(sequelize);
initCampaign(sequelize);
initRecipient(sequelize);
initCampaignRecipient(sequelize);

// Define associations
User.hasMany(Campaign, { foreignKey: 'created_by', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Campaign.belongsToMany(Recipient, {
  through: CampaignRecipient,
  foreignKey: 'campaign_id',
  otherKey: 'recipient_id',
  as: 'recipients',
});
Recipient.belongsToMany(Campaign, {
  through: CampaignRecipient,
  foreignKey: 'recipient_id',
  otherKey: 'campaign_id',
  as: 'campaigns',
});

// Direct access to junction table
Campaign.hasMany(CampaignRecipient, { foreignKey: 'campaign_id', as: 'campaignRecipients' });
CampaignRecipient.belongsTo(Campaign, { foreignKey: 'campaign_id' });
CampaignRecipient.belongsTo(Recipient, { foreignKey: 'recipient_id', as: 'recipient' });

export { sequelize, User, Campaign, Recipient, CampaignRecipient };

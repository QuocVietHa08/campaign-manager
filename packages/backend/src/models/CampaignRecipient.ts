import { Model, DataTypes, Sequelize } from 'sequelize';

class CampaignRecipient extends Model {
  declare campaignId: number;
  declare recipientId: number;
  declare sentAt: Date | null;
  declare openedAt: Date | null;
  declare status: 'pending' | 'sent' | 'failed';
}

export function initCampaignRecipient(sequelize: Sequelize) {
  CampaignRecipient.init(
    {
      campaignId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'campaigns',
          key: 'id',
        },
      },
      recipientId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'recipients',
          key: 'id',
        },
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      tableName: 'campaign_recipients',
      underscored: true,
      timestamps: false,
    }
  );
}

export { CampaignRecipient };

import { Model, DataTypes, Sequelize } from 'sequelize';

class Campaign extends Model {
  declare id: number;
  declare name: string;
  declare subject: string;
  declare body: string;
  declare status: 'draft' | 'sending' | 'scheduled' | 'sent';
  declare scheduledAt: Date | null;
  declare createdBy: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initCampaign(sequelize: Sequelize) {
  Campaign.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('draft', 'sending', 'scheduled', 'sent'),
        allowNull: false,
        defaultValue: 'draft',
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      tableName: 'campaigns',
      underscored: true,
    }
  );
}

export { Campaign };

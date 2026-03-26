import { Model, DataTypes, Sequelize } from 'sequelize';

class Recipient extends Model {
  declare id: number;
  declare email: string;
  declare name: string;
  declare createdAt: Date;
}

export function initRecipient(sequelize: Sequelize) {
  Recipient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'recipients',
      underscored: true,
      updatedAt: false,
    }
  );
}

export { Recipient };

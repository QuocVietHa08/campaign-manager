import { Model, DataTypes, Sequelize } from 'sequelize';

class User extends Model {
  declare id: number;
  declare email: string;
  declare name: string;
  declare password: string;
  declare createdAt: Date;
}

export function initUser(sequelize: Sequelize) {
  User.init(
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
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'users',
      underscored: true,
      updatedAt: false,
    }
  );
}

export { User };

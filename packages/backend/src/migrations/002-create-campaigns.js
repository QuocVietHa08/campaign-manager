'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'sending', 'scheduled', 'sent'),
        allowNull: false,
        defaultValue: 'draft',
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Index on created_by for filtering campaigns by user
    await queryInterface.addIndex('campaigns', ['created_by'], {
      name: 'campaigns_created_by_idx',
    });

    // Index on status for filtering campaigns by status
    await queryInterface.addIndex('campaigns', ['status'], {
      name: 'campaigns_status_idx',
    });

    // Index on scheduled_at for scheduler queries
    await queryInterface.addIndex('campaigns', ['scheduled_at'], {
      name: 'campaigns_scheduled_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaigns');
  },
};

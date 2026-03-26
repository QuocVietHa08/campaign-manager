'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_recipients', {
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'campaigns',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'recipients',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    });

    // Index on recipient_id for reverse lookups
    await queryInterface.addIndex('campaign_recipients', ['recipient_id'], {
      name: 'campaign_recipients_recipient_id_idx',
    });

    // Index on status for stats aggregation
    await queryInterface.addIndex('campaign_recipients', ['status'], {
      name: 'campaign_recipients_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaign_recipients');
  },
};

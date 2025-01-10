module.exports = (sequelize, Sequelize) => {
    const ProviderSpending = sequelize.define(
        "ProviderSpending",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            providerCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            betCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "betCount per day",
            },
            winCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "winCount per day",
            },
            betAmount: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "betAmount per day",
            },
            winAmount: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "winAmount per day",
            },
            spendingAmount: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "spendingAmount per day",
            },
            callCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "callCount per day",
            },
            callBetAmount: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "callBetAmount per day",
            },
            callWinAmount: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "callWinAmount per day",
            },
        },
        {
            tableName: "provider_spending",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return ProviderSpending;
};

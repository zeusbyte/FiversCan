module.exports = (sequelize, Sequelize) => {
    const AgentBalanceHistory = sequelize.define(
        "AgentBalanceHistory",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            agentCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            agentBalance: {
                type: Sequelize.DOUBLE(20, 2),
                defaultValue: 0,
            },
            userBalanceSum: {
                type: Sequelize.DOUBLE(20, 2),
                defaultValue: 0,
            },
            childAgentBalanceSum: {
                type: Sequelize.DOUBLE(20, 2),
                defaultValue: 0,
            },
            childUserBalanceSum: {
                type: Sequelize.DOUBLE(20, 2),
                defaultValue: 0,
            },
        },
        {
            tableName: "agent_balance_histories",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return AgentBalanceHistory;
};

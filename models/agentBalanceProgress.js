module.exports = (sequelize, Sequelize) => {
    const AgentBalanceProgress = sequelize.define(
        "AgentBalanceProgress",
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
                allowNull: true,
            },
            comment: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ".",
            },
        },
        {
            tableName: "agent_balance_progresses",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return AgentBalanceProgress;
};

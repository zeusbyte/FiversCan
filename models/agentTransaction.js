module.exports = (sequelize, Sequelize) => {
    const AgentTransaction = sequelize.define(
        "AgentTransaction",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            parentCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "parent agent code",
            },
            agentCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "agent code",
            },
            chargeType: {
                type: Sequelize.INTEGER,
                comment: " 0:discharge, 1:charge,",
            },
            chargeAmount: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "applying amount",
            },
            parentPrevBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "sending agent balance before",
            },
            parentAfterBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "sending agent balance after",
            },
            agentPrevBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "receiving agent balance before",
            },
            agentAfterBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "receiving agent balance after",
            },
            status: {
                type: Sequelize.INTEGER,
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "parent path",
            },
            memo: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "memo",
            },
        },
        {
            tableName: "agent_transactions",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return AgentTransaction;
};

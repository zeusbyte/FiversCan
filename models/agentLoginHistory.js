module.exports = (sequelize, Sequelize) => {
    const AgentLoginHistory = sequelize.define(
        "AgentLoginHistory",
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
            agentName: Sequelize.STRING,
            ip: Sequelize.STRING,
            country: Sequelize.STRING,
            region: Sequelize.STRING,
            city: Sequelize.STRING,
            loc: Sequelize.STRING,
            org: Sequelize.STRING,
            postal: Sequelize.STRING
        },
        {
            tableName: "agent_login_histories",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return AgentLoginHistory;
};

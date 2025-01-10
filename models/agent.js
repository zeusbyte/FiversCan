module.exports = (sequelize, Sequelize) => {
    const Agent = sequelize.define(
        "Agent",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            parentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            agentCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            agentName: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            agentType: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            percent: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            curShow: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            betEdited: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            minBet: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
            maxBet: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
            memo: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            adminMemo: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            apiType: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "parent path",
            },
            balance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "slot balance",
            },
            siteEndPoint: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            zeroSetting: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            blockOppositeBet: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            blockRedEnvelope: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            betLimitSkin: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "SKIN1",
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            rtp: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: "agents",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Agent.associate = function(models) {
        // Self-referencing association to indicate a parent-child relationship
        Agent.belongsTo(models.Agent, { as: 'parent', foreignKey: 'parentId' }); // 'parentId' is the foreign key in the Agent table that refers to the parent Agent.
    };

    return Agent;
};

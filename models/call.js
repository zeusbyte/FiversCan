module.exports = (sequelize, Sequelize) => {
    const Call = sequelize.define(
        "Call",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            agentCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            providerCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            gameCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            serverCallId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            bet: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
            },
            userPrev: {
                type: Sequelize.DOUBLE(50, 2),
            },
            userAfter: {
                type: Sequelize.DOUBLE(50, 2),
            },
            agentPrev: {
                type: Sequelize.DOUBLE(50, 2),
            },
            agentAfter: {
                type: Sequelize.DOUBLE(50, 2),
            },
            expect: {
                type: Sequelize.DOUBLE(50, 2),
            },
            missed: {
                type: Sequelize.DOUBLE(50, 2),
            },
            real: {
                type: Sequelize.DOUBLE(50, 2),
            },

            rtp: {
                type: Sequelize.DOUBLE(10, 0),
                allowNull: false,
            },
            type: {
                type: Sequelize.INTEGER, // 1: General call 2: Buy call
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER, // 0: Request, 1: Apply, 2: Cancel
                allowNull: false,
                default: 0,
            },
            msg: {
                type: Sequelize.STRING
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ".",
            },
        },
        {
            tableName: "calls",
            timestamps: true,
        }
    );

    return Call;
};

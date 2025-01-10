module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
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
                comment: "agent code",
            },
            userCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "user code",
            },
            targetRtp: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 80,
                comment: "target RTP",
            },
            realRtp: {
                type: Sequelize.DOUBLE(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "current RTP",
            },
            balance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "slot balance",
            },
            aasUserCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "User ID sent from hpplaycasion (Evol uses this ID, including for recharging user money)",
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: "1: standard, 2: deleted",
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "parent path",
            },
            totalDebit: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "total bet money",
            },
            totalCredit: {
                type: Sequelize.DOUBLE(20, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "total win money",
            },
            apiType: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: "0: seamless, 1: transfer",
            },
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    return User;
};

module.exports = (sequelize, Sequelize) => {
    const UserTransaction = sequelize.define(
        "UserTransaction",
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
            userCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            chargeType: {
                type: Sequelize.INTEGER,
                comment: "0: discarge(debit), 1: charge(credit)",
            },
            chargeAmount: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            agentPrevBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            agentAfterBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            userPrevBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            userAfterBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.INTEGER,
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
        },
        {
            tableName: "user_transactions",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return UserTransaction;
};

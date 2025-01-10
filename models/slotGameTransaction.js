module.exports = (sequelize, Sequelize) => {
    const SlotGameTransaction = sequelize.define(
        "SlotGameTransaction",
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
            providerCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "company code",
            },
            gameCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "game code",
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "FREE, BASE ...",
            },
            bet: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "bet",
            },
            win: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "win",
            },
            txnId: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "id to match bet and win",
            },
            txnType: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "debit, credit, debit_credit",
            },
            agentStartBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "agent balance before",
            },
            agentEndBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "agent balance after",
            },
            userStartBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "user balance before",
            },
            userEndBalance: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
                comment: "user balance after",
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
                comment: "parent path",
            },
        },
        {
            tableName: "slot_game_transactions",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return SlotGameTransaction;
};

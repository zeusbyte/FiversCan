module.exports = (sequelize, Sequelize) => {
    const Message = sequelize.define(
        "Message",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            senderCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            receiverCode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            messageTitle: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            messageContent: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: "",
            },
            readStatus: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            answerContent: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: "",
            },
            answerStatus: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            parentPath: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
        },
        {
            tableName: "messages",
            timestamps: true,
        }
    );

    return Message;
};

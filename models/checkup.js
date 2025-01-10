module.exports = (sequelize, Sequelize) => {
    const Checkup = sequelize.define(
        "Checkup",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: "",
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0: inspection, 1: running",
            },
            startTime: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
            endTime: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "",
            },
        },
        {
            tableName: "checkups",
            timestamps: true,
        }
    );

    return Checkup;
};

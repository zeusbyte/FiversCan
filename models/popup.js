module.exports = (sequelize, Sequelize) => {
    const Popup = sequelize.define(
        "Popup",
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
            },
        },
        {
            tableName: "popups",
            timestamps: true,
        }
    );

    return Popup;
};

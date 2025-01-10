module.exports = (sequelize, Sequelize) => {
    const Provider = sequelize.define(
        "Provider",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            endpoint: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            config: {
                type: Sequelize.TEXT,
            },
        },
        {
            tableName: "providers",
            timestamps: true,
        }
    );

    return Provider;
};

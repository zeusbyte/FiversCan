module.exports = (sequelize, Sequelize) => {
    const Currency = sequelize.define(
        "Currency",
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
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            config: {
                type: Sequelize.TEXT('long'),
                get() {
                    let val = this.getDataValue('config');
                    if (typeof val == "object") {
                        return val;
                    } else {
                        return JSON.parse(val ? val : "{}");
                    }
                },
            },
        },
        {
            tableName: "currencies",
            timestamps: true,
        }
    );

    return Currency;
};

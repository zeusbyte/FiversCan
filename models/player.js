module.exports = (sequelize, Sequelize) => {
    const Player = sequelize.define(
        "Player",
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV1,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.STRING,
                allowNull: false,
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
            lastBet: {
                type: Sequelize.DOUBLE(20, 2),
            },
            lastWin: {
                type: Sequelize.DOUBLE(20, 2),
            },
            status: {
                type: Sequelize.STRING,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        },
        {
            tableName: "players",
            timestamps: true,
            updatedAt: false,
        }
    );
    Player.associate = (db) => {
        Player.belongsTo(db.User, { foreignKey: "userId", targetKey: "id", as: "user" });
    };

    Player.save = async (values) => {
        const { agentCode, userCode, providerCode, gameCode } = values;
        values.updatedAt = new Date();

        const [player, created] = await Player.findOrCreate({ where: { agentCode, userCode, providerCode, gameCode }, defaults: values });
        if (!created) {
            await player.update(values);
        }
        return player;
    };

    return Player;
};

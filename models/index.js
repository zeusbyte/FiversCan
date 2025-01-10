const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require("../config/main");
const basename = path.basename(module.filename);

const sequelize = new Sequelize(config.database.name, config.database.user, config.database.pass, {
    host: config.database.host,
    dialect: config.database.type,
    port: config.database.port,
    logging: config.database.logging,
    pool: {
        max: 1000,
        min: 0,
        acquire: 60000,
        idle: 30000,
    },
    timezone: config.database.timezone,
});

const db = {};

fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf("." != 0) && file !== basename && file.slice(-3) === ".js";
    })
    .forEach((file) => {
        const model = sequelize.import(path.join(__dirname, file));

        db[model["name"]] = model;
    });

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sync = async () => {
    await db.sequelize.sync();

    Object.keys(db).forEach(async (modelName) => {
        if (db[modelName].associate) {
            await db[modelName].associate(db);
        }
    });

    // await db["Agent"].migrate(); TEMP FIX DISABLED MIGRATE
};

module.exports = db;

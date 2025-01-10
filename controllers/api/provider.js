const { Op } = require("sequelize");
const { Provider } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");
const { requestForCheck } = require("../../utils/request");

exports.createProvider = async (req, res) => {
    try {
        const { providerCode, providerName, providerEndpoint, providerType } = req.body;

        await Provider.create({
            code: providerCode,
            name: providerName,
            endpoint: providerEndpoint,
            type: providerType
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Provider | Create", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.updateProvider = async (req, res) => {
    try {
        const { providerCode, providerName, providerEndpoint, providerType } = req.body;
        const { id } = req.params;

        const provider = await Provider.findByPk(id);
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        await provider.update({
            code: providerCode,
            name: providerName,
            endpoint: providerEndpoint,
            type: providerType
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Provider | Update", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.setStatusProvider = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const provider = await Provider.findByPk(id);
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        await provider.update({
            status: status,
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Provider | Set Status", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.deleteProvider = async (req, res) => {
    try {
        await Provider.destroy({ where: { id: req.params.id } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Provider | Delete", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findByPk(req.params.id);

        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        return res.json({
            status: 1,
            data: provider,
        });
    } catch (error) {
        logger("error", "API | Provider | Get By ID", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAllProviders = async (req, res) => {
    try {
        const { start, search, draw, length, order, dir } = req.query;

        let query = {
            [Op.or]: [{ code: { [Op.substring]: search } }, { name: { [Op.substring]: search } }, { endpoint: { [Op.substring]: search } }],
        };

        const result = await Provider.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [[order, dir]],
        });

        return res.json({
            status: 1,
            data: result.rows,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: result.count,
            recordsFiltered: result.count,
        });
    } catch (error) {
        logger("error", "API | Provider | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.checkProvider = async (req, res) => {
    try {
        const { providerCode } = req.query;

        if (providerCode == "all") {
            let result = [];

            const providers = await Provider.findAll();

            for (const provider of providers) {
                const checkResult = await requestForCheck(provider.code, provider.endpoint);
                result.push({
                    code: provider.code,
                    ...checkResult,
                });
            }

            return res.json({
                status: 1,
                result,
            });
        } else {
            const provider = await Provider.findOne({ where: { code: providerCode } });

            if (!provider) {
                return res.json({
                    status: 0,
                    msg: ERR_MSG.INVALID_PROVIDER,
                });
            }

            const result = await requestForCheck(provider.code, provider.endpoint);

            return res.json({
                status: 1,
                result,
            });
        }
    } catch (error) {
        logger("error", "API | Provider | Check", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

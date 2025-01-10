const axios = require("axios");
const logger = require("./logger");
const config = require("../config/main");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(config.manage.cryptKey);

exports.requestForSlot = async (comment, type, url, data = {}) => {
    try {
        logger("info", comment, `Request to ${url}, ${JSON.stringify(data)}`);

        const instance = axios.create({
            timeout: 1000 * 30,
        });

        let response;
        if (type.toUpperCase() == "GET") {
            response = await instance.get(url, { params: data });
        } else if (type.toUpperCase() == "POST") {
            response = await instance.post(url, data);
        }

        logger("info", comment, `Response from ${url} ${JSON.stringify(response.data)}`);

        return response.data;
    } catch (error) {
        logger("error", comment, `Request for Slot failed. ${error.message}`);

        return {};
    }
};

exports.requestForCheck = async (providerCode, providerEndpoint) => {
    let result = {
        status: 0,
        time: 0,
        total: 0,
        running: 0,
        checking: 0,
    };

    try {
        const startTime = Date.now();

        const response = await axios.get(`${providerEndpoint}/api/alive`);

        if (response.data.status == true) {
            result.status = 1;
            result.time = Date.now() - startTime;
        }
    } catch (error) {
        logger("error", "Provider | Check Provider (Status)", `Request for ${providerCode} failed. ${error.message}`);
    }

    try {
        let url = `${providerEndpoint}/api/gamelist?isTest=false`;

        if (providerCode == "REELKINGDOM") {
            url += `&pinfo=REELKINGDOM`;
        }

        const response = await axios.get(url);

        if (response.data.status == 1) {
            const games = response.data.games;

            for (const game of games) {
                if (game.status == 1) {
                    result.running++;
                } else {
                    result.checking++;
                }
            }

            result.total = games.length;
        }
    } catch (error) {
        logger("error", "Provider | Check Provider (Game)", `Request for ${providerCode} failed. ${error.message}`);
    }

    return result;
};

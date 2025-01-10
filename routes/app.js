const express = require("express");

const router = express.Router();

// controllers
const authController = require("../controllers/app/auth");
const agentController = require("../controllers/app/agent");
const userController = require("../controllers/app/user");
const callController = require("../controllers/app/call");
const noticeController = require("../controllers/app/notice");
const restController = require("../controllers/app/rest");
const providerController = require("../controllers/app/provider");

// rest routes
router.get("/dashboard", restController.dashboard);
router.get("/docs", restController.docs);
router.get("/404", restController.notFound);
router.get("/profile", restController.profile);

// auth routes
router.get("/login", authController.login);

// agents routes
router.get("/agent", agentController.agents);
router.get("/agent_exchange_history", agentController.agentExchangeHistory);
router.get("/agent_balance_history", agentController.agentBalanceHistory);

// users routes
router.get("/user", userController.users);
router.get("/user_exchange_history", userController.userExchangeHistory);
router.get("/user_balance_history", userController.userBalanceHistory);

// transaction routes
router.get("/slot_game_transaction", userController.slotGameTransaction);
router.get("/live_game_transaction", userController.liveGameTransaction);

// call routes
router.get("/call", callController.call);
router.get("/call_history", callController.callHistory);
router.get("/control_rtp", callController.controlRtp);

// provider routes
router.get("/provider", providerController.provider);

// notice routes
router.get("/message", noticeController.message);
router.get("/checkup", noticeController.checkup);
router.get("/popup", noticeController.popup);

// 404
router.get("/*", restController.notFound);

module.exports = router;

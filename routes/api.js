const express = require("express");

const router = express.Router();

// controllers
const authController = require("../controllers/api/auth");
const agentController = require("../controllers/api/agent");
const agentBalanceProgressController = require("../controllers/api/agentBalanceProgress");
const agentTransactionsController = require("../controllers/api/agentTransaction");
const checkupController = require("../controllers/api/checkup");
const gameTransactionController = require("../controllers/api/gameTransaction");
const messageController = require("../controllers/api/message");
const popupController = require("../controllers/api/popup");
const userController = require("../controllers/api/user");
const userBalanceProgressController = require("../controllers/api/userBalanceProgress");
const userTransactionController = require("../controllers/api/userTransaction");
const realtimeController = require("../controllers/api/realtime");
const callController = require("../controllers/api/call");
const providerController = require("../controllers/api/provider");

// middlewares
const validate = require("../middlewares/validate");

// validate schemas
const authSchema = require("../validations/auth");
const agentSchema = require("../validations/agent");
const checkupSchema = require("../validations/checkup");
const messageSchema = require("../validations/message");
const popupSchema = require("../validations/popup");
const userSchema = require("../validations/user");
const callSchema = require("../validations/call");
const providerSchema = require("../validations/provider");

// alive routes
router.get("/alive", (req, res) => {
    return res.json({ status: 1 });
});

// i18n
router.get("/i18n/:locale", (req, res) => {
    req.session.locale = req.params.locale;

    if (req.headers.referer) {
        res.redirect(req.headers.referer);
    } else {
        res.redirect("/");
    }
});

// auth routes
router.post("/auth/login", validate(authSchema.login), authController.login);
router.post("/auth/logout", authController.logout);

// agent routes
router.post("/agent/exchange", validate(agentSchema.exchange), agentController.exchangeAgent);
router.get("/agent/parent/:id", agentController.getParentAgents);
router.get("/agent/child/:id", agentController.getChildAgents);
router.post("/agent/check", validate(agentSchema.checkCode), agentController.checkAgentCode);
router.put("/agent/profile", validate(agentSchema.profile), agentController.updateProfile);
router.put("/agent/rtp", validate(agentSchema.changeRtp), agentController.changeRtp);
router.get("/agent/tree", agentController.getAgentsByTree);
router.get("/agent/depth", agentController.getChildMaxDepth);
router.post("/agent", validate(agentSchema.create), agentController.createAgent);
router.put("/agent/:id", validate(agentSchema.update), agentController.updateAgent);
router.get("/agent/:id", agentController.getAgentById);
router.delete("/agent/:id", agentController.deleteAgent);
router.get("/agent/i18n/:locale", agentController.changeLanguage);

// currency
router.get("/currency", agentController.getCurrencies);

// agent balance progress routes
router.get("/agent_balance_progress", agentBalanceProgressController.getAllProgresses);

// agent transaction routes
router.get("/agent_transaction", agentTransactionsController.getAllTransactions);
router.get("/agent_transaction/type", agentTransactionsController.getTransactionByType);
router.get("/agent_transaction/:id", agentTransactionsController.getTransactionsByAgent);

// checkup routes
router.post("/checkup", validate(checkupSchema.create), checkupController.createCheckup);
router.put("/checkup/:id", checkupController.releaseCheckup);
router.get("/checkup", checkupController.getAllCheckups);
router.delete("/checkup/:id", checkupController.deleteCheckup);

// game transaction routes
router.get("/game_transaction", gameTransactionController.getAllGameTransactions);

// provider routes
router.get("/provider", providerController.getAllProviders);
router.get("/provider/check", providerController.checkProvider);
router.get("/provider/:id", providerController.getProviderById);
router.post("/provider", validate(providerSchema.create), providerController.createProvider);
router.put("/provider/:id", validate(providerSchema.update), providerController.updateProvider);
router.put("/provider/status/:id", validate(providerSchema.setStatus), providerController.setStatusProvider);
router.delete("/provider/:id", providerController.deleteProvider);

// message routes
router.post("/message", validate(messageSchema.create), messageController.createMessage);
router.put("/message/:id", validate(messageSchema.answer), messageController.answerMessage);
router.delete("/message/:id", messageController.deleteMessage);
router.get("/message/:id", messageController.getMessageById);
router.get("/message", messageController.getAllMessages);

// popup routes
router.post("/popup", validate(popupSchema.create), popupController.createPopup);
router.put("/popup/:id", popupController.releasePopup);
router.delete("/popup/:id", popupController.deletePopup);
router.get("/popup", popupController.getAllPopups);

// user routes
router.get("/user/all", userController.getAllUsersForDT);
router.get("/user/all/list", userController.getAllUsers);
router.get("/user/agent/:code", userController.getUsersByAgent);
router.put("/user/:code", validate(userSchema.update), userController.updateAgentUser);
router.get("/user/:id", userController.getUserById);
router.post("/user/rtp", validate(userSchema.changeRtp), userController.changeRtp);
router.post("/user/exchange", validate(userSchema.exchange), userController.exchangeUser);

// user balance progress routes
router.get("/user_balance_progress", userBalanceProgressController.getAllProgresses);

// user transaction routes
router.get("/user_transaction/all", userTransactionController.getAllTransactions);
router.get("/user_transaction/agent/:code", userTransactionController.getTransactionsByAgent);

// realtime routes
router.get("/realtime", realtimeController.getRealTimeInfo);

// call
router.get("/call/players", callController.getPlayers);
router.post("/call/list", validate(callSchema.getCallList), callController.getCallList);
router.post("/call/apply", validate(callSchema.applyCall), callController.applyCall);
router.post("/call/cancel", validate(callSchema.cancelCall), callController.cancelCall);
router.get("/call/history", callController.getCallHistory);
router.post("/call/rtp", validate(callSchema.controlRtp), callController.controlRtp);
router.get("/call/result", callController.getCallResult);

module.exports = router;

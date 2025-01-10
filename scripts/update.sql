-- DELETE agents with status 2
DELETE FROM agent_balance_histories where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM agent_balance_progresses where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM agent_login_histories where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM agent_transactions where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM calls where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM live_game_transactions where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM slot_game_transactions where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM players where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM slot_game_transactions where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM user_balance_progresses where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM user_transactions where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM users where agentCode in (SELECT agentCode FROM `agents` where status = 2);
DELETE FROM agents where status = 2;
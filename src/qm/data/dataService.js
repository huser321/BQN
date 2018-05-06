//Contains and maintain configrations
var logger = require("../../common/logger");
var common = require("../../common/common");
var enums = require("../../common/enums");
var branchData = require("./branchData");
var visitData = require("./visitData");
var counterData = require("./counterData");
var configurationService = require("../configurations/configurationService");
var repositoriesManager = require("../localRepositories/repositoriesManager");
var branchesData = [];


async function getTodaysUserActivitiesFromDB(branchID) {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);
        let userActivities = await repositoriesManager.userActivitiesRep.getFilterBy(["branch_ID", "closed"], [branchID, "0"]);
        userActivities = userActivities.filter(function (value) {
            return value.startTime > Today && value.closed == 0;
        });
        return userActivities;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

async function cacheBranchUserActivities(branch) {
    try {
        //Get user activities
        let userActivities = await getTodaysUserActivitiesFromDB(branch.id);

        if (userActivities) {
            branch.userActivitiesData = userActivities;
            if (branch.userActivitiesData) {
                //Set the user activities on the counter data
                for (let i = 0; i < branch.userActivitiesData.length; i++) {

                    let UserActivity = branch.userActivitiesData[i];
                    let tcounterData = new counterData();
                    tcounterData.id = UserActivity.counter_ID;
                    tcounterData.currentState_ID = UserActivity.id;
                    if (tcounterData.id > 0) {
                        let found = false;
                        for (let i = 0; i < branch.countersData.length; i++) {
                            if (branch.countersData[i].id == UserActivity.counter_ID) {
                                found = true;
                                branch.countersData[i].currentState_ID = UserActivity.id;
                                break;
                            }
                        }
                        if (!found) {
                            let tcounterData = new counterData();
                            tcounterData.id = UserActivity.counter_ID;
                            tcounterData.currentState_ID = UserActivity.id;
                            branch.countersData.push(tcounterData);
                        }
                    }
                }
            }
        }

    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

async function getTodaysTransactionFromDB(branchID) {
    try {
        let Now = new Date();
        let Today = Now.setHours(0, 0, 0, 0);

        //Get only the transactions for the day
        let States = [enums.StateType.Pending, enums.StateType.PendingRecall, enums.StateType.Serving];
        let transactionsData = await repositoriesManager.transactionRep.getFilterBy(["branch_ID", "state"], [branchID, States]);
        transactionsData = transactionsData.filter(function (value) {
            return value.creationTime > Today;
        });
        return transactionsData;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

async function cacheBranchTransactions(branch) {
    try {
        branch.transactionsData = await getTodaysTransactionFromDB(branch.id);
        if (branch.transactionsData) {
            for (let i = 0; i < branch.transactionsData.length; i++) {
                let transaction = branch.transactionsData[i];

                //Set the counter data
                if (transaction.counter_ID > 0) {
                    let tcounterData = new counterData();
                    tcounterData.id = transaction.counter_ID;
                    tcounterData.currentTransaction_ID = transaction.id;

                    let found = false;
                    for (let i = 0; i < branch.countersData.length; i++) {
                        if (branch.countersData[i].id == transaction.counter_ID) {
                            found = true;
                            branch.countersData[i].currentTransaction_ID = transaction.id;
                            break;
                        }
                    }
                    if (!found) {
                        let tcounterData = new counterData();
                        tcounterData.id = transaction.counter_ID;
                        tcounterData.currentTransaction_ID = transaction.id;
                        branch.countersData.push(tcounterData);
                    }
                }

                //To Visit Data
                let VisitData;
                if (branch.visitData) {
                    VisitData = branch.visitData.find(function (value) {
                        return transaction.visit_ID == value.visit_ID;
                    });
                }
                if (!VisitData) {
                    VisitData = new visitData();
                    VisitData.visit_ID = transaction.visit_ID;
                    VisitData.customer_ID = transaction.customer_ID;
                    VisitData.transactions_IDs.push(transaction.id);
                    branch.visitData.push(VisitData);

                } else {
                    branch.transactions_IDs.push(transaction.id);
                }
            }

        }
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
}

//Cache Server Configs from DB
var cacheData = async function () {
    try {
        let result = common.success;
        let BranchesConfig = configurationService.configsCache.branches;
        if (BranchesConfig != null && BranchesConfig.length > 0) {
            for (let i = 0; i < BranchesConfig.length; i++) {
                let branch = new branchData();
                branch.id = BranchesConfig[i].ID;
                await cacheBranchUserActivities(branch);
                await cacheBranchTransactions(branch);
                branchesData.push(branch);
            }
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return common.error;
    }
};

//Get the Branch Data and counter data then the current Activity
function getCurrentData(OrgID, BranchID, CounterID, output) {
    try {

        let BracnhData;
        let CounterData;
        let CurrentActivity;
        let CurrentTransaction;

        //Get Branch Data
        BracnhData = branchesData.find(function (value) {
            return value.id == BranchID;
        }
        );

        //Get current State
        if (BracnhData && BracnhData.countersData) {
            for (let i = 0; i < BracnhData.countersData.length; i++) {
                if (BracnhData.countersData[i].id == CounterID) {
                    CounterData = BracnhData.countersData[i];
                    break;
                }
            }
            if (!CounterData) {
                let tcounterData = new counterData();
                tcounterData.id = CounterID;
                BracnhData.countersData.push(tcounterData);
                CounterData = BracnhData.countersData[BracnhData.countersData.length - 1];
            }
        }

        //Get Counter Status
        if (CounterData) {
            if (CounterData.currentState_ID) {
                CurrentActivity = BracnhData.userActivitiesData.find(function (value) {
                    return CounterData.currentState_ID == value.id;
                });
            }
            if (CounterData.currentTransaction_ID) {
                CurrentTransaction = BracnhData.transactionsData.find(function (value) {
                    return CounterData.currentTransaction_ID == value.id;
                });
            }
        }



        output.push(BracnhData);
        output.push(CounterData);
        output.push(CurrentActivity);
        output.push(CurrentTransaction);
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
}

var initialize = async function () {
    try {
        let result = await repositoriesManager.initialize();
        if (result == common.success) {
            result = await cacheData();
        }
        return result;
    }
    catch (error) {
        logger.logError(error);
        return false;
    }
};

module.exports.getCurrentData = getCurrentData;
module.exports.initialize = initialize;
module.exports.branchesData = branchesData;
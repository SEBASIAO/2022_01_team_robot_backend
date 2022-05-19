'use strict';

// create App function
    module.exports = function(app) {
        var userList = require('./modelController');

// todoList Routes

// get and post request for /todos endpoints
        app
        .route("/user")
        .get(userList.listAllUsers)
        .post(userList.createNewUser);

// put and delete request for /todos endpoints
        app
        .route("/user/:id")
        .put(userList.updateUser)
        .delete(userList.deleteUser);

        app
        .route("/login")
        .post(userList.login)

        app
        .route("/match")
        .post(userList.createNewMatch)
        .get(userList.listAllMatcher);

        app
        .route("/match/finish")
        .post(userList.finishMatch);

        app
        .route("/match/:id")
        .delete(userList.deleteMatch)

        app
        .route("/prediction/running/:id")
        .get(userList.getRunningPredictions)
        .put(userList.editPrediction)
        .delete(userList.deletePrediction)

        app
        .route("/prediction/finished/:id")
        .get(userList.getFinishedPredictions)

        app
        .route("/prediction")
        .post(userList.createPrediction)
    };

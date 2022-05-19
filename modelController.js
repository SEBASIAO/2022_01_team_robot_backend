// import Todo Model
const User = require("./todoModel");
const Match = require("./matchModel")
const Prediction = require("./predictionModel")

// DEFINE CONTROLLER FUNCTIONS

// listAllTodos function - To list all todos
exports.listAllUsers = (req, res) => {
    User.find({}, (err, user) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).json(user);
    });
};

// createNewTodo function - To create new todo
exports.createNewUser = (req, res) => {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (user != null) {
                res.status(409).send()
            } else {
                let newUser = new User(req.body);
                console.log(req.body)
                newUser.save((err, user) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    res.status(201).json(user);
                });
            }
        }
    })
};

// updateTodo function - To update todo status by id
exports.updateUser = (req, res) => {
    User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, user) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).json(user);
    });
};

// deleteTodo function - To delete todo by id
exports.deleteUser = async (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (!user) {
            res.status(404).send()
        } else {
            res.send(user).json({ message: "Todo successfully deleted" });
        }
    }
    ).catch(error => {
        res.status(500).send(error)
    })
};

exports.login = (req, res) => {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (user != null) {
                if (req.body.pwd == user.pwd) {
                    res.status(200).send({ status: 1, userId: user._id, isAdmin : user.isAdmin })
                } else {
                    res.status(200).send({ status: 2, userId: "" })
                }
            } else {
                res.status(200).send({ status: 3, userId: "" })
            }
        }
    })
};

exports.createNewMatch = (req, res) => {
    Match.findOne({ local: req.body.local, visit: req.body.visit, is_finished: false }, function (err, match) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (match != null) {
                res.status(409).send()
            } else {
                let newMatch = new Match(req.body);
                newMatch.save((err, match) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    res.status(201).json(match);
                });
            }
        }
    })
};

exports.listAllMatcher = (req, res) => {
    Match.find({ is_finished: { $ne: true } }, (err, match) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).json(match);
    });
};

exports.deleteMatch = async (req, res) => {
    const deleteMatch = await Match.findByIdAndDelete(req.params.id)
    
    if (!deleteMatch) {
        res.status(404).send({ message: "Partido no encontrado" })
    } else {
        await Prediction.deleteMany({ matchId: req.params.id })
        res.status(200).send({ message: "Partido eliminado" });
    }

};

exports.finishMatch = (req, res) => {
    Match.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, match) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).json(match);
    });
};

exports.getRunningPredictions = async (req, res) => {
    const find = await Prediction.find({ userId: { $eq: req.params.id } })
    const filter = await filterRunningPredictions(find, req)
    res.status(200).send(filter)
};

exports.editPrediction = async (req, res) => {
    Prediction.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, pred) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).json(pred);
    });
};

exports.deletePrediction = async (req, res) => {
    Prediction.findByIdAndDelete(req.params.id).then(pred => {
        if (!pred) {
            res.status(404).send()
        } else {
            res.status(200).send({ message: "Prediccion eliminada correctamente" });
        }
    }
    )
};

exports.getFinishedPredictions = async (req, res) => {
    const find = await Prediction.find({ userId: { $eq: req.params.id } })
    const filter = await filterFinishedPredictions(find, req)
    res.status(200).send(filter)
};

async function filterRunningPredictions(predictions, req) {
    var response = [];
    for (let i = 0; i < predictions.length; i++) {
        const match = await Match.findOne({ _id: predictions[i].matchId })
        predictions[i].isFinished = match.is_finished
        const pred = await Prediction.findOneAndUpdate({ _id: predictions[i]._id }, predictions[i], { new: true })
        response.push({
            prediction: pred,
            match: match
        })
    }
    const filteredPredictions = await Prediction.find({ $and: [{ userId: { $eq: req.params.id } }, { isFinished: { $ne: true } }] })
    return response
}

async function filterFinishedPredictions(predictions, req) {
    var response = [];
    for (let i = 0; i < predictions.length; i++) {
        const match = await Match.findOne({ _id: predictions[i].matchId })
        predictions[i].isFinished = match.is_finished
        await Prediction.findOneAndUpdate({ _id: predictions[i]._id }, predictions[i], { new: true })
    }
    let filteredPredictions = await Prediction.find({ $and: [{ userId: { $eq: req.params.id } }, { isFinished: { $eq: true } }] })
    let totalPoints = 0
    let matchPoints = 0
    for (let i = 0; i < filteredPredictions.length; i++) {
        const match = await Match.findOne({ $and: [{ _id: filteredPredictions[i].matchId }, { is_finished: { $eq: true } }] })
        if (match.local_goals == filteredPredictions[i].local_goals) {
            filteredPredictions[i].isLocalGoalsGuessed = true
            matchPoints += 5
        }
        if (match.visit_goals == filteredPredictions[i].visit_goals) {
            filteredPredictions[i].isVisitGoalsGuessed = true
            matchPoints += 5
        }
        if (filteredPredictions[i].isVisitGoalsGuessed && filteredPredictions[i].isLocalGoalsGuessed) {
            matchPoints += 10
        }
        filteredPredictions[i].totalPoints = matchPoints.toString()
        totalPoints += matchPoints
        matchPoints = 0;
        response.push({
            match : match,
            prediction: filteredPredictions[i]
        })
        await Prediction.findOneAndUpdate({ _id: filteredPredictions[i]._id }, filteredPredictions[i], { new: true })
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id }, { points: totalPoints.toString() })
    console.log(user)
    return response
}

exports.createPrediction = (req, res) => {
    Prediction.findOne({ $and: [{ matchId: { $eq: req.body.matchId } }, { userId: { $eq: req.body.userId } }] }, function (err, prediction) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (prediction != null) {
                res.status(400).send({ message: "Predicción ya realizada, no se puede precedir 2 veces el mismo partido" })
            } else {
                Match.findOne({ _id: req.body.matchId }, function (err, match) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        if (match != null) {
                            if (match.is_finished) {
                                res.status(400).send({ message: "Partido ya finalizado" })
                            } else {
                                let newPrediction = new Prediction(req.body);
                                console.log(newPrediction)
                                newPrediction.save((err, pred) => {
                                    if (err) {
                                        res.status(500).send(err);
                                    }
                                    res.status(201).json(pred);
                                });
                            }
                        } else {
                            res.status(404).send({ message: "Partido no encontrado" })
                        }
                    }
                })
            }
        }
    })
};
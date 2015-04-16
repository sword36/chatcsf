var mongoose = require("libs/mongoose");
mongoose.set("debug", true);

var async = require("async");

async.series([open, dropDatabase, requireModels, createUsers], function(err, res) {
    console.log(arguments);
    mongoose.disconnect();

});
function open(callback) {
    mongoose.connection.on("open", callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback)
{
    require("models/user");

    async.each(Object.keys(mongoose.models), function(nameModels, callback) {
        mongoose.models[nameModels].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {

    var users = [
        {username: "Petya", password: "2432"},
        {username: "Vasya", password: "2432"},
        {username: "Masha", password: "2432"}
    ];
    async.each(users, function(userdata, callback) {
        var user = new mongoose.models.User(userdata);
        user.save(callback)
    }, callback);
}

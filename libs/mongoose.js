var config = require("../config");
var mongoose = require("mongoose");
var uriUtil = require("mongodb-uri");

var mongodbUri = config.get("mongoose:uri");
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

mongoose.connect(mongooseUri, config.get("mongoose:options"));
//var db = mongoose.createConnection(mongooseUri, config.get("mongoose:options"));
//db.on("error", console.error.bind(console, "connection error:"));

module.exports = mongoose;
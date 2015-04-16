var config = require("config");
var mongoose = require("mongoose");
var uriUtil = require("mongodb-uri");

var mongodbUri = config.get("mongoose:uri");
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

mongoose.connect(mongooseUri, config.get("mongoose:options"));
module.exports = mongoose;
var checkAurh = require("../middleware/checkAuth");

module.exports = function(app) {
  app.get("/", require("./frontpage").get);

  app.get("/login", require("./login").get);

  app.post("/login", require("./login").post);

  app.post("/logout", require("./logout").post);

  app.get("/chat", checkAurh, require("./chat").get);

  app.get("/game", checkAurh, require("./game").get);

  app.get("/caesar", checkAurh, require("./caesar").get);
};
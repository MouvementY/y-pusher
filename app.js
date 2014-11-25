var express = require("express");
var app = express();
var http = require("http").Server(app);
var raven = require("raven");
var io = require("socket.io")(http);
var redis = require("redis");
var env = process.env.NODE_ENV || "development";
var url = require("url");

var redisClient = null;
if (env === "production") {

	// Sentry
	app.use(raven.middleware.express(process.env.RAVEN_DNS));

	// Redis
	var redisConf = url.parse(process.env.REDISCLOUD_URL),
			redisAuth = (redisConf.auth || '').split(':'),
			redisPass = redisAuth[1];

	console.log(redisConf, redisPass);

	redisClient = redis.createClient(redisConf.port, redisConf.hostname, {
		no_ready_check: true,
		auth_pass: redisPass,
	});
	redisClient.auth(redisPass);

} else if (env === "development") {

	// Redis
	redisClient = redis.createClient(6379, '127.0.0.1');

} else {

	// Crash an error
	console.error("Unknown env '" + env + "'");
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

redisClient.psubscribe("notification *");
redisClient.on("pmessage", function(pattern, channel, message) {
	// broadcast the notification
	if (channel === "notification signatures") {
		io.emit("signatures", message);
	} else {
		console.error("unknown type of notification");
	}
});

app.get("/", function(req, res){
  res.send("<h1>5 sur 5 Tango Charlie</h1>");
});

io.on("connection", function(socket){
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("listening on *:" + port);
});

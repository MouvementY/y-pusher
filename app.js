var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var redis = require("redis").createClient();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

redis.psubscribe("notification *");
redis.on("pmessage", function(pattern, channel, message) {
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

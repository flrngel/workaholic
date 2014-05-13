/*
 * workaholic front
 */

// get workaholic configuration
var pkg=require("../package.json");
var cfg=require("../config.json");

// get redis handle
var h_redis=require("redis"),
redis=h_redis.createClient(cfg.redis.port,cfg.redis.host);

redis.on("error",function(err){
	console.log(err);
});

// front-desk express start
var async=require('async');
var uuid=require('node-uuid');
var app=require('express')();

app.use(express.json());
app.use(express.urlencoded());

app.get("/info",function(req,res){
	res.jsonp(pkg);
	res.end();
});

app.post("/work/new",function(req,res){
	if( req.body.ticketing === true ){
		var ticket=uuid.v4();
		async.parallel([
			redis.set(ticket,'queue',callback),
			redis.expire(ticket,cfg.front.ticket_expire_time,callback),
		],function(error,result){
			try{
				for(var i in error){
					if( error[i] ){
						throw error[i];
					}
				}
				callback_rpush({
					ticket: ticket,
					data: data
				});
			}catch(e){
				console.log(e);
				res.end();
			}
		});
	}else{
		callback_rpush({
			data: data
		});
	}

	callback_rpush=function(data){
		redis.rpush('task',JSON.stringify(data),function(error,result){
			console.log(error);
		});
	};
});

app.get("/work/status",function(req,res){
	if( req.query.ticket === undefined ){
		res.send(400);
		res.end();
	}

	redis.get(req.query.ticket,function(error,reply){
		res.jsonp({
			status: reply
		});
		res.end();
	});
});

// express.js
// app.post("/work/delete",function(req,res){});

// express end

// (auth|no-auth) server listening
if( cfg.redis.password !== undefined ){
	redis.auth(cfg.redis.password,function(){
		app.listen(cfg.front.port);
	});
}else{
	process.nextTick(app.listen(cfg.front.port));
}

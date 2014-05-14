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

// front authorization start
app.all("*",function(req,res,next){
	if(!((req.body.password !== undefined)?(req.body.password === cfg.front.password):true)){
		res.send(401);
		res.end();
	}else{
		next();
	}
});
// authorization end

// workaholic package info start
app.get("/info",function(req,res){
	res.jsonp(pkg);
	res.end();
});
// package info end

// push works start
app.post("/work/new",function(req,res){
	// ticket mode
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
// push works end

app.get("/work/status",function(req,res){
	// only for ticket
	if( req.query.ticket === undefined ){
		res.send(400);
		res.end();
	}

	redis.get(req.query.ticket,function(error,result){
		try{
			if( error ){
				throw error;
			}

			res.jsonp(result);
			res.end();
		}catch(e){
			res.send(500);
			res.end();
			
			console.log(e);
		}
	});
});

// (roadmap) work delete
// app.post("/work/delete",function(req,res){});
// work delete end

// (auth|no-auth) server listening start
if( cfg.redis.password !== undefined ){
	redis.auth(cfg.redis.password,function(){
		app.listen(cfg.front.port);
	});
}else{
	process.nextTick(app.listen(cfg.front.port));
}
// server listenting end

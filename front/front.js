/*
 * workaholic front
 */

// get workaholic configuration
var cfg=require("../config.json");

// get redis handle
var h_redis=require("redis"),
redis=h_redis.createClient(cfg.redis.port,cfg.redis.host);

redis.on("error",function(err){
	console.log(err);
});

// get net handler
var net=require('net'),
server=net.createServer(function(c){
	c.on('data',function(data){
		try{
			var str=data.toString().trim();
			p=JSON.parse(data);

			if( true ){ // authentication check will be here
				redis.rpush('task',JSON.stringify(p.data));
			}
		}catch(e){
			console.log(e);
		}
	});
});

if( cfg.redis.password !== undefined ){
	redis.auth(cfg.redis.password,function(){
		server.listen(cfg.front.port);
	});
}else{
	process.nextTick(server.listen(cfg.front.port));
}

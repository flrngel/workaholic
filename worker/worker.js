var cfg=require("../config.json");

try{
	worklist=require("../worklist.json");
}catch(e){
}

var h_redis=require("redis"),
redis=h_redis.createClient(cfg.redis.port,cfg.redis.host);
var cp=require("child_process");

var worker={
	process: function(){
		redis.lpop("workaholic:task",function(error,result){
			if( result ){
				var data;
				try{
					data=JSON.parse(result).data;
					if( worklist[data.taskName] ){
						if( data.ticket !== undefined ){
							redis.set("workaholic:"+data.ticket,"assigned");
						}
						var child=cp.execFile(worklist[data.taskName].execFile, data.argument,function(error,stdout,stderr){
							if( data.ticket !== undefined ){
								redis.set("workaholic:"+data.ticket,"end");
							}
							worker.sleep(0);
						});
					}else{
						worker.sleep(0);
					}
				}catch(e){
					console.error(e);
				}
			}else{
				if( data.ticket !== undefined ){
					redis.set("workaholic:"+data.ticket,"error");
				}
				worker.sleep();
			}
		});
	},
	sleep: function(_time){
		var time=_time || cfg.worker.sleeptime || 0;
		if( time === 0 ){
			process.nextTick(worker.process);
		}else{
			setTimeout(worker.process,time);
		}
	},
	start: function(){
		worker.sleep();
	}
};

if( cfg.redis.password !== undefined ){
	redis.auth(cfg.redis.password,function(){
		worker.start();
	});
}else{
	worker.start();
}

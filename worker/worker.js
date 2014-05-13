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
		redis.lpop("task",function(error,result){
			if( result ){
				try{
					var data=JSON.parse(result).data;
					if( worklist[data.taskName] ){
						var child=cp.execFile(worklist[data.taskName].execFile, data.argument,function(error,stdout,stderr){
							worker.sleep(1);
						});
					}
				}catch(e){
					console.error(e);
				}
			}else{
				worker.sleep();
			}
		});
	},
	sleep: function(_time){
		var time=_time || cfg.worker.sleeptime || 0;
		setTimeout(worker.process,time);
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
	process.nextTick(worker.start());
}

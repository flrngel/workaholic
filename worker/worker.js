var cfg=require("../config.json"),
signed;

try{
	worklist=require("../worklist.json");
}catch(e){
}

var h_redis=require("redis"),
redis=h_redis.createClient(cfg.redis.port,cfg.redis.host);

var cp=require("child_process");

var worker={
	process: function(){
		redis.lpop("task",function(err,reply){
			if( reply ){
				try{
					var data=JSON.parse(reply);
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

worker.start();

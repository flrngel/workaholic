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
						var child=cp.execFile(worklist[data.taskName].execFile, data.argument,																	function(error,stdout,stderr){}); 
					}
				}catch(e){
					console.error(e);
				}
			}
			worker.sleep();
		});
	},
	sleep: function(){
		setTimeout(worker.process,cfg.worker.sleeptime);
	},
	start: function(){
		worker.sleep();
	}
}

worker.start();

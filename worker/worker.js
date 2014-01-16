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
						console.log( data );
						var child=cp.execFile(worklist[data.taskName].execFile, data.argument,function(error,stdout,stderr){
							worker.sleep();
						});
					}
				}catch(e){
					console.error(e);
				}
			}
		});
	},
	sleep: function(){
		setTimeout(worker.process,cfg.worker.sleeptime);
	},
	start: function(){
		worker.sleep();
	}
};

worker.start();

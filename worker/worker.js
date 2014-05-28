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
				var ticket;
				try{
					result=JSON.parse(result);
					data=result.data;
					ticket=result.ticket;

					// talk about assigned
					if( ticket !== undefined ){
						redis.set("workaholic:ticket:"+ticket,"assigned");
					}

					if( worklist[data.taskName] ){
						var child=cp.execFile(worklist[data.taskName].execFile, data.argument,function(error,stdout,stderr){
							if( ticket !== undefined ){
								redis.set("workaholic:ticket:"+ticket,"end");
							}
							worker.sleep(0);
						});
					}else{
						if( ticket !== undefined ){
							redis.set("workaholic:ticket:"+ticket,"task name not in worklist");
						}
						worker.sleep(0);
					}
				}catch(e){
					if( ticket !== undefined ){
						redis.set("workaholic:ticket:"+ticket,"error");
					}
					console.error({
						pid: process.pid,
						errorData: e
					});
					redis.end();
				}
			}else{
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
	process.nextTick(function(){
		worker.start();
	});
}

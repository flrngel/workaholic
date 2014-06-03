var cfg=require("../config.json");

try{
	worklist=require("../worklist.json");
}catch(e){
}

var h_redis=require("redis"),
redis=h_redis.createClient(cfg.redis.port,cfg.redis.host);

// workaholic redis EXPIRE plan
redis.set_planned=function(key,value,callback){
	if( cfg.redis.ticket_ttl !== undefined || parseInt(cfg.redis.ticket_ttl) === -1 ){
		redis.setex(key,cfg.redis.ticket_ttl,value,callback);
	}else{
		redis.set(key,value,callback);
	}
};

var cp=require("child_process");

var async=require("async");

var worker={
	process_task: function(taskName,callback){
		redis.lpop("workaholic:task:"+taskName,function(error,result){
			if( result ){
				var data;
				var ticket;
				try{
					result=JSON.parse(result);
					data=result.data;
					ticket=result.ticket;

					// talk about assigned
					if( ticket !== undefined ){
						redis.set_planned("workaholic:ticket:"+ticket,"assigned");
					}

					if( worklist[taskName] ){
						var child=cp.execFile(worklist[taskName].execFile, data.argument, worklist[taskName].options,function(error,stdout,stderr){
							if( ticket !== undefined ){
								redis.set_planned("workaholic:ticket:"+ticket,"end");
							}
							callback(null,true);
						});
					}else{
						throw "taskName and data.taskName doesn't match";
					}
				}catch(e){
					if( ticket !== undefined ){
						redis.set_planned("workaholic:ticket:"+ticket,"error");
					}
					callback(e,null);
				}
			}else{
				callback(null,null);
			}
		});
	},
	process: function(){
		var taskList=[function(callback){
			callback(null,null,null);
		}];

		var taskPush=function(_taskName){
			function taskPushSub(error,result,callback){
				if( result !== undefined && result !== null ){
					callback(error,result);
				}
				var callback_small=function(error,result){
					callback(error,result,_taskName);
				};
				worker.process_task(_taskName,callback_small);
			}
			taskList.push(taskPushSub);
		};

		for(var taskName in worklist){
			taskPush(taskName);
		}
		
		async.waterfall(taskList,function(error,result){
			if( result === true ){
				worker.sleep(0);
			}else if( error !== null ){
				console.error({
					pid: process.pid,
					errorData: error
				});
				redis.end();
				process.exit(1);
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

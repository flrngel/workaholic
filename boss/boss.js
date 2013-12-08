var cfg=require("../config.json");
var forever=require("forever-monitor");

var msg={
	"error": function(){
	}
};

for(var i=0;i<cfg.worker.number;i++){
	var child_worker=new (forever.Monitor)('worker/worker.js',{
		silent: true,
	});

	child_worker.on('exit',msg.error);

	child_worker.start();
}

var child_front=new (forever.Monitor)('worker/worker.js',{
	silent: true,
});

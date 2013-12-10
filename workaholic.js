var boss=require("daemonize2").setup({
	main: "boss/boss.js",
	name: "workaholic-boss",
	pidfile: "tmp/workaholic-boss.pid"
});

var front=require("daemonize2").setup({
	main: "front/front.js",
	name: "workaholic-front",
	pidfile: "tmp/workaholic-front.pid"
});

switch( process.argv[2] ) {
	case "start":
		boss.start();
		front.start();
		break;
	case "stop":
		boss.stop();
		front.stop();
		break;
	default:
		console.log("Usage: [start|stop]");
}

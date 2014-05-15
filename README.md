# Workaholic

Workaholic is distributed [`execFile`](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback) worker using [Redis](http://redis.io) for work(task) assign, written with javascript([node.js](http://nodejs.org))

## Architecture

![workaholic architecture v1.0](https://raw.githubusercontent.com/flrngel/workaholic/screenshots/workaholic_architectre_v1.0.png)

- [Redis](http://redis.io) : use for task queueing, ticket storing

- `boss/boss.js` : fork and control workers [forever](https://github.com/nodejitsu/forever)

	- `worker/worker.js` : workers, get tasks from Redis

- `front/front.js` : front-desk, registers task to Redis

## Installation

	git clone https://github.com/flrngel/workaholic
	cd workaholic
	npm install

## worklist.json

worklist.json is for use to execute file([execFile](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback))

	{
		"<task name>": {
			"execFile" : "<File to execute>"
		}
	}

## config.json

config.json is for use to control Workaholic(`boss`, `worker`, `front`)

	{
		// redis configuration
		"redis":{
			"host": "localhost",
			"port": 6379,
			// authentication using redis auth command, removable
			"password": "<insert_your_redis_auth_password>"
		},
		// front-desk configuration
		"front":{
			// listening port
			"port": 8007,
			// ticket expire time - work ticket(key in redis) expire(redis expire)
			"ticket_expire_time": 60,
			// authentication for front-desk, removable
			"password": "<insert_your_password>"
		},
		// 
		"worker":{
			// fork number
			"number": 4,
			// wait time
			"sleeptime": 100
		}
	}

## 

## Roadmap (todo list)

- [ ] architecture security improvement
- [ ] front-desk access list
- [ ] benchmark test
- [ ] worker status
- [ ] thin worker
- [ ] task tracking
- [ ] boss controller
- [ ] workers with different tasklist

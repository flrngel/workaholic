# Workaholic

Workaholic is distributed `linux shell-command` worker using [Redis](http://redis.io) for work(task) assign, written with javascript([node.js](http://nodejs.org))

## Architecture

- `RedisDB Database` : use for task queueing, ticket storing

- `boss/boss.js` : fork and control workers [forever](https://github.com/nodejitsu/forever)

	- `worker/worker.js` : workers, get tasks from Redis

- `front/front.js` : front-desk, registers task to Redis

## Installation

	git clone https://github.com/flrngel/workaholic
	cd workaholic
	npm install

## worklist.json

worklist.json is for to execute file([execFile](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback))

	{
		<task name>: {
			'execFile' : <File to execute>
		}
	}

# Workaholic

![Travis](https://travis-ci.org/flrngel/workaholic.svg?branch=master)

Workaholic is distributed [`execFile`](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback) worker using [Redis](http://redis.io) for work(task) assign, written with javascript([node.js](http://nodejs.org))

## Architecture

![workaholic architecture v1.1](https://raw.githubusercontent.com/flrngel/workaholic/screenshots/workaholic_architecture_v1.1.png)

![workaholic data structure v1.2](https://raw.githubusercontent.com/flrngel/workaholic/screenshots/workaholic_data_structure_v1.2.png)

- [Redis](http://redis.io) : use for task queueing, ticket storing

- `boss.js` : fork and control workers [forever](https://github.com/nodejitsu/forever)

	- `worker/worker.js` : workers, get tasks from Redis

- `front.js` : front-desk, registers task to Redis

## Installation

	git clone https://github.com/flrngel/workaholic
	cd workaholic
	npm install

## worklist.json

worklist.json is for use to execute file([execFile](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback))

It is highly recommended **not to use** interpreter applications for security reasons, execute as your own signle script.

	{
		"<task name>": {
			"execFile" : "<File to execute>",
			"options": {
				// see available options from http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback
			}
		}
	}

## config.json

config.json is for use to control Workaholic(`boss`, `worker`, `front`)

	{
		// redis configuration
		"redis":{
			"host": "localhost",
			"port": 6379,
			// ticket time to live - work ticket(key in redis) expire time(redis expire). -1 to permanent
			"ticket_ttl": 60,
			// authentication using redis auth command, removable
			"password": "<insert_your_redis_auth_password>"
		},
		// front-desk configuration
		"front":{
			// listening port
			"port": 8007,
			// authentication for front-desk, removable
			"password": "<insert_your_password>"
		},
		// worker configuration
		"worker":{
			// number of workers
			"number": 4,
			// wait time
			"sleeptime": 100
		}
	}

## front.js (response type: json)

#### GET /info

Get Workaholic package information

#### POST /work/new

request

	{
		"ticketing(optional;boolean type)": true,
		"data": {
			"taskName(string type)": "<task anme>",
			"argument(array type, strings)": ["<arg1>","<arg2>..."]
		}
	}

response

	{
		"result": (true|false),
		"ticket(optional)": <ticket uuid>
	}

#### GET /work/status

request

	/work/status?ticket=<ticket uuid>

response

- `queue`: task is in queue pool

- `assigned`: worker assigned task

- `end`: task was successfully ended

- `error`: task had error


## Roadmap (todo list)

- ~~architecture security improvement~~ (status: unstable)
- front-desk access list
- benchmark test
- worker status
- thin worker
- task tracking
- boss controller
- ~~workers with different tasklist~~

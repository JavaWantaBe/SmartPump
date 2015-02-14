
SERVER_GULP=gulp --gulpfile server/gulpfile.js
CLIENT_GULP=gulp --gulpfile client/gulpfile.js

all: local_modules build

global_modules:
	sudo npm install -g gulp
	sudo npm install -g mocha
	sudo npm install -g bower

local_modules: global_modules
	npm install
	bower install

test: global_modules
	$(SERVER_GULP) test
	$(CLIENT_GULP) test

build:
	$(CLIENT_GULP) build


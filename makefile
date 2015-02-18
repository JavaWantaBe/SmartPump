all: local_modules setup_database build

global_modules: 
	sudo npm install -g gulp
	sudo npm install -g mocha

local_modules: global_modules
	npm install

setup_database:
	sudo apt-get install mysql-server
	node setup-database.js

build:
	gulp build


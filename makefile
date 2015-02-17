all: local_modules build

global_modules:
    sudo npm install -g gulp
    sudo npm install -g mocha
    sudo npm install -g bower

local_modules: global_modules
    npm install

build:
    gulp build


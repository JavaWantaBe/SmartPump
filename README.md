# SmartPump

Intelligent pumping system using NOAA data to determine optimum salt content.

## Install

You need the following dependencies:

```sh
$ sudo apt-get install nodejs npm ruby
```
## Note

Needed for gulp to recognise the node executable

```sh
$ sudo ln -s /usr/bin/nodejs /usr/bin/node
```

## Node dependencies:

```sh
$ sudo npm install -g gulp
$ sudo npm install -g mocha
$ sudo npm install
```

## Usage

Start the server:

```sh
$ node server
```

## Build the Client

```sh
$ gulp build
```

## Testing

```sh
$ cd server
$ mocha
```

## Beablebone

On the beaglebone itself, you will need to install mysql:

```sh
$ make setup_database
```

## MySQL Setup

create a new user:

```mysql
mysql> CREATE USER 'smartpump'@'localhost' IDENTIFIED BY 'foobar123';
mysql> GRANT SELECT, DELETE, UPDATE, INSERT ON 'smartpump.*' TO 'smartpump'@'localhost';
```

## Cape DeviceTree

Install cape devicetree:

mkdir -p cape_devicetree
cd cape_devicetree

compile the devicetree file
dtc -O dtb -o OSSO_BASE-00A0.dtbo -b 0 -@ OSSO_BASE-00A0.dts
sudo cp OSSO_BASE-00A0.dtbo /lib/firmware

activate the devicetree by the following command
cd /sys/devices/cape_manager.*/ # This command doesn't work
echo OSSO_BASE > slots
# SmartPump

Intelligent pumping system using NOAA data to determine optimum salt content.

## Install

You need the following dependencies:

```sh
$ sudo apt-get install nodejs npm ruby
$ sudo gem install sass && sudo gem install susy
```
## Note

Needed for gulp to recognise the node executable ( on older images )

```sh
$ sudo ln -s /usr/bin/nodejs /usr/bin/node
```

## Node dependencies:

```sh
$ sudo npm install -g gulp
$ sudo npm install -g mocha
$ sudo npm install -g pm2
$ sudo npm install
```


# Beablebone

## Cape DeviceTree

Install cape devicetree by copying the pre-compiled BB-I2C1-00A0.dtbo file found in 
./cape_devicetree to /lib/firmware

```sh
$sudo cp ./cape_devicetree/BB-I2C1* /lib/firmware
```

Next is to disable the existing HDMI port by editing the /boot/uEnv.txt file:

Find the following line:
##Disable HDMI
#cape_disable=capemgr.disable_partno=BB-BONELT-HDMI,BB-BONELT-HDMIN

Uncomment out cape_disable....
##Disable HDMI
cape_disable=capemgr.disable_partno=BB-BONELT-HDMI,BB-BONELT-HDMIN

Lastly, we need to permenately enable the I2C1 bus by editing the /etc/default/capemgr file:

# Options to pass to capemgr
#CAPE=

Edit the above line to read:
# Options to pass to capemgr
CAPE=BB-I2C1


## RTC Setup

Once the cape manager has enabled the I2C1 bus and you have RTC installed on 
that bus, you can enable it with the following:

```sh
$sudo mkdir /usr/share/rtc_ds3231
$sudo cp ./rtc/clock_init.sh /usr/share/rtc_ds3231
$sudo chmod +x /usr/share/rtc_ds3231/clock_init.sh
$sudo cp ./rtc/rtc-ds3231.service /lib/systemd/system/
$sudo systemclt enable rtc-ds3231.service
```


## MySQL Setup

On the beaglebone itself, you will need to install mysql:

```sh
$ make setup_database
```


create a new user ( this will be added to newer build scripts ):

```mysql
mysql> CREATE USER 'smartpump'@'localhost' IDENTIFIED BY 'foobar123';
mysql> GRANT SELECT, DELETE, UPDATE, INSERT, EXECUTE ON smartpump.* TO 'smartpump'@'localhost';
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

## Usage

Start the server:

```sh
$ node ./server/index.js
```



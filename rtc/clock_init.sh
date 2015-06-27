#!/bin/bash
sleep 15
a=$(date +%Y)

if [[ $a < 2013 ]]; then
	
	echo ds3231 0x68 > /sys/class/i2c-adapter/i2c-2/new_device
	echo "Retrieving time from rtc"
	hwclock -s -f /dev/rtc1
	hwclock -w

	echo "Date has been read from RTC, and copied to system clock"
else
   # Assumes if date is correct on reboot, that you are connected to network
   echo "Fetching time from ntp server"
   $(/usr/bin/ntpdate -b -s u pool.ntp.org)  

   if [ -e /dev/rtc1 ]; then
     echo "Writing system clock to RTC"
     hwclock -w -f /dev/rtc1
   else
    echo ds1307 0x68 > /sys/class/i2c-adapter/i2c-2/new_device
     echo "Writing system clock to RTC"
     hwclock -w -f /dev/rtc1
   fi
fi
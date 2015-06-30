#!/bin/bash
if [ -e /dev/rtc1 ]; then
  echo "Found existing RTC1"
else
  if [ -e /dev/i2c-2 ]; then
    echo ds3231 0x68 > /sys/class/i2c-adapter/i2c-2/new_device
  fi
fi

sleep 2

if [ -e /dev/rtc1 ]; then
  echo "Found RTC1, Reading from it now"
  hwclock -s -f /dev/rtc1
  echo "Writing to System Clock"
  hwclock -w
  echo "Writing to RTC0"
  hwclock -w -f /dev/rtc0
fi

# Assumes if date is correct on reboot, that you are connected to network
echo "Fetching time from ntp server"
$(/usr/sbin/ntpdate -b -u -s pool.ntp.org)

if [ -e /dev/rtc1 ]; then
  echo "Writing system clock to RTC"
  hwclock -w -f /dev/rtc1
fi

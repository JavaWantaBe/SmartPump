To start developing:

    Install dependencies:
        # in this directory
        sudo npm install -g gulp  # client build system (like make)
        sudo npm install -g mocha # javascript test framework
        npm install               # install dependencies found in package.json

    Start the server:
        node server

    Build the client:
        gulp build # use gulp watch to avoid complete re-build

    Testing:
        cd server
        mocha
            
    On the beaglebone itself, you will need -
        Install mysql:
            make setup_database

            create a new user:
                CREATE USER 'smartpump'@'localhost' IDENTIFIED BY 'foobar123';
                GRANT SELECT, DELETE, UPDATE, INSERT ON 'smartpump.*' TO 'smartpump'@'localhost';
        
        Install cape devicetree:
            mkdir -p cape_devicetree
            cd cape_devicetree

            # compile the devicetree file
            dtc -O dtb -o OSSO_BASE-00A0.dtbo -b 0 -@ OSSO_BASE-00A0.dts
            sudo cp OSSO_BASE-00A0.dtbo /lib/firmware

            # activate the devicetree by the following command
            cd /sys/devices/cape_manager.*/ # This command doesn't work
            echo OSSO_BASE > slots
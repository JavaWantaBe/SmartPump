To start developing:

	Install dependencies:
		# in this directory
		sudo npm install -g gulp  # client build system (like make)
		sudo npm install -g mocha # client/server test framework
		sudo npm install -g bower # package manager for client side modules 
		npm install               # install dependencies found in package.json
		cd client
		bower install             # install dependencies found in client/bower.json

	Start the server:
		./server/start
		# The server must be restarted after changes to its source are made

	Build the client:
		cd client
		gulp # use gulp watch to avoid complete re-build

	Testing:
		Client:
			cd client
			mocha
		Server:
			cd server
			mocha
			
	On the beaglebone itself, you will need -
	    
	    Install mysql
	        apt-get install mysql-server with admin password of 'foobar123'.
	    
	        log into the mysql server by: 
	            mysql -u root -p and when prompted enter in the above password.
	        
	        run the database creation script provided in the ./docs directory called database.sql:
	            SOURCE ( directory of pumpjs project)/docs/database.sql;
	        
	        create a new user:
	            CREATE USER 'smartpump'@'localhost' IDENTIFIED BY 'foobar123';
	            GRANT SELECT, DELETE, UPDATE, INSERT ON 'smartpump.*' TO 'smartpump'@'localhost';
	    
	    Install cape devicetree -
	        in the cape_devicetree directory :
	            first compile the devicetree file with the following command
	                dtc -O dtb -o OSSO_BASE-00A0.dtbo -b 0 -@ OSSO_BASE-00A0.dts
	            copy the newly compiled .dtbo file to the /lib/firmware/ directory
	            activate the devicetree by the following command
	                cd /sys/devices/cape_manager.*/
	                echo OSSO_BASE > slots;
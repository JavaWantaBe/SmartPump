BEGIN { start = 0;
 
    if (ARGC < 3 || ARGC > 4) {
        print "awk -f readInterfaces.awk <interfaces file> device=<eth device> [debug]"
        exit 1;
    }
 
    for (i = 2; i < ARGC; i++) {
        if (ARGV[i] == debug) {
            debug = 1;
            continue;
        }
        split(ARGV[i], arg, "=");
        if (arg[1] == "device")
            device = arg[2];
    }
 
    if (!length(device)) {
        print "awk -f readInterfaces.awk <interfaces file> device=<eth device> [debug]"
        exit 1;
    }
}
 
{
    # Look for iface line and if the interface comes with the device name
    # scan whether it is dhcp or static or manual
    # e.g. iface eth0 inet [static | dhcp | manual]
    if ($1 == "iface")  {
        # Ethernet name matches - switch the line scanning on
        if ($2 == device) {
            if (debug)
                print $0;
            # It's a DHCP interface
            if (match($0, / dhcp/)) {
                print "dhcp";
                exit 0;
                # It's a static network interface. We want to scan the
                # addresses after the static line
            } else if (match ($0, / static/)) {
                static = 1;
                next;
            } else if (match ($0, / manual/)) {
                print "manual";
                exit 0;
            }
 
            # If it is other inteface line, switch it off
            # Go to the next line
        } else {
            static = 0;
            next;
        }
    }
 
    # At here, it means we are after the iface static line of
    # after the device we are searching for
    # Scan for the static content
    if (static) {
 
        if (debug)
            print "static - ", $0, $1;
 
        if ($1 == "address") {
            address = $2;
            gotAddr = 1;
        }
        if ($1 == "netmask") {
            netmask = $2;
            gotAddr = 1;
        }
        if ($1 == "gateway") {
            gateway = $2;
            gotAddr = 1;
        }
    }
}
 
END {
    if (gotAddr) {
        printf("%s %s %s\n", address, netmask, gateway);
        exit 0;
    } else {
        exit 1;
    }
}

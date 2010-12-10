# Node on WebOS

If you're already a member of the webOS 2.0 Early Access program, then you've 
already got all the tools you need to dive in to this workshop. Otherwise, 
here's what you need to do to get set up:

 1. Visit developer.palm.com and click Download SDK
 2. Follow the directions for your operating system to install the SDK and 
    VirtualBox
 3. Download this backported version of node that works on webOS v1.4.5
 4. Open a terminal and type`novaterm` to open a shell on the emulator
 5. Change to the internal drive: `cd /media/internal` 
 6. Download the zip file to the emulator/phone: 
    `wget http://camp.nodejs.org/nodeFor145.tar.gz`
 7. Unzip the file:  
    `tar -xzvf nodeFor145.tar.gz`
 8. Install node by creating prepending this to the path:
    `echo "export PATH=/media/internal/node/bin:\$PATH" >> /home/root/.profile
 9. Log out and back in with Control+d and another `novaterm`
 10. Verify it works by typing: `which node`

 (If you're on an actual device, there are alternate binaries in the node/bin folder)




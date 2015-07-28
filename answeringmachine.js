var fs = require('fs');
var net = require('net');
var port = 3000;
var password = '12345';



var server = net.createServer(function(c){
    // Log on the server side that the server is running
    console.log('server is running');
    var messages = JSON.parse(fs.readFileSync('messages.json','utf8'));
    
    // Initialize control flow through the menus
    var promptForAccess = true
    var leaveMessage = false
    var promptForPassword = false
    var promptForCommand = false  
    
    // Frequently used strings
    var menu = '\r\n-----Hey Dude-----\r\nChoose a command and enter your arguments\r\nE.g.\'1, text of message...\'\r\n __________\r\n| Commands |___________________\r\n| 1. List all messages         |\r\n| 2. Print "messageid"         |\r\n| 3. Add "your message here"   |\r\n| 4. Delete "messageid"        |\r\n| 5. Delete all messages       |\r\n| 6. Exit voicemail            |\r\nCommand: ';    
    var tildes = '\r\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\r\n';
    
    // Send greeting to the client on connect, ask for first command
    c.write('\r\nHey Dudette or Dude, enter \'1\' to leave a message \r\nor \'2\' to access the account\r\n> ');        
    
    // Control loop for entire application
    c.on('data',function(data){
        var input = data.toString().trim();
        
        // While promptForAccess is true, keep testing for 1 or 0, then stop prompting
        // and proceed to either leaveMessage or promptForPassword
        if (promptForAccess) {
            if (input === '1') {
                promptForAccess = false;
                c.write('Please leave your message!\r\n> ');
                leaveMessage = true
            } else if (input === '2') {
                promptForAccess = false
                c.write('Please enter the password!\r\n> ');
                promptForPassword = true
            } else {
                c.write('Command not recognized! Please try again!\r\n> ')
            }
        
        } else if (leaveMessage) {
            messages.push(input);
            fs.writeFileSync('messages.json',JSON.stringify(messages));
            c.write('Thanks for your message! Hasta!');
            c.end();
        
        } else if (promptForPassword) {
            if (input === '12345') {
                promptForPassword = false;
                c.write('Cool!\r\n')
                c.write(menu);
                promptForCommand = true;
            } else {
                c.write('No can do! Please try again?\r\n> ');
            }

        // Control loop for voicemail account. Until user 
        } else if (promptForCommand) {
            var command = input.substring(0,1);
            var body = input.substring(2);
            if (command === '1') {
                c.write(tildes);
                messages.forEach(function(message,index){
                    c.write(index.toString()+". "+message+'\r\n');
                });
                c.write('End of messages...\r\n');
                c.write(tildes);
                c.write(menu);
            } else if (command === '2') {
                if (messages.indexOf(body) >= 0) {
                    c.write(tildes);
                    c.write('\r\n'+messages[body]+'\r\n');
                    c.write(tildes);
                    c.write(menu);
                } else {
                    c.write(tildes);
                    c.write('\r\nCannot print message with index: '+body+'.\r\nThat index does not exist\r\n');
                    c.write(tildes);
                    c.write(menu);
                }
            } else if (command === '3') {
                messages.push(body);
                fs.writeFileSync('messages.json',JSON.stringify(messages));
                c.write(tildes);
                c.write('\r\nMessage added!\r\n');
                c.write(tildes);
                c.write(menu);
            } else if (command === '4') {
                if (messages.indexOf(body) >= 0) {
                    messages.splice(body,1);
                    fs.writeFileSync('messages.json',JSON.stringify(messages));
                    c.write(tildes);
                    c.write('\r\nMessage with id \''+body+'\' deleted\r\n');
                    c.write(tildes);
                    c.write(menu);
                } else {
                    c.write(tildes);
                    c.write('\r\nCannot delete message with index: '+body+'.\r\nThat index does not exist\r\n')
                    c.write(tildes);
                    c.write(menu);
                }
            } else if (command === '5') {
                messages = [];
                fs.writeFileSync('messages.json',JSON.stringify(messages));
                c.write(tildes);
                c.write('\r\nAll messages deleted\r\n');
                c.write(tildes);
                c.write(menu);
            } else if (command === '6') {
                c.write('\r\nHasta!\r\n');
                c.end()
            } else {
                c.write(tildes);
                c.write('\r\nCommand not recognized!\r\n');
                c.write(tildes);
                c.write(menu);
            }
        }
        // console.log(data);
    });

    c.on('end',function(){
        console.log('client disconnected');
    })
        
});

server.listen(port,function(){
    console.log('listening on ' + port);
});
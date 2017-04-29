var express = require('express'),
    app = express(),
    url = require('url'),
    rooms = require('roomsjs'),
    roomdb = require('rooms.db'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    users = {},
    path = require('path'),
    fs = require('fs');
var request = require("request");


server.listen(3000);


var html;
fs.readFile(__dirname + '/room.html', 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
    html = data.toString();
});



//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/img', express.static(__dirname + '/public/img'));
app.use('/public/js', express.static(__dirname + '/public/js'));

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'rooms/room')));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/paint', function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log('connected to mongodb!');
    }
});

var chatSchema = mongoose.Schema({
    nick: String,
    msg: String,
    room: String,
    created: { type: Date, default: Date.now }
});

var roomSchema = mongoose.Schema({
    name: String,
    count: { type: Number, default: 1 }
});

var peopleSchema = mongoose.Schema({
	index: { type: Number, default: 0 },
    name: String,
    socket: String,
    room: String
});

var drawSchema = mongoose.Schema({
    color: String,
    width: String,
    room: String,
    point: { x: Number, y:Number },
	start:String,
	end:String
});

var Chat = mongoose.model('Message', chatSchema);
var people = mongoose.model('People', peopleSchema);
var room = mongoose.model('room', roomSchema);
var draw = mongoose.model('draw', roomSchema);
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
//res.end();

	});


app.get('/public/:id', function(req, res) {
   var roomname=req.path.split('/');
   roomname=roomname[2].split('.');
   console.log(roomname[0]);
   var filepath=__dirname + '/' + req.path;
   room.findOne({ name: roomname[0]}, function(err, user) {
                    if (err) throw err;
					if(user!=null)
					{
						console.log('I am here');
   fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
        res.writeHead(404);
            res.end("These room has been deleted since there is no user on it you can creat it as a new session");
        }
		else{
			 res.sendFile(filepath);
			// console.log(req.headers.referer[0])
		}
   });
					}
					else{
						if(roomname[1]=='css')
							res.sendFile(__dirname + '/public/index.css');
						else res.sendFile(__dirname + '/index.html');
					}
   });
		//res.end();

});
   


var historydraw=[];

var isAReload=false;
var session = require('client-sessions');

io.sockets.on('connection', function(socket) {
	
	socket.on('newpage', function(data){
		room.findOne({ name: data.roomname }, function(err, roomex) {
            if (err) throw err;
			if(roomex!=null)
			{
				console.log("tas");
				io.emit('usercount', {roomname: data.roomname,count:roomex.count});
			}
			});
		
	});
	//socket.setNoDelay(true);
     for (var i in historydraw) {
 io.emit('draw', { color: historydraw[i].color,width: historydraw[i].width, point: historydraw[i].point,room:historydraw[i].room ,start:historydraw[i].start,end:historydraw[i].end} );
    }
	
    socket.on( 'draw', function( data) {
		historydraw.push({color:data.color ,width: data.width, point:data.point,room:data.room,start:data.start,end:data.end});
        io.emit('draw', { color: data.color,width: data.width,point:data.point,room:data.room,start:data.start,end:data.end });
    });



   socket.on('new user', function(data) {
        username = data.name;
        roomname = data.room;
       // console.log(username + '      ' + roomname + '           ' + data.index);
        var newpeople = new people({ name: username, socket: socket.id, room: roomname, index: data.index });
        newpeople.save(function(err) {
            if (err) throw err;
        });
    });

    socket.on('changesocket', function(data) {
       // console.log('old socket = ' + data.name);
       // console.log('new socket = ' + socket.id);
       // console.log('room = ' + data.room);
        people.findOneAndUpdate({ socket: data.name, room: data.room }, { $set: { socket: socket.id,index: data.index } }, function(err, newsock) {
            if (err) throw err;
            if (newsock != null) {
                socket.nickname = newsock.name;
                socket.join(newsock.room);
               // console.log(newsock.room);
                Chat.find({ room: data.room }, function(err, docs) {
                    if (err) throw err;
                   // console.log('sending old Messages');
                    socket.emit('load old msg', docs);
                });
            } else {
                //console.log("error in socket id cookies")
            }

        });
    });

    socket.on('Create room', function(roomname, callback) {
        room.findOne({ name: roomname }, function(err, roomex) {
            if (err) throw err;
            if (roomex == null) {
                var newroom = new room({ name: roomname, count: 1 });
                newroom.save(function(err) {
                    if (err) throw err;
                     
                    fs.writeFile(__dirname + "/public/" + roomname + ".html", html); //"<!doctype html><html><head><meta charset='utf-8' /><link type='text/css' href='index.css' rel='stylesheet' /><link rel='shortcut icon' href='img/images.jpg'><title>DrwaingPlace</title></head><body height='600px'><iframe src='img/room.html' style='width:107% ; height:700px;border:none'></iframe></body>")
                     io.emit('usercount', {roomname: roomname,count:1});
					callback(true);
                });
            
			}
			else {
                callback(false);
            }
        });

    });

    socket.on('Join room', function(data, callback, msg) {
        //console.log(data.name + 'join room' + data.room);
        roomname = data.room;
        room.findOne({ name: roomname }, function(err, roomex) {
            if (err) throw err;
            if (roomex != null) {
                //console.log('room true');

                //console.log('people true');
                room.findOneAndUpdate({ name: roomname }, { $inc: { count: 1 } }, function(err, user) {
                    if (err) throw err;
					io.emit('usercount', {roomname: roomname,count:user.count});
                });
                //console.log(socket.id + 'joined the ' + roomname);
                
                callback(true);


            } else {
               // console.log('room false');
                callback(false);
            }
        });

    });
    socket.on('Share room', function(data) {
        var roomn;
        //console.log('socket.id = ' + socket.id);
        people.find({ socket: socket.id }, function(err, peop) {
            if (err) throw err;
            if (peop != null) {
               // console.log('the room name is ' + user.room);
            } 
               // console.log('sorry i cannot get it');

        });

    });



    socket.on('room.leave', function() {
        var roomn;
        people.find({ socket: socket.id }, function(err, user) {
            if (err) throw err;
            roomn = user.room;
        });
        room.findOneAndUpdate({ name: romn }, { $dec: { count: 1 } }, function(err, user) {
            if (err) throw err;
            if (user.count == 0)
                user.remove(function(err) {
                    if (err) throw err;
                });
        });
        people.findOneAndUpdate({ socket: socket.id }, { $set: { room: "NULL" } }, function(err, user) {
            if (err) throw err;
        });
        io.to(roomname).emit('room.leaved', socket.id + ' leaved the ' + roomname);
        socket.leave(roomname);
      //  console.log(socket.id + 'leaved the ' + roomname);
    });
 socket.on('send message', function(data) {
        people.findOne({room: data.roomname }, function(err, roomex) {
            if (err) throw err;
			if(roomex){
            var msg = data.msg.trim();
            if (msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                var ind = msg.indexOf(' ');
                if (ind != -1) {
                    var name = msg.substr(0, ind);
                    var msg = msg.substr(ind + 1);
                    if (name in users) {
                        io.emit('new message', { msg: msg,nick:data.nickname });
                    }
                }
            } else {
                var newMsg = new Chat({ msg: msg, nick: data.nickname, room: roomex.room });
                newMsg.save(function(err) {
                    if (err) throw err;
                  //  console.log(roomex.room);
                    io.emit('new message', { msg: msg, nick: data.nickname });
                });
            }
			}
			else{
				console.log('only one user');
			}
        });
    });

    function updateNicknames() {
        //io.sockets.emit('usernames', Object.keys(users));
    }
	


    socket.on('disconnect', function(data) {
var roomn;
historydraw=[];
console.log(socket.id);
        people.findOne({ socket: socket.id, index: 0 }, function(err, user) {
            if (err) throw err;
            if (user != null) {
                roomn = user.room;
                if (roomn != 'NULL')
                    room.findOneAndUpdate({ name: roomn }, { $inc: { count: -1 } }, function(err, roomdata) {
                        console.log(roomn + roomdata.count);
                        if (err) throw err;
                  io.emit('usercount', {roomname: roomn,count:roomdata.count});
                        //console.log(roomdata.count);
                        if (roomdata.count == 1) {   
                             console.log('before delete ' );
                             Chat.remove({ room: roomn }, function (err) {
                                   if (err) return handleError(err);
                                       // removed!
                                       console.log('deleted ');
                                       });
                            roomdata.remove(function(err) {
                                console.log('delete ' + roomn);
                              //  Files.delete('C:/Program Files/nodejs/Server1/public/b.html');
                                var fs = require('fs');
var filePath = __dirname+'/public/'+roomn+'.html'; 
fs.unlinkSync(filePath);
                               if (err) throw err;
                            });
                        }
                    });
                people.findOneAndRemove({ socket: socket.id }, function(err) {
                    if (err) throw err;
                });
            }
        });
        delete users[socket.nickname];
        updateNicknames();
});

	  
});



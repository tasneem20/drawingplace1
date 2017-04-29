
		jQuery(function($) {
            var socket = io.connect();
            var $nickForm = $('#setNick');
            var $nickBox = $('#nickname');
            var $roomBox = $('#roomname');

            var $nickForm2 = $('#setNick2');
            var $nickBox2 = $('#nickname2');
            var $roomBox2 = $('#roomname2');
            var $nickError = $('#error');
            var $nickError1 = $('#error1');
            var $nickError2 = $('#error2');

            var callback;

			var $Index = 1;
            function writeCookie(name, value, days) {
                var date, expires;
                if (days) {
                    date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toGMTString();
                } else {
                    expires = "";
                }
                document.cookie = name + "=" + value + expires + "; path=/";
            }
			
			
            $nickForm.submit(function(e) {
                e.preventDefault();
                socket.emit('Create room', $roomBox.val(), function(callback) {
                    if (callback) {
                       
                        socket.emit('new user', {
                            name: $nickBox.val(),
                            room: $roomBox.val(),
							 index: $Index
                        });
						writeCookie('username',$nickBox.val(),10);
                        writeCookie('SocketID', socket.id, 10);
                        window.location.assign("http://localhost:3000/public/" + $roomBox.val() + ".html");
                    } else {
                        $nickError.html('that room is already in use! click on join room');
                    }
                });
            });
			
			
            $nickForm2.submit(function(e) {
                e.preventDefault();
                socket.emit('Join room', {
                    name: $nickBox2.val(),
                    room: $roomBox2.val()
                }, function(callback, msg) {
                    if (callback) {
                        socket.emit('new user', {
                            name: $nickBox2.val(),
                            room: $roomBox2.val(),
							 index: $Index
                        });
                        writeCookie('SocketID', socket.id, 10);
						writeCookie('username',$nickBox.val(),10);
                        window.location.assign("http://localhost:3000/public/" + $roomBox2.val() + ".html");
                    } else {
                        $nickError2.html('that room is not exist');
                    }
                });
            });



            socket.on('room.joined', displayMsg2);
            socket.on('room.created', displayMsg2);
            socket.on('room.leaved', displayMsg2);

            socket.on('new message', displayMsg);

            function displayMsg(data) {
                $chat.append('<br>' + data.nick + ': </b>' + data.msg + "<br/>");
            }

            function displayMsg2(data) {
                // $chat.append('<br>' + data + "<br/>");
            }

        });
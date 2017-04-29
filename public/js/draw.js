
var socket = io.connect();
var myPath;
var colors='#000000';
var width;
var point={};
var room=window.location.pathname.split('/');
var s={};
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var dataURL = canvas.toDataURL();

var colorpicker = document.getElementById('colorpicker');


function setTextColor(picker) {
		colors = '#' + picker.toString();
		console.log(picker.toString());
		console.log(colors);
	}
myPath=new Path();

   var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   }
   
  
function onMouseDown(event){
	colors='#'+colorpicker.value;
	console.log(colors);
myPath=new Path();
 socket.emit('draw', { color: colors,width: width,point:event.point,room: room[2],start:true,end:false });
// var color=document.colors.elements["color"].value;
    var size=document.dotsSize.elements["color2"].value;
    var write=document.action.elements["color1"].value;

if(write=="rubber")
{
	width=20;
	colors = 'white';

}
    
else
{
   // colors=color;
	if(size=='big')
	{
		thickness =  17;
	}
	else if(size=='medium')
	{
		thickness =  11;
	}
	else if(size=='small')
	{
		thickness =  7;
	}
	else
	{
		thickness =  3;
	}

    
   width=thickness;
    
}
 
 
   }

   function onMouseUp(event){
  
   socket.emit('draw', { color: colors,width: width,point:event.point,room: room[2],start:false,end:true });
 
   }
   var i=0;
   function onMouseDrag(event){

      mouse.pos.x = event.point.x;
      mouse.pos.y = event.point.y;
	   socket.emit('draw', { color:colors,width: width,point:event.point,room: room[2],start:false,end:false });
        
      s={color:colors,width:width,point:event.point};
		draw(s);
		 }
		 
		 var ci;
   function drawCircle( x, y, radius, color ) {
  // Render the circle with Paper.js

  ci.strokeColor=color;
  ci.strokeWidth=radius;
  ci.add([x,y]);
  // Refresh the view, so we always get an update, even if the tab is not in focus
  view.draw();

} 

    socket.on('draw', function (data) {
	if(data.room==room[2])
	{
	if(data.start==true)
	{
	ci=new Path();
	i=0;
	}
	drawCircle( data.point[1], data.point[2], data.width, data.color );
	if(data.end==true)
	{
	//location.reload();
	}
	}
  });
  
  
  function draw(data){
  myPath.strokeColor=data.color;
	myPath.strokeWidth=data.width;
	myPath.add(data.point);
	
  }
  
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
			
			
   function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
} 

  var x = window.location.pathname;
          //  var roomname3 = x.substring(8, x.length - 5);
			var roomname3=x.split('/');
			roomname3=roomname3[2].split('.');
			roomname3=roomname3[0];

jQuery(function($) {
              var $username = $("#name");
          
		   var sr = getCookie("SocketID");
            $username.html(sr);
			
            var $nickForm = $('#setNick1');
            var $nickBox = $('#nickname1');
            var $roomBox = $('#roomname1');
if($nickBox.val==undefined)
{
	$nickBox.val=getCookie('username');
}
			
			
            var $nickForm2 = $('#setNick2');
            var $nickBox2 = $('#nickname2');
			if($nickBox2.value==undefined)
{
	$nickBox.value=getCookie('username');
}
            var $roomBox2 = $('#roomname2');
			var $error1=$('#error');
			//var $error2=$('#error1');
			var $error3=$('#error2');
			var $usercount=$('#usercount');
			var $messageForm = $('#send-message');
            var $chat = $('#chat');
            var $messageBox = $('#message');
            var callback;
			var $btn4=$('#myBtn4');
		var $Index = 1;
            
var $username1=$("#name");
var sr1=getCookie("username");
$username1.html(sr1);

  socket.emit('changesocket', {
                name: sr,
                room: roomname3,
                index: 0
            });
			socket.emit('newpage', {
                roomname: roomname3,
                });


            $messageForm.submit(function(e) {
                e.preventDefault();
                socket.emit('send message',{msg: $messageBox.val(),roomname:roomname3,nickname:getCookie('username')});
                $messageBox.val('');
            });



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
                   modal1.style.display = "block";
                        window.open("http://localhost:3000/public/"+$roomBox.val()+".html");
                    } else {
                        $error1.html('that room is already in use! click on join room');
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
						writeCookie('username',$nickBox2.val(),10);
                       window.open("http://localhost:3000/public/"+$roomBox2.val()+".html");
						}
                     else {
                        $error3.html('that room is not exist');
                    }
                });
            });
			
			socket.on('usercount',function(data){
				if(data.roomname==roomname3){
					console.log(data.count);
				$usercount.html(data.count);
				//console.log(roomname3);
			}
			});
			
			socket.on('room.joined', displayMsg2);
            socket.on('room.created', displayMsg2);
            socket.on('room.leaved', displayMsg2);

            socket.on('new message', displayMsg);

            socket.on('load old msg', function(docs) {
                for (var i = 0; i < docs.length; i++) {
                    displayMsg(docs[i]);
                }
            });
			var objDiv = document.getElementById("chat");


            function displayMsg(data) {
                $chat.append('<p id="name">' + data.nick + ':	<span id="msg">' + data.msg + "</span></p>");
				objDiv.scrollTop = objDiv.scrollHeight;
            }

            function displayMsg2(data) {
                // $chat.append('<br>' + data + "<br/>");
            }


        });

 	// Get the modal
var modal1 = document.getElementById('myModal1');
var modal2 = document.getElementById('myModal2');
var modal3 = document.getElementById('myModal3');
var modal4 = document.getElementById('myModal4');
var roomname= document.getElementById('roomnam');
var url= document.getElementById('roomname4');
// Get the button that opens the modal
var btn1 = document.getElementById("myBtn1");
var btn2 = document.getElementById("myBtn2");
var btn3 = document.getElementById("myBtn3");
var btn4 = document.getElementById("myBtn4");

// Get the <span> element that closes the modal
var span1 = document.getElementsByClassName("close1")[0];
var span2 = document.getElementsByClassName("close2")[0];
var span3 = document.getElementsByClassName("close3")[0];
//var span4 = document.getElementsByClassName("close4")[0];

var nickname=document.getElementById('nickname2');
var user = document.getElementById("user");
user.innerHTML =(getCookie('username'));
// When the user clicks on the button, open the modal 
btn1.onclick = function() {
modal1.style.display = "block";
modal2.style.display = "none";
modal3.style.display = "none";
nickname2.value=getCookie('username');
}

btn2.onclick = function() {
modal2.style.display = "block";
modal3.style.display = "none";
modal1.style.display = "none";
nickname2.value=getCookie('username');
}

btn3.onclick = function() {
    modal3.style.display = "block";
modal1.style.display = "none";
modal2.style.display = "none";
console.log(roomname3);
roomname.value=roomname3;
}
function download(c, filename) {

    /// create an "off-screen" anchor tag
    var lnk = document.createElement('a'),
        e;

    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    lnk.href = c.toDataURL();

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {

        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0, false, false, false,
                         false, 0, null);

        lnk.dispatchEvent(e);

    } else if (lnk.fireEvent) {

        lnk.fireEvent("onclick");
    }
}


btn4.onclick = function() {
download(canvas,roomname3+'.png');
}

// When the user clicks on <span> (x), close the modal
span1.onclick = function() {
    modal1.style.display = "none";
}
span2.onclick = function() {
    modal2.style.display = "none";
}
span3.onclick = function() {
    modal3.style.display = "none";
}

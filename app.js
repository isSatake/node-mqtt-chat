var fs = require('fs'),
//MQTTサーバユーザ情報
user = require('./user'),
//MQTTサーバ接続
mqtt = require('mqtt').connect('tcp://'+user.username+':'+user.password+'@free.mqtt.shiguredo.jp:1883'),
//デフォルトでsubscribeするトピック
default_topic = '/' + user.username + '/',
//後からトピックを指定する用
topic,
//webサーバ
server = require('http').createServer(function(req, res){
	res.writeHead(200, {"Content-Type":"text/html"});
	var output = fs.readFileSync('./index.html', 'utf-8');
	res.end(output);
}).listen(3000);
//socketio
io = require('socket.io').listen(server);

//受信
mqtt.subscribe(default_topic);

io.sockets.on('connection', function(socket){
	//送信
	socket.on('publish', function(data){
		io.sockets.emit('publish', data);
		mqtt.publish(default_topic + topic, data);	
		console.log("pub : " + data);
	});
	//トピック変更
	socket.on('select', function(data){
		topic = data;
		mqtt.subscribe(default_topic + topic);
		console.log('subscribe: ' + data);
	});
});

//受信
mqtt.on('message', function(topic, data){
	io.sockets.emit('subscribe', {t:topic,m:data});
	console.log("sub : " + data);
});

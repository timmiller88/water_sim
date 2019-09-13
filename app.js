
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

var port = process.env.PORT || 8080;

app.set("view engine", "ejs")
app.use(express.static("public"));


app.get('/', function(req,res){
   // res.send('main')
    res.render('main');
})

http.listen(port, function(){
   console.log('listening on *:' + port);
});

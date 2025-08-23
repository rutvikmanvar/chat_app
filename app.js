require('dotenv').config();
const path = require('path')
const PORT = process.env.PORT || 3000;
var mongoose = require('mongoose')
// mongoose.connect('mongodb://127.0.0.1:27017/chat_app')

mongoose.connect(process.env.MONGO_URL),{
          useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,  // Force SSL
    tlsAllowInvalidCertificates: true 
    }
console.log("Connected to:", process.env.MONGO_URL);

const express = require('express')
const app = express()
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute')

const User = require('./models/userModel')
const Chat = require('./models/chatModel')

app.use('/',userRoute)

const io = require('socket.io')(http);

const userNameSpace = io.of('/user-namespace')

userNameSpace.on('connection',async function(socket){
    console.log('User connected');
    console.log(`user id = ${socket.handshake.query.token}`)

    var userId = socket.handshake.query.token;

    await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}})

    //user broadcast online status
    socket.broadcast.emit('getOnlineUser',{user_id:userId})

    socket.on('disconnect',async function(){
        console.log('User disconnected');
        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}})

        //user broadcast offline status
        socket.broadcast.emit('getOfflineUser',{user_id:userId})
    });

    //chating implementation

    socket.on('newChat',function(data){
        socket.broadcast.emit('loadNewChat',data);
    })

    //load old chat
    socket.on('existsChat',async function(data){
        var chats = await Chat.find({
            $or:[
                {sender_id:data.sender_id,receiver_id:data.receiver_id},
                {sender_id:data.receiver_id,receiver_id:data.sender_id},
            ]
        });

        socket.emit('loadChats',{chats:chats});
    });

    //delete chat
    socket.on('chatDeleted',function(id){
        socket.broadcast.emit('chatMessageDeleted',id);
    });

});

http.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})
require('dotenv').config;
const express = require('express');
const user_route = express()

const bodyParser = require('body-parser');
const session = require('express-session')
const {SESSION_SECRET} = process.env;
user_route.use(session({secret:'Rutvik.7118',resave: false,
    saveUninitialized: false}))


user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.use(express.static('public'));

const path = require('path')
const multer = require('multer')
const userController = require('../controllers/userController')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function(req,file,cb){
        const name = Date.now() + '_' + file.originalname;
        cb(null,name)
    }
})

const upload = multer({
    storage:storage
});

user_route.get('/register',userController.registerLoad)
user_route.post('/register', upload.single('image') ,userController.register)

user_route.get('/',userController.loadLogin)
user_route.post('/',userController.login)

user_route.get('/logout',userController.logout)

user_route.get('/dashboard',userController.loadDashboard)

user_route.post('/save-chat',userController.saveChat)
user_route.post('/delete-chat',userController.deleteChat)
user_route.post('/update-chat',userController.updateChat)
user_route.post('/get-chats',userController.getChats)

user_route.get('/groups',userController.loadGroups)
user_route.post('/groups',upload.single('image'),userController.createGroup)

user_route.post('/get-members',userController.getMembers)
user_route.post('/add-members',userController.addMembers)

user_route.post('/update-chat-group',upload.single('image'),userController.updateChatGroup)
user_route.post('/delete-chat-group',userController.deleteChatGroup)

user_route.get('/share-group/:id',userController.shareGroup)
user_route.post('/join-group',userController.joinGroup)

user_route.get('/group-chat',userController.groupChat)

user_route.post('/group-chat-save',userController.saveGroupChat)
user_route.post('/load-group-chat',userController.loadGroupChat)
user_route.post('/delete-group-chat',userController.deleteGroupChat)
user_route.post('/update-group-chat',userController.updateGroupChat)

module.exports = user_route; 
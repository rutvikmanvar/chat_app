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


module.exports = user_route;
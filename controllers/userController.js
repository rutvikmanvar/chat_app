const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const bcrypt = require('bcrypt')

const registerLoad = async(req,res) => {
    try {
        
    } catch (error) {
        
    }
}

const register = async(req,res) => {
    try {
        const passwordHash = await bcrypt.hash(req.body.password,10);  
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            image:'images/'+req.file.filename,
            password:passwordHash
        });

        await user.save();

        return res.json({
            success:true,
            message:"User created successfully",
        })

    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res) => {
    try {
        
    } catch (error) {
        
    }
}

const login = async(req,res) => {
    try {
       const email = req.body.email;
       const password = req.body.password;
       const userData = await User.findOne({email:email})
       if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            console.log(`passwordMatch = ${passwordMatch}`)
            if(passwordMatch){
                req.session.user = userData;
                return res.json({
                    success:true,
                    message:'Login success'
                })
            }
            else{
                return res.json({
                    success:false,
                    message:'Email or Password is Incorrect'
                });
            }
       }
       else{
        return res.json({
            success:false,
            message:'Email or Password is Incorrect'
        });
       }

    } catch (error) {
        
    }
}

const logout = async(req,res) => {
    try {
        req.session.destroy();
        return res.json({
            success:true,
            message:'User Logged out'
        })
    } catch (error) {
        
    }
}

const loadDashboard = async(req,res) => {
    try {
        const users = await User.find();
        return res.json({
            success:true,
            user:req.session.user,
            users:users
        })
    } catch (error) {
        
    }
}

const saveChat = async(req,res) => {
    try {
        var chat = new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message
        });

        await chat.save();
        res.status(200).send({
            success:true,
            message:'Chat saved'
        })

    } catch (error) {
        res.status(400).send({success:false,message:error.message})
    }
}

const deleteChat = async(req,res) => {
    try {
        await Chat.deleteOne({_id:req.body.id});
        res.status(200).send({success:true,message:'Message deleted...'});
    } catch (error) {
        res.status(400).send({success:false,message:error.message})
    }
}

const updateChat = async(req,res) => {
    try {
        await Chat.findByIdAndUpdate({_id:req.body.id},{
            $set:{
                message:req.body.message
            }
        });
        res.status(200).send({success:true,message:'Message updated...'});
    } catch (error) {
        res.status(400).send({success:false,message:error.message})
    }
}

module.exports = {
    register,
    registerLoad,
    login,
    loadLogin,
    logout,
    loadDashboard,
    saveChat,
    deleteChat,
    updateChat,
}
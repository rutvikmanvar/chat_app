const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const Group = require('../models/groupModel')
const Member = require('../models/memberModel')
const GroupChat = require('../models/groupChatModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

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
        const users = await User.find({_id:{ $nin :[req.session.user._id]}});
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

// Example Express route
const getChats = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.body;

        const chats = await Chat.find({
            $or: [
                { sender_id, receiver_id },
                { sender_id: receiver_id, receiver_id: sender_id }
            ]
        }).sort({ createdAt: 1 }); // oldest → newest

        res.status(200).send({ success: true, chats });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const loadGroups = async(req,res) => {
    try {
        const groups = await Group.find({creator_id:req.session.user._id});
        return res.json({success:true,groups})
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const createGroup = async(req,res) => {
    try {
        const group = new Group({
            creator_id:req.session.user._id,
            name:req.body.name,
            image:'images/'+req.file.filename,
            limit:req.body.limit
        })
        await group.save();
        return res.json({
            success:true,
            message:req.body.name+' group created successfuly'
        })
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const getMembers = async(req,res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup:{
                    from:'members',
                    localField:'_id',
                    foreignField:'user_id',
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:['$group_id',new mongoose.Types.ObjectId(req.body.group_id)]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as:'member'
                }
            },
            {
                $match:{
                    '_id':{
                        $nin:[new mongoose.Types.ObjectId(req.session.user._id)]
                    }
                }
            }
        ]);
        return res.json({success:true,data:users})
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const addMembers = async(req,res) => {
    try {
        if(!req.body.members){
            return res.json({success:false,message:'Please select atleast one member'});
        }
        else if(req.body.members.length > parseInt(req.body.limit)){
            return res.json({success:false,message:'You can\'t add more members then limit, limit'});
        } 
        else{
            await Member.deleteMany({group_id:req.body.group_id});
            var data = [];
            const members = req.body.members;
            for(let i = 0; i < members.length; i++){
                data.push({
                    group_id:req.body.group_id,
                    user_id:members[i]
                });
                console.log(`data = ${data}`)
                
            }
            await Member.insertMany(data);
            return res.json({success:true,message: 'Members added succesfully' });
        }
        
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const updateChatGroup = async(req,res) => {
    try {
        const group = await Group.findById(req.body.group_id);
        console.log(`limit = ${group.limit}`)
        console.log(`image = ${req.file}`)
        console.log(`name = ${req.body.name}`)
        console.log(`limit = ${req.body.limit}`)
        console.log(`group_id = ${req.body.group_id}`)

        var updateObj;
        if(parseInt(req.body.limit) < group.limit){
            return res.json({success:false,message:'Limit not less then previous limit'})
        } 
        else if(req.body.limit != null && req.body.name != null){
            updateObj = {
                name:req.body.name,
                image: 'images/'+req.file.filename,
                limit: req.body.limit
            }
            console.log(`insert image = ${req.file.filename}`)
            await Group.findByIdAndUpdate({_id:req.body.group_id},
            {
                $set:updateObj
            }
            );
            return res.json({success:true,message:'Group updated'})
        }
        else {
            updateObj = {
                name: req.body.name,
                limit: req.body.limit
            }
            console.log(`not insert image = ${req.file.filename}`)
            await Group.findByIdAndUpdate({_id:req.body.group_id},
            {
                $set:updateObj
            }
            );
            return res.json({success:true,message:'Group updated'})
        }
        
        

    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const deleteChatGroup = async(req,res) => {
    try {
       await Group.deleteOne({_id:req.body.id});
       await Member.deleteMany({group_id:req.body.id})
       return res.json({success:true,message:'Group Deleted Successfuly'})
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const shareGroup = async(req,res) => {
    try {
       var groupData = await Group.findOne({_id:req.params.id});
       if(!groupData){
        return res.json({success:false,message:'This group is not exist'})
       }
       else if(req.session.user == undefined){
        return res.json({success:false,message:'You need to login first'})
       }
       else{
        var totalMembers = await Member.countDocuments({group_id:req.params.id});
        var availableSlots = parseInt(groupData.limit) - parseInt(totalMembers);
        var isOwner = groupData.creator_id == req.session.user._id?true:false;
        var isAlreadyJoined = await Member.countDocuments({group_id:req.params.id,user_id:req.session.user._id});

        console.log(`totalMembers = ${totalMembers}`);
        console.log(`availableSlots = ${availableSlots}`);
        console.log(`isOwner = ${isOwner}`);
        console.log(`isAlreadyJoined = ${isAlreadyJoined}`);

        return res.json({success:true,totalMembers,availableSlots,isOwner,isAlreadyJoined})
       }
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const joinGroup = async(req,res) => {
    try {

        const member = new Member({
            group_id:req.body.group_id,
            user_id:req.session.user._id
        })

        await member.save();

       return res.json({success:true,message:'You have joined the group succefuly...'})
    } catch (error) {
        res.status(400).send({success:false,message: error.message})
    }
}

const groupChat = async(req,res) => {
    try{
        const myGrops = await Group.find({creator_id:req.session.user._id});
        const joinedGroups = await Member.find({user_id:req.session.user._id}).populate('group_id')

        console.log(`myGrops = ${myGrops}`);
        console.log(`joinedGroups = ${joinedGroups}`);

        return res.json({success:true,myGrops,joinGroup})
    }
    catch(error){
        res.status(400).send({success:false,message:error.message})
    }
}

const saveGroupChat = async(req,res) => {
    try {
        var chat = new GroupChat({
            sender_id:req.body.sender_id,
            group_id:req.body.group_id,
            message:req.body.message
        });

        var newChat = await chat.save();
        res.status(200).send({
            success:true,
            message:'Chat saved',
            chat:newChat 
        })

    } catch (error) {
        res.status(400).send({success:false,message:error.message})
    }
}

const loadGroupChat = async(req,res) => {
     try {
        const groupChats = await GroupChat.find({group_id: req.body.group_id}).populate('sender_id');
        return res.json({success:true,chats:groupChats})
    } catch (error) {
        res.status(400).send({success:false,message:error.message})
    }
}

const deleteGroupChat = async(req,res) => {
    try {
        await GroupChat.deleteOne({_id:req.body.id});
        return res.json({success:true,message:'Message Deleted'})
    } catch (error) {
        res.status(400).send({success:false,message:error.message});
    }
}

const updateGroupChat = async(req,res) => {
    try {
        await GroupChat.findByIdAndUpdate({_id:req.body.id},
            {
                $set:{
                    message:req.body.message
                }
            }
        );
        return res.json({success:true,message:'Message Updated'})
    } catch (error) {
        res.status(400).send({success:false,message:error.message});
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
    getChats,
    loadGroups,
    createGroup,
    getMembers,
    addMembers,
    updateChatGroup,
    deleteChatGroup,
    shareGroup, 
    joinGroup,
    groupChat,
    saveGroupChat,
    loadGroupChat,
    deleteGroupChat,
    updateGroupChat,
}
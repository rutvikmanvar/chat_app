const mongoose = require('mongoose')

const groupChatSchema = mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    group_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Group'
    },
    message:{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
);

const GroupChat = mongoose.model('GroupChat',groupChatSchema)
module.exports = GroupChat;
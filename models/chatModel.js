const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
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

const Chat = mongoose.model('Chat',chatSchema)
module.exports = Chat;
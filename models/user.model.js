const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');



const userSchema = mongoose.Schema({
    username: String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
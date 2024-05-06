const mongoose= require ("mongoose");

mongoose.connect("mongodb+srv://test:NFORCahC6lYCwlh5@cluster0.n6zmhf6.mongodb.net/paytm")

const userSchema=mongoose.schema({
    username : { 
        type:String,
        requried:true,
        unique:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLenght:30
},

    firstName: {
            type:String,
        requried:true,
        trim:true,
        maxLenght:50
    },
        lastName : {
            type:String,
            requried:true,
            trim:true,
            maxLenght:50},

    password:{
        type:String,
        requried:true,
        minLength:6
}

});
const User =mongoose.model("User",userSchema)
module.exports ={
    User
};
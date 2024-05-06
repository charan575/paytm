const express = require('express');
const { authMiddleware } = require("../middleware")
const router = express.Router();
const z = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");


const signupBody= z.object({
    username:z.string().email(),
    firstName:z.string(),
    lastName:z.string(),
    password:z.string().min(6),
});
router.post("/signup",async(req,res)=>{
    const{success} = signupBody.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message:"Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username:req.body.username
    })
    if (existingUser){
        return res.status(411).json({
            message:"Email already taken / Incorrect inputs"
        })
    }
    const user = await User.create({
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
    })
        const userId = user._id;
        const token = jwt.sign({
            userId
        },JWT_SECRET);
            res.json({
                message:"user created successfully",
                token:token

            })

    })
const signinBody = z.object({
    username:z.string().email(),
    password:z.string()
})
router.post("/signin",async(req,res)=>{
    const {success}=signinBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message:"Email already taken / Incorrect inputs"
        })
    
    }
    const user = await User.findOne({
        username:req.body.username,
        password:req.body.password
    });

    if (user){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET);
        res.json({
            token:token
        })
        return;
    }
    res.status(411).json({
        message:"Error while logging in"
    })
})

const updateBody=z.object({
    password:z.string().optional(),
    firstName:z.string().optional(),
    lastName:z.string().optional(),
}).refine((data)=>{
    const keys = Object.keys(data);
    if (keys.length === 0) {
        throw new Error("At least one field nust be provided");
    }
    return data;
});

router.put("/" , authMiddleware, async(req,res) =>{
    const {success,error} = updateBody.safePaese(req.body);
    if (!success) {
        res.status(411).json({
            message:error.message
        });
        return;
    }
    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404).json({
            message:"User not found"
        });
        return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId,req,body,{new:true});
    res.json({
        message:"Updated successfully",
        user:updatedUser
    });
});
router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        }]
    })
    res.json({
        user:users.map(user=>({
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})

module.exports = router;
var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");
var jwt =  require("jsonwebtoken");
var projectModel = require("../models/projectModel");
var userModel = require('../models/userModel')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const secret = "secret"; // secret key for jwt

router.post("/signUp", async(req,res)=>{
  let {username,name,email,password} = req.body;
  let emailCon = await userModel.findOne({email:email});
  if(emailCon){
   return res.json({success:false,message:"Email already exists"});
  }
  else{

     bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
          let user = userModel.create({
      username:username,
      name:name,
      email:email,
      password:hash
    });

    return res.json({success:true,message:"User created successfully"});
      });

     });  
   
    
  }

});

router.post("/login",async(req,res)=>{
  let {email,password} = req.body;
  let user = await userModel.findOne({email:email});
  if(user){
  bcrypt.compare(password,user.password,function(err,isMatch){
   if(isMatch){
    let token = jwt.sign({ email: user.email, userId: user._id }, secret);
    return  res.json({success:true,message:"User logged in successfully",token:token,userId:user._id});
   }
   else{
   return res.json({success:false,message:"Invalid email or password"});
   }
  });
}
else{
   return res.json({success:false,message:"User not found ! "});
}

});

router.post("/getUserDetails",async(req,res)=>{
  let {userId} = req.body;
  let user = await userModel.findOne({_id: userId });
 if (user) {
    return res.json({ success: true, message: "User details fetched successfully", user: user });
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/createproject",async (req,res)=>{
  let {userId, title} = req.body;
  let user = await userModel.findOne({_id:userId});
 if (user) {
    let project = await projectModel.create({
      title: title,
      createdBy: userId
    });


   
     return res.json({ success: true, message: "Project created successfully", projectId: project._id });
  }
  else {
    return res.json({ success: false, message: "User not found!" });
  }
  });

router.post("/getProjects", async (req, res) => {
  let {userId} = req.body;
  let user = await userModel.findOne({ _id: userId });
  if (user) {
    let projects = await projectModel.find({ createdBy: userId });
    return res.json({ success: true, message: "Project fetched successfully", projects: projects });
  }
  else{
    return res.json({ success: false, message: "User not found!" });
  }
});

router.post("/deleteProject",async (req,res)=>{
  let{userId,progId}=req.body;
  let user = await userModel.findOne({_id:userId});
  if (user) {
    let project = await projectModel.findOneAndDelete({ _id: progId });
    return res.json({ success: true, message: "Project deleted successfully" });
  }
  else {
    return res.json({ success: false, message: "User not found!" });
  }
});

// router.post("/getProject", async (req, res) => {
//   let {userId,projId} = req.body;
//   let user = await userModel.findOne({ _id: userId });
//   if (user) {
//     let project = await projectModel.findOne({ _id: projId });
//     return res.json({ success: true, message: "Project fetched successfully", project: project });
//   }
//   else{
//     return res.json({ success: false, message: "User not found!" });
//   }
// });



router.post("/getProject", async (req, res) =>{
  let { userId, projId} = req.body;

  const user = await userModel.findOne({_id: userId})
  try {
    if(user){
    const project = await projectModel.findOne({_id : projId});

    return res.json({
      success: true,
      message:"Project Fetch sucessfully",
      project: project
    });
    }else{
      return res.json({
        success: false,
        message: "Could't Fetch Project"
      })
    } 
  } catch (error) {
    console.error("Not able to fetch project", error)
    return res.status(500).json({
      success: false,
      message:"Sever Error",
      
    })
  }
  
})



// router.post("/getProject", async (req, res) => {
//   let { userId, projId } = req.body;
//   console.log("Received userId:", userId);
//   console.log("Received projId:", projId);

//   try {
//     let user = await  userModel.findOne({ _id: userId });
//     console.log("User found?", user);

//     if (user) {
//       let project = await projectModel.findOne({ _id: projId });
//       return res.json({ success: true, message: "Project fetched successfully", project });
//     } else {
//       return res.json({ success: false, message: "User not found!" });
//     }
//   } catch (err) {
//     console.error("Error in /getProject:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });


router.post("/updateProject", async (req, res) => {
  let { userId, htmlCode, cssCode, jsCode, projId } = req.body;
  let user = await userModel.findOne({ _id: userId });

  if (user) {
    let project = await projectModel.findOneAndUpdate(
      { _id: projId },
      { htmlCode: htmlCode, cssCode: cssCode, jsCode: jsCode },
      { new: true } // This option returns the updated document
    );

    if (project) {
      return res.json({ success: true, message: "Project updated successfully" });
    } else {
      return res.json({ success: false, message: "Project not found!" });
    }
  } else {
    return res.json({ success: false, message: "User not found!" });
  }
});



module.exports = router;

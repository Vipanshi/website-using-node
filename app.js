var express=require('express');
var bodyParser=require('body-parser');
var mongoose = require('mongoose');

var bcrypt=require('bcryptjs');
var expressvalidator=require('express-validator');


var app=express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressvalidator());

//port address
var port=3000;

 
// view engine
app.set('view engine','pug');


//database connection
mongoose.connect("mongodb://localhost:27017/persons",{ useNewUrlParser: true });//creating or joining to practice database

nacho=false;
// creating schema
var nameSchema = new mongoose.Schema({
    id:Number,
    Date:String,
    Line:String,
    Section:String,
    StationName:String,
    StationShortName:String,
    SystemName:String,
    SubSystemName:String,
    Equipmentno:Number,
    EquipmentID:Number,
    Gate_type:String,
    FailureT:String,
    FailureD:String,
    SubEquipment:String,
    R_UR:String,
    RectificationT:{type:String,default:" "},
    RectificationD:{type:String,default:" "},
    Duration:{type:Number,default:0},
    RectificationDetails:{type:String,default:" "},
    Origin:String,
    ReportingPerson:String,
    AttendingPerson:{type:String,default:" "}


    
   });
var User = mongoose.model("User", nameSchema);

//creating registration schema
var UserSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    password2:String


});
var Member=mongoose.model("Member",UserSchema);


app.listen(port,function(){
    console.log("server"+port);
    
});

app.get("/",function(req,res){
    res.render('front');

});



//register process
app.post('/register',function(req,res){
    var name=req.body.name;
    var email=req.body.email;
    var password=req.body.password;
    var password2=req.body.password2;
   
    
   //validation of registration form
   
   
     
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','E-mail is required').notEmpty();
    req.checkBody('email',' Valid E-mail is required').isEmail();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);

    var errors=req.validationErrors();
    if(errors){
        

        res.render('front',{errors:errors});
        
    }
     var username= req.body.name;
    Member.findOne({'name':username},function(err,person)
    {
        if(person)
        res.render('front',{msg1:"User already exist"});
        else{
            var  newmember=new Member({
                name:name,
                email:email,
                password:password
               
              
               
    
            });
            
    
            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(newmember.password,salt,function(err,hash){
                    if(err){
                        console.log(err);
                    }
                    newmember.password=hash;
                    newmember.save(function(err){
                        if(err){
                            console.log(err);
                            return;
                        }
                        else{
                            
                            
                            res.render('front',{success:"successfully registereds"});
                            
                        }
                    })
                })
            } )
    
    
            
    
        }
    });
   

});


//login
app.post('/login',function(req,res){
var name=req.body.name;
    var query={name:name };
 Member.findOne(query,function(err,person){
        if(err)res.status(404);
            if(!person){
                
                res.render('front',{message:'wrong username'});
             }
             else{
               
                bcrypt.compare(req.body.password,person.password,function(err,isMatch){
                    if(err){

                        console.log(err);
                    }
                    if(isMatch){
                        nacho=person;
                        //res.sendFile(__dirname+"/faultform.html");
                        res.redirect('/middle');
                    }else{
                        //console.log(req.body.password);
                         //var msg="Wrong password";
                        res.render('front',{msg:'wrong password'});
                       
        

                           
                         
                    
                    }
                });
             }
    });
});

//middle page
app.get("/middle",function(req,res){
    if(nacho){
    naam=nacho.name;
    var query={'ReportingPerson':naam };
    User.find(query,function(err,middle){
        res.render('middle',{Users:middle})
    });
}
      else{
          res.render('error');
      }

});

app.get("/form",function(req,res){
    if(nacho){
    res.sendFile(__dirname+"/fault.html");
    }
    else
    {
    res.render('error');
    }
});

app.get("/rectform",function(req,res){
    if(nacho){
        res.sendFile(__dirname+"/rectification.html");
        }
        else
        {
        res.render('error');
        }
});


//adding to database
app.post("/end", function(req, res) {
    var myData = new User(req.body);
    myData.save()
        .then(item => {            
            res.redirect('/middle');
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
    console.log(req.body.myData);
    
});




//adding pug file and getting data
app.get('/info', function(req, res){
    if(nacho)
	{User.find({}, function(err, docs){
		if(err) res.json(err);
		else    res.render('layout', {Users: docs});
    });
}
else{
    res.render('error');
}
});

//after submission to rectification
app.post("/nacho",function(req,res){
    var RectificationT=req.body.RectificationT;
    var RectificationD=req.body.RectificationD;
    var RectificationDetails=req.body.RectificationDetails;
    var Duration=req.body.Duration;
    var AttendingPerson=req.body.AttendingPerson;
    
    var name=nacho.name;
    console.log(name);
    var query={ReportingPerson:name};
    var query2={$set:{RectificationT:RectificationT,RectificationD:RectificationD,RectificationDetails:RectificationDetails,Duration:Duration,AttendingPerson:AttendingPerson}};
    User.findOneAndUpdate(query,query2,function(err,person){
      if(err)
      {
          res.redirect('/');
      }
      else{
          console.log("saved");
          res.redirect('/middle');
      }
    });
   
});






    
      

 
    
      


  
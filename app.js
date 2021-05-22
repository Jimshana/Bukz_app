var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");
var app = express();

const userRoute = require("./routes/user.route");
const User = require("./models/user.model");


// App Configs
mongoose.connect("mongodb://localhost/Bukz_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());



app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 999999999,
        rolling: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var bookSchema = mongoose.Schema({
    number:String,
	title: String,
    author:String,
    language:String,
	image: String,
	description: String,
	review: String,
    link:String,
    year:String,
	genre: String,
	rating: String,
	
	
	
	
});

var Book = mongoose.model("Book",bookSchema);
var viewSchema = mongoose.Schema({
    name:String,
	rating: String,
	commenter:String,
	
	
	
});

var View = mongoose.model("View",viewSchema);





app.use("/", userRoute);


app.get("/",function(req,res){
	res.redirect("/books");
});







app.get("/books",function(req,res){
	Book.find({},function(err,books){
		if(err){
			console.log("Error!");
		} else {
			res.render("index",{books:books});
		}
	});
});


app.get("/about",function(req,res){
	View.find({},function(err,about){
		if(err){
			console.log("Error!");
		} else {
			res.render("comment",{about:about});
		}
	});
});


app.get("/books/new",function(req,res){
	res.render("new");
});




app.post("/books",function(req,res){
	req.body.book.title = req.sanitize(req.body.book.title);
	req.body.book.description = req.sanitize(req.body.book.description);
	req.body.book.review = req.sanitize(req.body.book.review);
	Book.create(req.body.book,function(err,newBook){
		if(err){
			res.render("new");
		} else {
			res.redirect("/books");
		}
	});
});

app.get("/books/:id",function(req,res){
	Book.findById(req.params.id,function(err,book){
		if(err){
			res.redirect("/books");
		} else {
			res.render("show",{book:book});
		}
	});
});

app.get("/books/:id/edit",function(req,res){
	Book.findById(req.params.id,function(err,book){
		if(err){
			res.redirect("/books");
		} else {
			res.render("edit",{book:book});
		}
	});
});


app.post("/about",function(req,res){
	req.body.view.name = req.sanitize(req.body.view.name);
	req.body.view.commenter = req.sanitize(req.body.view.commenter);
	
	View.create(req.body.view,function(err,newBook){
		if(err){
			res.render("edit");
		} else {
			res.redirect("/about");
		}
	});
});

app.put("/books/:id",function(req,res){
	req.body.book.title = req.sanitize(req.body.book.title);
	req.body.book.description = req.sanitize(req.body.book.description);
	req.body.book.review = req.sanitize(req.body.book.review);
	Book.findByIdAndUpdate(req.params.id,req.body.book,function(err,updatedBook){
		if(err){
			res.redirect("/books");
		} else {
			res.redirect("/books/" + req.params.id);
		}
	});
});



app.delete("/books/:id",function(req,res){
	Book.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/books");
		} else {
			res.redirect("/books");
		}
	});
});

app.delete("/about/:id",function(req,res){
	View.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/about");
		} else {
			res.redirect("/about");
		}
	});
});
var port = process.env.PORT || 3000;
app.listen(port,process.env.IP,function(){
	console.log("The Book Review App server has started")
})

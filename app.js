var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");
const app = express();
// require("dotenv").config();



const userRoute = require("./routes/user.route");
const User = require("./models/user.model");


// App Configs
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser:true,
	useUnifiedTopology: true
})
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());




app.use(session({
    secret: process.env.SESSION_SECRET,
	secret:"key",
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




function checkAuthenticated(req,res,next){
	let user = req.session.user;
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
    }



app.use("/", userRoute);



app.get("/",function(req,res){
	res.redirect("/books");
});




app.get("/books/new",checkAuthenticated,(req,res)=>{	
	res.render("new");		
});


app.get("/books",checkAuthenticated,async (req,res)=>{
	let books = [];
		if(req.query.search !==null && req.query.search !==""){
			const reg=new RegExp(req.query.search,"i");
			console.log(req.query.category);			
			if(req.query.category  && req.query.category !=="All"){
			books= await Book.find({[req.query.category.toLowerCase()]:reg});
		}else{
			books=await Book.find({		
				$or:[
					{ title:reg },
					{ genre:reg },
					{ author:reg },
					{ language:reg }
				],
			});
		}
		let user=req.session.user;
		res.render("index",{
			books:books,
			user:user,
			searchOptions:req.query,

		});
	}else{
		res.redirect("/books");
	}
	});
	




app.get("/about",checkAuthenticated,(req,res)=>{
	View.find({},function(err,about){
		if(err){
			console.log("Error!");
		} else {
			res.render("comment",{about:about});
		}
	});
});



app.get("/search",function(req,res){
	res.render("search");
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



app.get("/books/:id",checkAuthenticated,(req,res)=>{
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


app.delete("/books/:id",checkAuthenticated,(req,res)=>{
	Book.findByIdAndRemove(req.params.id,function(err){
		const user = req.session.user
		if(!user){ return res.redirect('/books')}
	});
});








app.listen(process.env.PORT || 3000)

var express    = require('express');
var app = express();
var bodyParser  = require('body-parser');
var methodOverride = require('method-override');
// var nodemailer = require('./nodemailer.js');

//setting
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

// Routes
app.use("/", require("./routes/home"));

//Port setting
app.listen(3002, function(){
    console.log("server on! port 3002");
});

app.get('/login', (req, res) => {
    res.render('home/login'); // login.ejs 랜더링
});

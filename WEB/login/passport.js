const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const crypto = require('crypto');

exports.setup = function() {
	passport.use(new LocalStrategy({
		usernameField: 'id',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, id, password, done){
		const salt = 'cssproject_salt!';
		let hashedpw = crypto.createHash('sha256').update(password+salt).digest('hex');
		
		if(id === // 'login_id' 
			&& hashedpw === // 'password_hash_value'
			){ 
			var user = {name: 'CSS', sign: 'key_css'};
			return done(null, user);
		} else {
			return done(null, false);
		}
	}));
};

exports.serial = function() {
	passport.serializeUser(function(user, done){
		console.log("serializeUser");
		done(null, user);
	});
};

exports.deserial = function() {
	passport.deserializeUser(function(user, done){
		console.log("deserializeUser");
		done(null, user);
	});
};

exports.keySession = session({
		secret: 'secret KEY',
		resave: true,
		saveUninitialized: true
});

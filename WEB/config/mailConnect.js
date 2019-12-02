//create getConection for the mail_db 
var mysql = require('mysql');

module.exports = function(){
	var pool = mysql.createPool(
    {
    	host: 'localhost',
    	user: 'adminmail',
   	 	password: 'lab716mail',
    	database: 'mail_db',
    	port: '3306'
    });

    return {
    	getConnection: function(callback){
    		pool.getConnection(callback);
    	},
    	end : function(callback){
    		pool.end(callback);
    	}
    }
}();
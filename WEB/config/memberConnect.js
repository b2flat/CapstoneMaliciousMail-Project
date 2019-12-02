//create getConection for the member_db 
var mysql = require('mysql');

module.exports = function(){
	var pool = mysql.createPool(
    {
        /* example

    	host: 'localhost',
        user: 'usermember',
        password: 'passwordmember',
    	database: 'database_member',
        port: 'port number'

        */
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
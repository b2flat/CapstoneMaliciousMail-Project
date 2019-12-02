//create getConection for the save_db 
var mysql = require('mysql');

module.exports = function(){
	var pool = mysql.createPool(
    {
        /* example

    	host: 'localhost',
        user: 'usersave',
        password: 'passwordsave',
        database: 'database_save',
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
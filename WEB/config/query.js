//SQL query interface
exports.select_query = function(conn, values, table, condition){
	var pool = require('./'+conn);
	var query = "";

	if(condition)
        query = "SELECT " + values + " FROM " + table + " WHERE " + condition;
    else
        query = "SELECT " + values + " FROM " + table;
    
    return{
    	select: function(callback){
    		pool.getConnection(function(err, con){
    			con.query(query, function(err, result, fields){
    				con.release();
    				if(err) return callback(err);
    				callback(null, result);
    			});
    		});
    	},
    	pool: pool
    }
};

//Create training table.
exports.create_query = function(conn, values, table){
    var pool = require('./'+conn);
    var query = "";

    query = "CREATE TABLE " + table + " ( ";
    for(var i=0; i < values.length; i++){
        query += values[i]+" VARCHAR(100) NOT NULL, ";
    }
    query += "e_mail_address VARCHAR(40) NOT NULL, ";
    query += "ip_address VARCHAR(40), ";
    query += "com_name VARCHAR(100), ";
    query += "method VARCHAR(40), ";
    query += "method_con TINYINT(1) DEFAULT '0', ";
    query += "confirm TINYINT(1) DEFAULT '0', ";
    query += "CONSTRAINT email_pk PRIMARY KEY(e_mail_address) )";

    return{
        create: function(callback){
            pool.getConnection(function(err, con){
                con.query(query, function(err, result, fields){
                    con.release();
                    if(err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};

exports.insert_query = function(conn, values, table){
    var pool = require('./'+conn);
    var query = "";
    if(values.length == 5){
        query = "INSERT INTO "+table+" VALUES('"+values[0]+"', '"+values[1]+"', '"+values[2]+"', '"+values[3]+"', '"+values[4]+"')";
    }else{
        query = "INSERT INTO "+table+" VALUES("+values+")";
    }
    
    return{
        insert: function(callback){
            pool.getConnection(function(err, con){
                con.query(query, function(err, result, fields){
                    con.release();
                    if(err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};

exports.drop_query = function(conn, table){
    var pool = require('./'+conn);
    var query = "";

    query = "DROP TABLE " + table;
    
    return{
        drop: function(callback){
            pool.getConnection(function(err, con){
                con.query(query, function(err, result, fields){
                    con.release();
                    if(err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};

exports.update_query = function(conn, table, values, condition){
    var pool = require('./'+conn);
    var query = "";

    query = "UPDATE " + table + " set " + values + " WHERE " + condition;
    
    return{
        update: function(callback){
            pool.getConnection(function(err, con){
                con.query(query, function(err, result, fields){
                    con.release();
                    if(err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};

exports.delete_query = function(conn, table, condition){
    var pool = require('./'+conn);
    var query = "";

    query = "DELETE FROM " + table + " WHERE " + condition;
    
    return{
        delete: function(callback){
            pool.getConnection(function(err, con){
                con.query(query, function(err, result, fields){
                    con.release();
                    if(err) return callback(err);
                    callback(null, result);
                });
            });
        },
        pool: pool
    }
};
var express = require('express');
var passport = require('passport');
var app = express();
var sql = require('../config/query.js');
var async = require('async');
var base64 = require('base-64');
var moment = require('moment');
var nodemailer = require('../nodemailer.js');
var fs = require('fs');

app.use(require('../login/passport').keySession);
app.use(passport.initialize());
app.use(passport.session());

require('../login/passport').setup();
require('../login/passport').serial();
require('../login/passport').deserial();

//login Session check
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

//Pop-up window on failure
app.get('/pop', ensureAuthenticated, function(req, res){
    res.send('<script>alert("훈련실패!!!!!"); document.location.href= "/welcome";</script>');
});
app.get('/pop2', ensureAuthenticated, function(req, res){
    res.send('<script>alert("로딩실패!!!!!"); document.location.href= "/welcome";</script>');
});

//login id, password check
app.post('/login', function(req, res, next){
    var id = req.body.id;
    var pw = req.body.password;

    if (!id || !pw){
        res.redirect("/login");
    } else{
        next();
    } //If id or password is blank, redirect to login-page.
  },
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), //password 검증
  function(req, res){
    res.redirect('/welcome');
});

app.get('/', ensureAuthenticated, function(req, res){
    res.redirect('/welcome');
});

app.get('/welcome', ensureAuthenticated, function(req, res){
    //List of people who have not watched videos.
    var noList = sql.select_query('saveConnect', 'name, b.e_mail_address', 'member_db.css_member a join save_db.auth_confirm b', 'a.e_mail_address = b.e_mail_address');

    noList.select(function(err, data){
        if(err){
            console.log('welcom error');
            res.render('home/welcome', {noName: ""});
        }else{
            if(data==''){
                res.render('home/welcome', {noName: ""});
            }else{
                res.render('home/welcome', {noName: data});
            }
        }
    });
});

//Remove selected person from above list.
app.post('/welcome', ensureAuthenticated, function(req, res){
    var chList = req.body.chList;

    if(!chList)
        res.redirect('/welcome');

    var delValue = "";
    for(var i=0; i<(chList.length-1); i++)
        delValue += '"'+chList[i]+'", ';
    delValue += '"'+chList[chList.length-1] +'"';

    var del = sql.delete_query('saveConnect', 'auth_confirm', 'e_mail_address in ('+ delValue+')');

    del.delete(function(err, data){
        if(err){
            console.log('welcom delete error');
        }else{
            console.log('welcom delete complete');
        }
        res.redirect('/welcome');
    });
});

//Various training results graph to help analysis.
app.get('/report', ensureAuthenticated, function(req, res) {

  function load_table_name(callback) {

    var name = req.query.metatable;
    if (name) { // If webpage sends name of table..
      table_name = name;
      table_name = "`" + table_name + "`";
      callback(table_name);
    } else { // User access to report-page first time, there is no selected name. So, default value of table-name is loaded.
      var project_name_data = sql.select_query('saveConnect', '*', 'metatable ORDER BY start2 DESC', false);
      project_name_data.select(function(err, project_data) {
        if (err) {
          res.render('home/report');
        } else {
          if (project_data != '') {
            table_name = project_data[0];
            table_name = table_name['name'];

            table_name = "`" + table_name + "`";
            callback(table_name);
          } else {
            res.render('home/report', {
              dataArr: "",
              project: "",
              tableArr: "",
              tables: "",
              table: ""
            });
          }
        }
      });
    }
  }

  var next = function rendering(table_name) {
    var table_data = sql.select_query('saveConnect', '*', 'metatable ORDER BY start2 DESC', false);
    table_data.select(function(err, name_data) {
      var condition = "name like '%\\_1' order by start desc limit 5";
      var metafive = sql.select_query('saveConnect', '*', 'metatable', condition);

      metafive.select(function(err, data) {
        if (err) {
          console.log('five select error');
          res.redirect('/pop2');
        }

        var dataArray = []; //The array in which the table's data objects are stored.
        var tableArray = new Array(); //The array in which the table's title is stored.

        // Bring the month and the day
        for (var i = 0; i < data.length; i++)
          tableArray.push(data[i].name.substring(4, 6) + '월 ' + data[i].name.substring(6, 8) + '일' + data[i].name.substring(8, 10));

        //Get the data of each table and save it as an object in an array.
        let a = () => new Promise(async (next) => {
          var j = 0;

          for (var i = 0; i < data.length; i++) {
            await new Promise((next) => {
              sql.select_query('saveConnect', '*', data[i].name, false).select(function(err, tabledata) {
                if (err) {
                  console.log('tabledata error');
                } else {
                  dataArray.push(tabledata);
                  next();
                }
              });
            });
          }

          next();
        });

        var tables = new Array();
        var table_length = table_name.length;
        table_name_use = table_name.slice(1, table_length - 3);

        let b = () => new Promise(async (next) => {

          for (var i = 0; i < name_data.length; i++) { // Loading successive project data from DB and push to the 'tables'
            //if (i == 5) {
            //  break; // Maximum number of table is 5
            //}
            if (name_data[i]['name'].match(table_name_use) == table_name_use) {
              await new Promise((next) => {
                var selected_table = sql.select_query('saveConnect', '*', name_data[i]['name'], false);

                selected_table.select(function(err, table_data) {
                  if (err) {
                    console.log(table_sql_error);
                  } else {
                    tables.push(table_data);
                    next();
                  }
                });
              });
            }
          }
          next();
        });

        async function asyncMain() {
          try {
            await a();
            await b();
            console.log(tables)
            await res.render('home/report', {
              dataArr: dataArray, //Array of table-data
              tableArr: tableArray, //Array of table-name
              tables: tables, // Successive project data from selected project
              table: table_name, // Selected project name
              project: name_data // Name-data of all of project
            });
          } catch (exception) {
            res.redirect('/pop2');
          }
        }

        asyncMain();
      });
    });
  }

  load_table_name(next);
});

//Don't allow POST request
app.post('/mailNow', ensureAuthenticated, function(req, res){
    res.redirect('home/mailNow');
});

//Don't allow GET request
app.get('/process', ensureAuthenticated, function(req, res){
    res.redirect('/welcome');
});

/*
Process training implementation
If the selected values are received, they are used for various tasks. (create table, send mail, ...)
*/
app.post('/process', ensureAuthenticated, function(req, res){
    var obj = JSON.parse(req.body.to);

    if(!obj) res.redirect('/welcome');

    //create data setting
    obj.meta.push(obj.meta[1].split(' ')[0]);
    var tableName = obj.meta[0];

    //The part that determines the table name to be created.
    if(tableName != 'noTrain'){
        var temp = parseInt(tableName.split('_')[2]);
        temp++;
        tableName = tableName.split('_')[0] +'_'+ tableName.split('_')[1] +'_'+ temp;
    }else{
        tableName = obj.meta[4].split(' ')[0];
        tableName = tableName.replace(/\-/g, '');
        tableName += '_1_1';
    }
    obj.meta[0] = tableName;

    var result_make;
    var result_insert;
    var result_drop;
    var insertTable;
    var result_select;

    async function a(){
        var condition = "name like '"+obj.meta[0]+"'";
        if((obj.meta[0].split('_')[1]+obj.meta[0].split('_')[2]) == '11'){
            var condition = "name like '"+obj.meta[0].split('_')[0]+"%' order by name desc limit 1";
        }
        var result_confirmTable = sql.select_query('saveConnect', 'name', 'metatable', condition);
        result_confirmTable.select(async function(err, data){
            if(err){
                console.log('table confirm error');
                res.redirect('/pop');
            }else{
                if(data != ''){
                    var tmp = parseInt(data[0].name.split('_')[1]);
                    tmp++;
                    obj.meta[0] = data[0].name.split('_')[0]+'_'+tmp+'_1';
                }

                result_make = sql.create_query('saveConnect', obj.kind, obj.meta[0]);
                result_insert = sql.insert_query('saveConnect', obj.meta, 'metatable');
                result_drop = sql.drop_query('saveConnect', obj.meta[0]);

                //insert data setting
                var o_kind = '';
                var o_email = "e_mail_address IN ('";
                for(var i=0; i<obj.kind.length; i++){
                    o_kind += obj.kind[i] + ", ";
                }
                o_kind += "e_mail_address";
                for(var i=0; i<obj.email.length; i++){
                    if(i == (obj.email.length-1)){
                        o_email += obj.email[i] + "')";
                    }else{
                        o_email += obj.email[i] + "', '";
                    }
                }

                obj.kind.push('e_mail_address');
                insertTable = obj.meta[0] + "(" + o_kind + ", method)";
                result_select = sql.select_query('memberConnect', o_kind, 'css_member', o_email);
                try{
                    await b();
                    await c();
                    await d();
                    await res.redirect('/mailNow');
                } catch(exception){
                    console.log('throw error : '+exception);
                    res.redirect('/pop');
                }
            }
        });
    }

    //create training table & insert training table name into metatable
    let b = () => new Promise((next) => {
        result_make.create(function(err, data){
            if(err){
                console.log('create error');
                res.redirect('/pop');
            }else{
                result_insert.insert(function(err, data){
                    if(err) {
                        //If insert fails, delete the table
                        result_drop.drop(function(err, data){
                            if(err) console.log('drop error');
                            console.log('insert error');
                            res.redirect('/pop');
                        });
                    }
                    console.log('insert complete');
                });
                console.log('create complete');
                next();
            }
        });
    });

    //Insert basic information of the subjects.
    let c = () => new Promise((next) => {
        result_select.select(function(err, sdata){
            if(err) console.log('select error');
            else {
                var k=0;
                for(var i = 0; i < sdata.length; i++ ){
                    var insertValue = "'";
                    for(var j = 0; j < obj.kind.length; j++){
                        var d = '.' + obj.kind[j];
                        insertValue += eval('sdata[i]'+d) + "', '";
                    }
                    insertValue += obj.mail[2] + "'";

                    var result_insertValue = sql.insert_query('saveConnect', insertValue, insertTable);

                    result_insertValue.insert(function(err, i){
                        if(err){
                            console.log('value insert error');
                        }
                        console.log('value insert complete');
                        k++;
                        if(k==sdata.length){
                            next();
                        }
                    });
                }
            }
        });
    });

    //mail sending part
    let d = () => new Promise((next) =>{
        var maillist = [];
        const from = obj.mail[3];
        const sendto = [];
        const subject = obj.mail[0];

        let attachment = [ ];
        let html = [ ];

        //training filepath ex)C:/Users/.../.../file.txt
        var route = [
            (''),
            ('C:/Users/Wra1th/Desktop/cssProject_v11/files/document_h00k.doc'),
            ('C:/Users/Wra1th/Desktop/cssProject_v11/files/document_2ans0mt.doc'),
            ('C:/Users/Wra1th/Desktop/cssProject_v11/files/document_video.doc'),
        ];
        var sendfilename = [ ];
            for(var i=0; i<obj.email.length; i++) {
                sendfilename.push(base64.encode(obj.email[i]) + '_' + base64.encode(obj.meta[0]));
            }

        const attach = [ ];
        let ath = [ ];

        //training method part
        //each method sending another file
        for (var i=0; i<sendfilename.length;i++) {
            if (obj.mail[2] == 'url') {
                var n = 0;
            }
            else if (obj.mail[2] == 'monitorControl') {
                var n = 1;
            }
            else if (obj.mail[2] == 'ransomware') {
                var n = 2;
            }
            else if (obj.mail[2] == 'video') {
                var n = 3;
            }

            ath = {filename: obj.mail[4] + '_' + sendfilename[i] + '.doc', path: route[n]};
            attach.push(ath);
            attachment[i] = attach[i];
            maillist[i] = obj.email[i];
            sendto[i] = maillist[i];

            const url = '<a href = "http://192.168.0.34:3002/url/' + base64.encode(maillist[i]) + '/' + base64.encode(obj.meta[0]) + '">' + '확인하기</a>';
            //const url = '<a href = "http://serverip/url/' + base64.encode(maillist[i]) + '/' + base64.encode(obj.meta[0]) + '">' + 'check</a>';
            const checkcode = '<img src="http://192.168.0.34:3002/img/' + base64.encode(maillist[i]) + '/' + base64.encode(obj.meta[0]) + '/' + 'mailcheck.png" >';
            //const checkcode = '<img src="http://serverip/img/' + base64.encode(maillist[i]) + '/' + base64.encode(obj.meta[0]) + '/' + 'mailcheck.png" >';

            if (obj.mail[2] == 'url') {
                //url method send to url check code
                html.push(obj.mail[1] + '<p>' + url + '</p>' + checkcode);
                attachment = '';
            } else {
                html.push(obj.mail[1] + checkcode);
            }

            if (obj.mail[2] == 'video') {
                //video method
                //Save the training person to the server
                var result_authconfirm = sql.insert_query('saveConnect', "'" + obj.email[i] + "'", 'auth_confirm');
                result_authconfirm.insert(function (err, data) {
                    if (err) {
                        console.log('This is the email address already entered.');
                    }
                    else {
                        console.log('insert success : ' + obj.email[i]);
                    }
                });
            }
        }
            const mailOptions = {
                from,
                subject
            };

        nodemailer.sending(maillist, mailOptions, attachment, sendto, html); //data send to nodemailer.js
        next();
    });

    a();
});

//Set up training (subjects, contents, title, term, ...)
app.get('/sendmail', ensureAuthenticated, function(req, res){
    //Get the required data.
    //In a column name, '이름' must be 'name', '이메일' must be 'e_mail_address'.
    var result_member = sql.select_query('memberConnect', '*', 'css_member', false);
    var result_meta = sql.select_query('saveConnect', 'name, title, start2', 'metatable order by name desc, start desc', false);
    var result_mail = sql.select_query('mailConnect', '*', 'contents', false);


    result_member.select(function(err, data){
        if(err) {
            res.redirect('/welcome');
        } else {
            result_meta.select(function(err, meta_data){
                if(err){ res.redirect('/welcome');;}
                else{
                    if( meta_data != ''){ // If there is no data in metatable, pass.
                        var temp = [];
                        var compareValue = meta_data[0].name.split('_')[0] + '_' + meta_data[0].name.split('_')[1]
                        var num = parseInt(meta_data[0].name.split('_')[2]);
                        var index = 0;

                        //Extract index numbers except most recent of retraining tables.
                        for(var i = 1; i < meta_data.length; i++){
                            var name = meta_data[i].name.split('_')[0] + '_' + meta_data[i].name.split('_')[1]
                            if(compareValue == name){
                                if(num > parseInt(meta_data[i].name.split('_')[2])){
                                    temp.push(i);
                                    continue;
                                }else{
                                    temp.push(index);
                                }
                            }
                            compareValue = name;
                            num = parseInt(meta_data[i].name.split('_')[2]);
                            index = i;
                        }
                        temp.sort(function(a, b){ return a - b; }); //Sort numerically

                        //Delete the data row corresponding to the extracted index number.
                        for(var j = 0; j < temp.length; j++){
                            if(j == (temp.length-1)){
                                meta_data.splice(temp[j], 1);
                                break;
                            }
                            meta_data.splice(temp[j], 1);
                            temp.splice((j+1), 1, (temp[j+1] - (j+1)));
                         }

                        //Delete all but three rows of data.
                        while(meta_data[3] != null){
                            meta_data.splice(3, 1);
                        }
                    }

                    result_mail.select(function(err, mail_data){
                        if(err) {res.redirect('/welcome'); console.log(err);}
                        else{
                            res.render('home/sendmail', {infor:data, meta:meta_data, mail:mail_data});
                        }
                    });
                }
            });
        }
    });
});

app.get('/mailNow', ensureAuthenticated, function(req, res){

    function load_table_name(callback){

      var name = req.query.metatable;
      if(name){ // If webpage sends name of table..
        table_name = name;
        table_name = "`" +table_name + "`";
        callback(table_name);
      }else{ // User access to report-page first time, there is no selected name. So, default value of table-name is loaded.
        var project_name_data = sql.select_query('saveConnect', '*', 'metatable ORDER BY start DESC', false);
        project_name_data.select(function(err, project_data){
        if(err){
            res.redirect('/welcome');
        } else{
            if(project_data!=''){
                table_name = project_data[0];
                table_name = table_name['name'];

                table_name = "`" +table_name + "`";
                callback(table_name);
            } else {
                 res.render('home/mailNow', {project : "", result : "", criteria : "", table : ""});
            }
          }
        });
      }
    }

    var next = function rendering(table_name){
      var project_name_data = sql.select_query('saveConnect', '*', 'metatable ORDER BY start DESC', false);
      var criteria_member = sql.select_query('memberConnect', '*', "css_member limit 1", false);
      var criteria_project = sql.select_query('saveConnect', '*', table_name + " limit 1", false);
      project_name_data.select(function(err, project_data){ // Data of number of project and project period.
          if(err) {
              res.redirect('/welcome');
          }

          else {
              criteria_member.select(function(err, criteria_mem){ // Data of criteria
                if(err){
                  res.redirect('/welcome');
                }
                else{ // Parsing the criteria data of member
                  var sub_query1 = ""
                  for(var i =0; i < Object.keys(criteria_mem[0]).length; i++){
                    if(Object.keys(criteria_mem[0])[i] == 'e_mail_address'){break;}
                    sub_query1 += Object.keys(criteria_mem[0])[i] + ", ";
                  }
                  criteria_project.select(function(err, criteria_data){ // Parsing the criteria data of project
                    if(err){
                      res.redirect('/welcome');
                    }
                    else{
                      var sub_query2 = ""
                      for(var i =0; i < Object.keys(criteria_data[0]).length; i++){
                        if(Object.keys(criteria_data[0])[i] == 'e_mail_address'){break;}
                        sub_query2 += "css_member." + Object.keys(criteria_data[0])[i] + ", ";
                      }
                      var column_data = sql.select_query('saveConnect', sub_query1 + sub_query2 + "css_member.e_mail_address, ip_address, com_name, method, method_con, confirm", "member_db.css_member join save_db." + table_name + " on member_db.css_member.e_mail_address = save_db." + table_name + ".e_mail_address ORDER BY name;", false);
                      column_data.select(function(err, result_data){ // All data of project and parsing by the criterias
                        if(err){
                          res.redirect('/welcome');
                        }
                        else{
                          var standard = "";
                          for(var i =0; i < Object.keys(criteria_data[0]).length; i++){
                            if(Object.keys(criteria_data[0])[i] == 'e_mail_address'){break;} // Before 'e_mail_address' datas become criteria.
                            standard += Object.keys(criteria_data[0])[i] + " ";
                          }
                          standard = standard.split(" ");
                          standard.pop();
                          if(standard.length == 0){// If there is no criteria.
                            standard.push("")
                          }
                          res.render('home/mailNow', {project : project_data, result : result_data, criteria : standard, table : table_name});
                        }
                      });
                    }
                  });
                }
              });
          }
      });
    }
    load_table_name(next);
});

app.post('/mailNow/', function(req, res) {
    res.redirect('/mailNow');
});

//receipt notification code
app.get('/img/:id/:table/mailcheck.png', function(req, res){
    var result_mailcheck = sql.update_query('saveConnect', base64.decode(req.params.table), 'confirm = 1', 'e_mail_address = ' + "'" + base64.decode(req.params.id) + "'");
    result_mailcheck.update(function(err, data){
        if(err) {
            console.log(err);
        }
    });
    res.sendFile("C:/Users/Wra1th/Desktop/메일 수신확인 테스트/mailcheck.png")
    //C:/.../.../.../mailcheck.png
    //png file is any 1px file
});

//url method check code
app.get('/url/:id/:table', function(req, res){
    var result_urlcheck = sql.update_query('saveConnect', base64.decode(req.params.table), 'confirm = 1, method_con = 1', "e_mail_address = " +
        "'" + base64.decode(req.params.id) + "'");
    result_urlcheck.update(function(err, data){
        if(err) {
            console.log(err);
        }
    });
    res.write('ok');
    res.end();
});

//Do not receive information after a period of time
app.get('/insertInfor/:infor', function(req, res){
    var data = req.params.infor;
    var now = moment();
    var docName = data.split(',')[0].split('.')[0]; //document name
    var ComName = data.split(',')[1]; //user computer name
    var ipList = [];

    var index = 2;
    while(data.split(',')[index] != ''){
        ipList.push(data.split(',')[index]);
        index++;
    }
    var emailName = docName.split('_')[1]; //get emailaddress
    var tableName = docName.split('_')[2]; // get tablename
    var result_date = sql.select_query('saveConnect', 'end', 'metatable', 'name = ' + "'"+ base64.decode(tableName) + "'");
    //get matatable in tableName
    result_date.select(function(err, data){
        if(err) {
            console.log(err);
        }
        else{
            if(now.diff(data[0].end) < 0){ //period compare code
              //compare and update query
                var result_update = sql.update_query('saveConnect', base64.decode(tableName),
                    'confirm = 1, ip_address = ' + "'" + ipList + "'" + ', method_con = 1, com_name = ' + "'" + ComName + "'", 'e_mail_address = "' + base64.decode(emailName)+ '"');
                result_update.update(function(err, data){
                    if(err) {
                        console.log(err);
                    }
                });

            }
            else{
                console.log('false');
            }
        }
    });

    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.write('OK');
    res.end();
});

// Loading authentication number and sends to the program.
app.get('/connect/', function(req, res) {
  var time = req.body.min;
  var certify = sql.select_query('saveConnect', '*', 'authentication where ID = ' + time, false);
  certify.select(function(err, data) {
    data = data[0]['auth_number'];
    res.send(data);
  });

});

// Delete the authorized user's e-mail from server. This indicates that users have passed certification stage.
app.get('/deleteUserData', function(req, res) {
  var email = req.body.email;
  var deleting = sql.delete_query('saveConnect', 'auth_confirm', 'e_mail_address = ' + "'" + email + "'", false )
  deleting.delete(function(err, data){
    if(err){
      console.log(err);
    }
    res.send(data);
  });

});

// Video watching part.
app.get('/connectMovie/', function(req, res) {



    var path = '/cssProject/files/test.mp4'; //What video users want to show(Directory)
    var stat = fs.statSync(path);
    var total = stat.size;
    if (req.headers['range']) {
      var range = req.headers.range;
      var parts = range.replace(/bytes=/, "").split("-");
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart, 10);
      var end = partialend ? parseInt(partialend, 10) : total - 1;
      var chunksize = (end - start) + 1;

      var file = fs.createReadStream(path, {
        start: start,
        end: end
      });
      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(path).pipe(res);
    }


});

//'welcome' picture
app.get('/img1', function(req, res){
    fs.readFile('routes/send.jpg', function(error, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});
app.get('/img2', function(req, res){
    fs.readFile('routes/status.jpg', function(error, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});
app.get('/img3', function(req, res){
    fs.readFile('routes/report.jpg', function(error, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

//Monitor Control(hooking) program download
app.get('/download', function(req, res){
    filepath = "D:/CSS/프로젝트/모의훈련_프로젝트/웹/cssProject/files/h00k.exe";
    res.download(filepath);
});

//ransomware(encrypt) program download
app.get('/download2', function(req, res){
    filepath = "D:/CSS/프로젝트/모의훈련_프로젝트/웹/cssProject/files/2ans0m.exe";
    res.download(filepath);
});

//decrypt program download
app.get('/download3', function(req, res){
    filepath = "D:/CSS/프로젝트/모의훈련_프로젝트/웹/cssProject/files/training_decrypt.exe";
    res.download(filepath);
});

//connecting to web to watch educational video
app.get('/download4', function(req, res){
    filepath = "D:/CSS/프로젝트/모의훈련_프로젝트/웹/cssProject/files/watching.exe";
    res.download(filepath);
});
module.exports = app;

const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const sendmail = ('./routes/home.js');

const config = {
    mailer: {
        /*example

        service: 'mail service',
        port: 'port number',
        user: 'mailaddress@email.com',
        password: 'mailpassword',
        
        */
    },
};

const transporter = nodemailer.createTransport(smtpPool({
    service: config.mailer.service,
    port: config.mailer.port,
    auth: {
        user: config.mailer.user,
        pass: config.mailer.password,
    },
    tls: {
        rejectUnauthorized: false,
    },
    maxConnections: 100,
    maxMessages: 100,
}));
exports.sending = function(maillist, mailOptions, attachment, sendto, html){
    maillist.forEach(function (to, i) {
        var msg;
        if(attachment == '') {
            msg = {
                from: mailOptions.from, // sender address
                to: to, //recipients
                subject: mailOptions.subject,
                html: html[i], // plaintext body
            };
        }else{
            msg = {
                from: mailOptions.from, // sender address
                to: to, //recipients
                subject: mailOptions.subject,
                html: html[i], // plaintext body
                attachments: attachment[i]
            };
        }
        msg.to = sendto[i];
        transporter.sendMail(msg, function (err) {
            if (err) {
                console.log('Sending to ' + to + ' failed: ' + err);
                return;
            } else {
                console.log('Sent to ' + to);
            }

            if (i === maillist.length - 1) { msg.transport.close(); }
        });
    });
};
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const request = require('request')
const mysql = require('mysql')
const schedule = require('node-schedule')

const app = express()

app.use(express.static(__dirname + '/../public'))
app.use(bodyParser.urlencoded({limit: '50mb', extended : false }))

app.set('view-engine', 'ejs')

app.get('/', (req, res)=>{
    con.query("select * from log order by date DESC limit 6", function(err, result, fields){
        if(err) throw err;
        con.query('select * from log WHERE date = "'+DATE+'";', function(err, result2, fields){
            //console.log(result2)
            res.render('index.ejs', {log : result, today : result2[0]})
        })
    })
})


app.post('/image', (req, res)=>{
	//console.log(req.body.image)
	var message={
    	image: req.body.image
    }

	var clientServerOptions = {
        uri: 'http://0.0.0.0:5000/predict',
        body: JSON.stringify(message),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        // console.log(response.body);
        var obj = JSON.parse(response.body)
        if(obj.prediction.ok > obj.prediction.fault){
            ok_inc = 1; notok_inc = 0; obj.prediction.type = "OK";
            con.query('UPDATE log SET ok = ok+'+ ok_inc+', notok = notok+' + notok_inc + ' WHERE date ="'+DATE+'";' , function(err, result, fields){
                if(err) throw err;
                con.query('select * from log WHERE date = "'+DATE+'";', function(err, result2, fields){
                    obj.statics = result2
                    res.send(obj)
                })
            })
        } else {
            ok_inc = 0; notok_inc = 1;  obj.prediction.type = "Defective";
            // when bearing is defective
            clientServerOptions = {
                uri: 'http://0.0.0.0:5000/predict_defect',
                body: JSON.stringify(message),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            request(clientServerOptions, function (error, response2) {
                console.log("this is fun ", response2.body)
                // var arr = JSON.parse(response2.body).prediction
                obj.defect_type = JSON.parse(response2.body).prediction

                con.query('UPDATE log SET ok = ok+'+ ok_inc+', notok = notok+' + notok_inc + ' WHERE date ="'+DATE+'";' , function(err, result, fields){
                    if(err) throw err;
                    con.query('select * from log WHERE date = "'+DATE+'";', function(err, result2, fields){
                        obj.statics = result2
                        res.send(obj)
                    })
                })
            })
        }

    });

})


app.get('/log', (req, res)=>{
    con.query("select * from log;", function(err, result, fields){
        if(err) throw err;
        con.query('select * from log WHERE date = "'+DATE+'";', function(err, result2, fields){
            if(err) throw err;
            ////console.log(result2)
            res.render('log.ejs', {log : result, today : result2[0]})
        })
    })
})

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1, 2, 3, 4, 5, 6];
rule.hour = 0;
rule.minute = 0;


var j = schedule.scheduleJob(rule, function(){
    con.query('insert into table log values ("'+getDateTime()+'", 0, 0);', function(err, result, fields){
        console.log('added new date')
    })
})


var con = mysql.createConnection({
    host: "localhost",
    user: "developer",
    password: "password",
    database: "sih",
    multipleStatements: true
});




app.listen(3000, (err)=>{
	if(!err)
		console.log('server is up!')
})


var DATE = getDateTime();
function getDateTime() {

    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    DATE = year + "-" + month + "-" + day;
    return DATE;

}

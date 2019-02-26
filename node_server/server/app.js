const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const request = require('request')

const app = express()

app.use(express.static(__dirname + '/../public'))
app.use(bodyParser.urlencoded({ extended : false }))

app.set('view-engine', 'ejs')

app.get('/', (req, res)=>{
	res.render('index.ejs')
})

app.get('/test', (req, res)=>{
	var postData = {
		msg: 'Sweetie'
	}
    var clientServerOptions = {
        uri: 'http://0.0.0.0:5000/test',
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        console.log(response.body);
        var obj = JSON.parse(response.body)
        console.log(obj.test.msg)
        res.send(obj.test.msg)
    });
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
        console.log(response.body);
        var obj = JSON.parse(response.body)
        //console.log()
        res.send(obj)
    });

	//res.send(JSON.stringify(response))
})

app.listen(3000, (err)=>{
	if(!err)
		console.log('server is up!')
})

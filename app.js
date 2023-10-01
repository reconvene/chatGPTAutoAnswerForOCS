//import required modules
const express = require('express');
const axios = require('axios');

//create an express application
const app = express();

//config the URL of ChatGPT API
const url = 'https://api.chatanywhere.com.cn/v1/chat/completions';

//config request parameters
const config = {
	//config request header,including the content type and authorization key
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer !!!-----yourAPIKey-----!!!'
	},
	//config timeout
	timeout: 5000
};

//config request data,including the name of ChatGPT model,message queue and temperature value
let data = {
	"model": "gpt-3.5-turbo",
	"messages": [{
		"role": "user",
		"content": ""
	}],
	"temperature": 0.7
};

app.get('/api/qa', async (req, res) => {
	//set response header for allowed request origins
	res.header('Access-Control-Allow-Origin', '*');
	//set response header for allowed request methods
	res.header('Access-Control-Allow-Methods', 'GET');
	//set response header for allowed request headers
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
	//get question parameter from request,which is the question sent by the client
	const query = req.query.question;
	//return error if no query is provided
	if (!query) {
		res.status(400).json({
			error: 'No query provided'
		});
		return;
	};

	//obtain question type and question options
	const questionType = req.query.type ? '这道题的类型是:[' + req.query.type + ']\n' : '';
	const questionOptions = req.query.options ? ',选项为:\n' + req.query.options : '';

	//add complete question to request data
	console.log(`${questionType}题目是:${query}${questionOptions}`);
	data.messages[0].content = `${questionType}题目是:${query}${questionOptions}`;
	
	//obtain answers from API with axios,and throw errors if a problem occurs
	try {
		const GPTAnswer = await axios.post(url, data, config);
		console.log(GPTAnswer.data.choices[0]);
		res.status(200).json({
			GPTstatus: 200,
			title: query,
			answer: GPTAnswer.data.choices[0].message.content
		});
		return;
	} catch (err) {
		res.status(400).json({
			GPTstatus: 400,
			title: query,
			answer: undefined
		});
		console.log(err);
		return;
	};
});

//set a listening port
const port = process.env.PORT || 3000;
//bring up the server and listen to the port
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

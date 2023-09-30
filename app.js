//引入所需模块
const express = require('express');
const axios = require('axios');

// 创建一个express应用
const app = express();

// 设置请求的URL，这是ChatGPT API的地址
const url = 'https://api.chatanywhere.com.cn/v1/chat/completions';

//设置请求参数
const config = {
	// 设置请求的头部，包含内容类型和授权密钥
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer !!!-----yourAPIKey-----!!!'
	},
	//设置超时时间
	timeout: 5000
};

// 设置请求数据，包含模型名称，消息列表，随机系数等
let data = {
	"model": "gpt-3.5-turbo",
	"messages": [{
		"role": "user",
		"content": ""
	}],
	"temperature": 0.7
};

app.get('/api/qa', async (req, res) => {
	//设置响应头，允许的请求来源
	res.header('Access-Control-Allow-Origin', '*');
	// 设置响应头，允许的请求方法
	res.header('Access-Control-Allow-Methods', 'GET');
	// 设置响应头，允许的请求头
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
	// 获取请求中的question参数，这是客户端发来的问题
	const query = req.query.question;
	// 如果没有提供问题，则返回错误信息
	if (!query) {
		res.status(400).json({
			error: 'No query provided'
		});
		return;
	};

	//获取问题类型和选项
	const questionType = req.query.type ? '这道题的类型是:[' + req.query.type + ']\n' : '';
	const questionOptions = req.query.options ? ',选项为:\n' + req.query.options : '';

	//将完整的question添加进请求数据中
	console.log(`${questionType}题目是:${query}${questionOptions}`);
	data.messages[0].content = `${questionType}题目是:${query}${questionOptions}`;

	//用axios向api获取答案，如果报错则抛出
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

// 设置一个监听端口号
const port = process.env.PORT || 3000;
// 启动服务器并监听端口号
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
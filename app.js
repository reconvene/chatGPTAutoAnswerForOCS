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
	//timeout: 10000
};

//判断用户是否替换APIKey,如果没有则退出程序
if(config.headers.Authorization === 'Bearer !!!-----yourAPIKey-----!!!'){
	console.error('[Initialization failure]You didn\'t replace the correct APIKey in the program\n[Initialization failure]See the README in the program for help with this.\n[chatGPTAutoAnswerForOCS]https://github.com/reconvene/chatGPTAutoAnswerForOCS');
	process.exit(0);
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

//设置题目类型中英文对照表
const typeTranslator={
	'single': '单选题',
	'multiple': '多选题',
	'judgement': '判断题'
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
	
	//获取中文
	req.query.type = typeTranslator[req.query.type] || req.query.type;
	
	//获取问题类型和选项
	const questionType = req.query.type && req.query.type !== 'undefined' ? '这道题的类型是:[' + req.query.type + ']\n' : '';
	const questionOptions = req.query.options && req.query.options !== 'undefined' ? ',选项为:\n' + req.query.options + '\n回答要求:请返回一个包含多个元素的数组,第一个元素只能回答选项本身,第二个元素需填入回答理由\n例子:[\"C.3\",\"因为1+2=3\"]\n如果题目类型是多选题则需要选出多个选项依次附加在数组中\n多选题例子:[\"选项1\",\"选项2\",...,\"选项n\",\"选择理由\"](最少为一个选项,最多为四个选项,答案和理由都要在一个数组中,理由单独放在数组最后一个元素中,一次回答最多返回一个数组)' : '';

	//将完整的question添加进请求数据中
	console.log('----------------------------------- [LOG] ----------------------------------');
	console.log(`[Log]${questionType}题目是:${query}${questionOptions}`);
	data.messages[0].content = `${questionType}题目是:${query}${questionOptions}`;

	//用axios向api获取答案，如果报错则抛出
	try {
		const GPTAnswer = await axios.post(url, data, config);
		console.log(GPTAnswer.data.choices[0]);
		console.log('------------------------------- [END OF LOG] -------------------------------\n');
		res.status(200).json({
			GPTstatus: 200,
			title: query,
			answer: GPTAnswer.data.choices[0].message.content
		});
		return;
	} catch (err) {
		
		//输出错误日志
		console.log('------------------------------- [END OF LOG] -------------------------------\n');
		console.log('---------------------------------- [ERROR] ---------------------------------');
		
		//处理不同类型的错误
		if (err.response) {
		//将获取到的错误返回给客户端
			res.status(400).json({
				GPTstatus: 400,
				title: query,
				answer: err.response.data || undefined
			});
			
			//输出错误的代码、状态和具体信息
			console.error('[ErrorCode]',err.code);
			console.error('[ErrorStatus]',err.response.status);
			console.error('[ErrorData]',err.response.data || err);
		
    } else if (err.request) {
      //处理没有收到回复的错误
			console.error('[ErrorCode]',err.code);
			console.error('[ErrorMessage]',err.message);
      console.log('[RequestInfo]',err.request);
    } else {
      //处理预期之外的错误
      console.log('[Error]', err);
    };
		
		console.log('------------------------------ [END OF ERROR] ------------------------------\n');
		return;
	};
});

// 设置一个监听端口号
const port = process.env.PORT || 3000;
// 启动服务器并监听端口号
app.listen(port, () => {
	//项目初始化
	console.info('[Hints]If you don\'t get an option for a multiple choice question\n[Hints]It\'s possible that your OCS is not configured properly\n[Hints]Please check that the script you configured on OCS matches the one in the README!');
	console.info('[chatGPTAutoAnswerForOCS]https://github.com/reconvene/chatGPTAutoAnswerForOCS\n');
	console.info(`[Info]Server is running on port ${port}\n`);
});
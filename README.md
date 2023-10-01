# ChatGPT-AutoAnswer-For-OCS

**This repository is specifically adapted to OCS.**

This repository is the OCS branch of project [chatGPTAutoAnswerByNode.js](https://github.com/reconvene/chatGPTAutoAnswerByNode.js/tree/OCS)

A ChatGPT API forwarder by Node.js+Express

**Thanks to [this](https://github.com/chatanywhere/GPT_API_free) project for providing the free ChatGPT API**

This is a simple project to demonstrate how to encapsulate the ChatGPT API through Node.js+Express to achieve the desired goal.

HOW TO USE
---

Configure the system environment for Node.js

We chose **18.18.0 LTS**

1.  Clone this project to your computer
```
git clone https://github.com/reconvene/chatGPTAutoAnswerForOCS
```

2.  Modify the configuration

    Replace **‘!!!-----yourAPIKey-----!!!’** with your **ChatGPT API Key**
   
    *Do not delete the preceding ‘Bearer’*
```
const config={
	//config request header,including the content type and authorization key
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer !!!-----yourAPIKey-----!!!'
	},
	//config timeout
	timeout: 5000
};
```

3. Install dependencies
```
npm install
```

4. Run app.js
```
node app.js
```

5. Add some lines to the OCS configuration interface
   
   **Don’t forget to replace ‘yourServerIP‘**
```
[
  {
    "url": "http://yourServerIP:3000/api/qa?question=${title}&type=${type}&options=${options}",
    "name": "GPTAnswer",
    "method": "get",
    "contentType": "json",
    "handler": "return (res)=> {return res.GPTstatus === 400 ? undefined : [res.title, res.answer]}"
  }
]
```
# Try it!
Access http://**yourServerIP**:3000/api/qa?question=**yourquestion** through the **GET** method to get answers through JSON format

Enjoy your GPT-enabled OCS :)

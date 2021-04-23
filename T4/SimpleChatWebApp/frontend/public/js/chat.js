const config = {
	apiBaseUrl: "https://simplechatwebappapi.azurewebsites.net/api/",
	botApi: "https://notabot-b96d.azurewebsites.net/qnamaker/knowledgebases/a369b0c4-b670-4853-8753-00e3af7e161b/generateAnswer"
}

var botMessages = [];

const currentToken = $('#currentToken').val();
const currentUsername = $('#currentUsername').val();
var currentReceiverUsername = 0;

async function getAllMembers(){

	return new Promise(function (resolve, reject) {
		$.ajax({
			url: config.apiBaseUrl + "users",
			data: {},
			type: "GET",
			beforeSend: function(xhr){xhr.setRequestHeader('token', currentToken);},
			success: resolve,
			error: reject
		 });
	  });
}

async function getMessages(user){

	return new Promise(function (resolve, reject) {
		$.ajax({
			url: config.apiBaseUrl + "messages",
			data: {"user": user},
			type: "GET",
			beforeSend: function(xhr){xhr.setRequestHeader('token', currentToken);},
			success: resolve,
			error: reject
		 });
	  });
}

async function setMembers(){

	let allMembers = await getAllMembers().then((res) => {
		let results = JSON.parse(res);
		return results.users;
	});

	let htmlCode = ``;

	allMembers = JSON.parse(allMembers);

	htmlCode += `<div class="member" onclick="setBotConversation()"><i class="fa fa-android" aria-hidden="true"></i>
	Web Bot</div>`;

	for(member of allMembers){
		htmlCode += `<div class="member" onclick="setConversation('${member.Username}')">${member.Username}</div>`;
	}

	$('#members').html(htmlCode);
}

function setConversation(memberName){
	$('#leftSide').css('visibility', 'visible');
	$('#name').text(memberName);
	currentReceiverUsername = memberName;
	$('#conv').html('');
	setMessages(memberName);
	$('#send_img').show();
	$('#conv').scrollTop($('#conv')[0].scrollHeight);
}

function setBotConversation(){
	memberName = '<i class="fa fa-android" aria-hidden="true"></i> Web Bot';
	$('#leftSide').css('visibility', 'visible');
	$('#name').html(memberName);
	currentReceiverUsername =  '';
	$('#conv').html('');
	setBotMessages();
	$('#send_img').hide();
	$('#conv').scrollTop($('#conv')[0].scrollHeight);
}

function openImagesKeyboard(){
	$('#imagesPanel').show();
}

function searchImages(){
	var string = $('#imageSearch').val();

	if(string.trim().length == 0){
		$('#imageResults').html('');
		$('#loadingGif').hide();
		return;
	}

	$('#loadingGif').show();
	$('#imageResults').hide();

	$.ajax({
		url: config.apiBaseUrl + "images",
		data: {"queryTerm": string},
		type: "GET",
		beforeSend: function(xhr){xhr.setRequestHeader('token', currentToken);},
		success: (data) =>{

			var results = JSON.parse(data);

			var images = JSON.parse(results.urls);
	
			if(images.length > 0){
	
				let output = ``;
	
				for(image of images){
	
					output += `<img class="search-results-img" src="${image}" onclick="sendImage(this.src)">`;
				}
	
				$('#imageResults').html(output);
			}else{
	
				$('#imageResults').html('');
			}
	
			$('#loadingGif').hide();
			$('#imageResults').show();

		},
		error: (err) => {
			console.log(err);
		}
	 });

}


function sendMessage(){

	var textVal = $('#send_msg').val();
	var receiverVal = currentReceiverUsername;
	var isImageVal = false;

	if(currentReceiverUsername == ''){
		sendBotMessage();
		return;
	}

	if(textVal.trim() == "")
		return;

	$.ajax({
		url: config.apiBaseUrl + "messages",
		data: JSON.stringify({
			text: textVal,
			user: receiverVal,
			isImage: isImageVal 
		}),
		type: "POST",
		beforeSend: function(xhr){xhr.setRequestHeader('token', currentToken);},
		success: (data) =>{
			setMessages(currentReceiverUsername);
			$('#send_msg').val('');
		},
		error: (err) => {
			console.log(err);
		}
		});
}

function sendBotMessage(){

	var textVal = $('#send_msg').val();

	if(textVal.trim() == "")
		return;

	botMessages.push({
		bot: false,
		message: textVal
	});

	
	$.ajax({
		url: config.botApi,
		data: JSON.stringify({
			question: textVal
		}),
		type: "POST",
		beforeSend: function(xhr){
			xhr.setRequestHeader('Authorization', 'EndpointKey fabfc2b8-9593-41d2-8648-36f1fdaae89a');
			xhr.setRequestHeader('Content-Type', 'application/json');
		},
		success: (data) =>{
			botMessages.push({
				bot: true,
				message: data.answers[0].answer
			});

			setBotConversation();
			$('#send_msg').val('');
		},
		error: (err) => {
			console.log(err);
		}
		});

}


async function setMessages(username){

	let numberOfMessages = $('.message').length;

	let messages = await getMessages(username).then((res) => {
		let results = JSON.parse(res);
		return results.messages;
	}).catch((err)=>{
		console.log(err);
	});

	let htmlCode = ``;

	messages = JSON.parse(messages);

	for(message of messages){
		if(!message.IsImage){
			if(currentUsername == message.Sender){
				htmlCode += `<div class="message message-sent">${message.Text}</div>`;
			}else{
				htmlCode += `<div class="message message-received">${message.Text}</div>`;
			}
		}else{
			if(currentUsername == message.Sender){
				htmlCode += `<div class="message message-sent message-img"><img src="${message.Text}"/></div>`;
			}else{
				htmlCode += `<div class="message message-received message-img"><img src="${message.Text}"/></div>`;
			}
		}
	}

	if(numberOfMessages < messages.length){
		$('#conv').html(htmlCode);
		$('#conv').scrollTop($('#conv')[0].scrollHeight);
	}
}


async function setBotMessages(){

	let numberOfMessages = $('.message').length;

	let htmlCode = ``;

	for(message of botMessages){
		if(!message.bot){
			htmlCode += `<div class="message message-sent">${message.message}</div>`;
		}else{
			htmlCode += `<div class="message message-received">${message.message}</div>`;
		}
	}

	if(numberOfMessages < botMessages.length){
		$('#conv').html(htmlCode);
		$('#conv').scrollTop($('#conv')[0].scrollHeight);
	}
}

function sendImage(image){

	var textVal = image;
	var receiverVal = currentReceiverUsername;
	var isImageVal = true;

	if(textVal.trim() == "")
		return;

	$.ajax({
		url: config.apiBaseUrl + "messages",
		data: JSON.stringify({
			text: textVal,
			user: receiverVal,
			isImage: isImageVal 
		}),
		type: "POST",
		beforeSend: function(xhr){xhr.setRequestHeader('token', currentToken);},
		success: (data) =>{
			setMessages(currentReceiverUsername);
			$("#imagesPanel").hide();
		},
		error: (err) => {
			console.log(err);
		}
		});
}

$('#imageSearch').keyup(searchImages);

$('#send_img').click(openImagesKeyboard);

$('#send_btn').click(sendMessage);

$('#send_msg').keyup((event)=>{
	if (event.keyCode === 13) {
		event.preventDefault();
		sendMessage();
	}
});

setMembers();

setInterval(function(){
	if(currentReceiverUsername != ''){
		setMessages(currentReceiverUsername);
	}else{
		setBotMessages();
	}
 }, 2000);

 setInterval(function(){
	setMembers();
 }, 5000);

$(document).mouseup((e) => {
    var container = $("#imagesPanel");

    if(!container.is(e.target) && container.has(e.target).length === 0){
        container.hide();
    }
});
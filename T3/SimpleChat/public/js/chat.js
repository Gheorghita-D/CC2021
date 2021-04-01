
const visionEndpoint = "https://us-central1-simplechat-308917.cloudfunctions.net/images";
const usersApiEndpoint = "https://europe-west1-simplechat-308917.cloudfunctions.net/users";
const messagesApiEndpoint = "https://europe-west1-simplechat-308917.cloudfunctions.net/messages";

const currentUserId = $('#currentId').val();
var currentReceiverId = 0;

async function getAllMembers(){

	return new Promise(function (resolve, reject) {
		$.get(usersApiEndpoint).done(resolve).fail(reject);
	  });
}

async function getMessages(userId){

	return new Promise(function (resolve, reject) {
		$.get(`${messagesApiEndpoint}?id1=${currentUserId}&id2=${userId}`).done(resolve).fail(reject);
	  });
}

async function setMembers(){

	let allMembers = await getAllMembers().then((res) => {
		return res.results;
	});

	let htmlCode = ``;

	for(member of allMembers){
		if(currentUserId != member.id){
			htmlCode += `<div class="member" onclick="setConversation(${member.id},'${member.username}')">${member.username}</div>`;
		}
	}

	$('#members').html(htmlCode);
}

async function setMessages(userId){

	let numberOfMessages = $('.message').length;

	let messages = await getMessages(userId).then((res) => {
		return res.results;
	});

	let htmlCode = ``;

	for(message of messages){
		if(message.isImage == "false"){
			if(currentUserId == message.sender){
				htmlCode += `<div class="message message-sent">${message.text}</div>`;
			}else{
				htmlCode += `<div class="message message-received">${message.text}</div>`;
			}
		}else{
			if(currentUserId == message.sender){
				htmlCode += `<div class="message message-sent message-img"><img src="${message.text}"/></div>`;
			}else{
				htmlCode += `<div class="message message-received message-img"><img src="${message.text}"/></div>`;
			}
		}
	}

	if(numberOfMessages < messages.length){
		$('#conv').html(htmlCode);
		$('#conv').scrollTop($('#conv')[0].scrollHeight);
	}
}

function setConversation(memberId, memberName){
	$('#leftSide').css('visibility', 'visible');
	$('#name').text(memberName);
	currentReceiverId = memberId;
	$('#conv').html('');
	setMessages(memberId);
	$('#conv').scrollTop($('#conv')[0].scrollHeight);
}

function openImagesKeyboard(){
	$('#imagesPanel').show();
}

function searchImages(){
	var string = $('#imageSearch').val();

	$('#loadingGif').show();
	$('#imageResults').hide();

	$.get( `${visionEndpoint}?label=${string}`, ( data ) => {

		var images = data.results;

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

	  });
}


function sendMessage(){

	var textVal = $('#send_msg').val();
	var senderVal = currentUserId;
	var receiverVal = currentReceiverId;
	var isImageVal = false;

	if(textVal.trim() == "")
		return;

	$.post( messagesApiEndpoint, 
		{
			text: textVal,
			sender: senderVal,
			receiver: receiverVal,
			isImage: isImageVal 
		}, ( data ) => {
			setMessages(currentReceiverId);
			$('#send_msg').val('');
	});
}

function sendImage(image){

	var textVal = image;
	var senderVal = currentUserId;
	var receiverVal = currentReceiverId;
	var isImageVal = true;

	if(textVal.trim() == "")
		return;

	$.post( messagesApiEndpoint, 
		{
			text: textVal,
			sender: senderVal,
			receiver: receiverVal,
			isImage: isImageVal 
		}, ( data ) => {
			setMessages(currentReceiverId);
			$("#imagesPanel").hide();
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
	if(currentReceiverId != 0){
		setMessages(currentReceiverId);
	}
 }, 2000);

$(document).mouseup((e) => {
    var container = $("#imagesPanel");

    if(!container.is(e.target) && container.has(e.target).length === 0){
        container.hide();
    }
});
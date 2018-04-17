const request = require('request');
const http = require('http');
var maxRequests = 1000;
var DoneRequests = 0 ;
var Now=  new Date();


class apiMessage {
    constructor() {
        this.source = "";
        this.time = "";
        this.title = "";
        this.payload ;
    }
}

//Moch Data
var tapiMessage = new apiMessage;
tapiMessage.title = "issueTicket";
tapiMessage.payload = {
  orgid: "1",
  segmentid: "325",
  serviceid: "364",
  branchid: "106",
  languageindex: "0",
  origin: "0"
};
tapiMessage.time = new Date();


var options = {
    url: 'http://localhost:3000/processCommand',
	body:JSON.stringify(tapiMessage),
    headers: {
        'Content-Type': 'application/json'
    }
};


for (var i=0;i<maxRequests;i++)
 { 
request.post(options, function(error, response, body){
	if (error)
	{
		console.log(error);
	}
	if (body)
	{
			var payload= JSON.parse(body);
			var nextString= 'Ticket Number=' + payload.displayTicketNumber;
			console.log(nextString);
	}
	else{
		console.log("error request error" + DoneRequests);
		
	}
	
	DoneRequests = DoneRequests + 1;
	if (DoneRequests == maxRequests)
	{
		console.log((( (new Date()) -  Now )/ 1000) + " ms");
		DoneRequests=0;
	}
});
 }

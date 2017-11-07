//
// Send a websocket message to a controller 
// and handle a response.
//
// @param config - A json object containing configuration info.
//
//                  The config can contain the folowing keys:
//
//                  message_type - the message type to send.
//                  message_params - the params to send with the 
//                      outgoing message.
//                  target_folder - the destination controller to send
//                      the message to.
//                  response_type - (optional) for messages which
//                      do not respond with <message_type>_response, specify
//                      the name of the response message type.
//                  src_folder - (optional) only handle responses from 
//                      the src_folder controller.
//                  response_func - function to call when response is received.
//                      This function will be passed a timestamp and
//                      a params json object. This has the form
//                      function(timestamp, params)
//
var MessageExecutor = function(config) {
   
    this.message_type   = config.message_type;
    this.message_params = config.message_params;
    this.target_folder  = config.target_folder;
    this.response_type  = this.message_type + "_response";
    this.src_folder     = null;
    this.response_func  = config.response_func

    var _this = this;

    //
    // Add optional config parameters.
    //
    if(config.response_type) {
        this.response_type = config.response_type;
    }
    if(config.src_folder) {
        this.src_folder = config.src_folder;
    }

    //
    // Send the message and set the response handler.
    //
    this.execute = function() {

        // console.log("[DEBUG] MessageExecutor execute()");

        addMessageHandler(this.response_type, this.handleResponse);

        // console.log("[DEBUG] MessageExecutor setting subscription and " +
        //            "target folder: " + this.target_folder);

        subscribeToFolder(this.target_folder);
        setTargetFolder(this.target_folder);

        if(g_webSocketInited) {

            // console.log("[INFO] MessageExecutor sending message on connected websocket. " + this.message_type + " " + this.message_params);

            sendSubscriptions();
        	sendMessage(this.message_type, this.message_params);
            return;
        }
        connectWebSocket(function() {

            // console.log("[INFO] MessageExecutor connecting websocket.");

        	sendMessage(_this.message_type, _this.message_params);
        });

    }

    //
    // Call the response handler.
    //
    this.handleResponse = function(timestamp, params) {
        console.log("[DEBUG] MessageExecutor handleResponse()", params);
        if( this.src_folder != null &&
            this.src_folder != params.src_folder) {
            console.log("[DEBUG] MessageExecutor ignoring message from " + 
                        params.src_folder);
            return;
        }
        removeMessageHandler(this.response_type);
        this.response_func(timestamp, params);
    }

    return this;
}

$(function() {

    function TelegraphyMessage (message, messageId, args) {
        this.message = message || '';
        this.messageId = messageId || '';
        this.args = args || '';
        this.serialize = function() {
            return JSON.stringify({
                message: this.message,
                messageId: this.messageId,
                args: this.args});
        };
        this.fromString = function (jsonAsStrMsg) {
            var data = JSON.parse( jsonAsStrMsg );
            this.message = data.message;
            this.messageId = data.messageId;
            this.args = data.args;
            return this;
        };
    };

    function getConnectionMessage(auth_token) {
        return new TelegraphyMessage('connect', 0, {auth: auth_token});
    };

    var Telegraph = function (url, authorizationToken, options) {
        options = options || {};
        this.authorizationToken = authorizationToken;
        this.protocol = {CONNECT: 'connect'};
        this.state = 'DISCONNECTED';
        this.transports = options.transports ? options.transports : ["websocket"];

        this.isConnected = function (){
            return this.conn != null;
        };

        this.connectWithGateway = function(){
            this.state = 'WAIT_CONNECTED';
            var connectionMsg = getConnectionMessage(this.authorizationToken);
            this.conn.send(connectionMsg.serialize());
        };

        this.handleSocketClosed = function(){
            this.state = 'DISCONNECTED';
            console.log(this.state);
        };

        this.handleMessage = function (msg) {
            console.log("New message", msg);
            if (this.state == 'WAIT_CONNECTED') {
                var telegraphyMessage = new TelegraphyMessage();
                telegraphyMessage.fromString(msg.data);
                this.gotoConnectedState(telegraphyMessage);
            }else{
                console.log("Wrong message!: msg=", msg, ' State=', this.state);
            }
        };

        this.gotoConnectedState = function (msg) {
            // Verify if the msg is the correct response to the current connection request.
            // If positive, change the current state.
            // Else, if it's a CONNECTION_FAILURE response, execute the appropiate policy (reconnect or goto disconnected).
            // Else, if it's another (unexpected) response, just do nothing (keep waiting for the correct response).
            this.state = 'CONNECTED';
            console.log("Now its connected", msg);
        };

        // Initialize
        this.conn = new SockJS(url, this.transports);
        this.state = 'WAIT_WS';
        this.conn.onopen = this.connectWithGateway.bind(this);
        this.conn.onclose = this.handleSocketClosed.bind(this);
        this.conn.onmessage = this.handleMessage.bind(this);
    };

    function log(msg) {
        var control = $('#log');
        control.html(control.html() + msg + '<br/>');
        control.scrollTop(control.scrollTop() + 1000);
    }


    var telegraph = new Telegraph('http://127.0.0.1:9999/echo/', 'SomeAuthTOken');

    function update_ui() {
        var msg = '';

        if (!Meerkat.isConnected()) {
            $('#status').text('disconnected');
            $('#connect').text('Connect');
        } else {
            $('#status').text('connected (' + Meerkat.conn.protocol + ')');
            $('#connect').text('Disconnect');
        }
    }

    $('#connect').click(function() {
        if (!telegraph.isConnected()) {
            connect();
        }

        update_ui();
        return false;
    });

    $('form').submit(function() {
        var text = $('#text').val();
        log('Sending: ' + text);
        Meerkat.send(text);
        $('#text').val('').focus();
        return false;
    });
});

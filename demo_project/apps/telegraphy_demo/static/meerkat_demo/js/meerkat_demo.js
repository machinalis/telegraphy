$(function() {

    function TelegraphyMessage (message, messageId, args) {
        this.message = message;
        this.args = args;
        this.messageId = messageId;
        this.serialize = function() {
            return JSON.stringify({message: this.message, args: this.args});
        };
    };

    function getConnectionMessage(auth_token) {
        return new TelegraphyMessage('connect', {auth: auth_token});
    };

    var Telegraph = function (authorizationToken, options) {
        options = options || {};
        this.protocol = {CONNECT: 'connect'};
        this.state = 'DISCONNECTED';
        this.transports = options.transports ? options.transports : ["websocket"];
        this.conn = new SockJS(url, this.transports);
        this.state = 'DISCONNECTED';
        var protocolMsg = getConnectionMessage('some-uui-auth-string');
        this.conn.send(protocolMsg.serialize());
        this.conn.onopen = this.
    };

    $.extend(Telegraph.prototype, {
        isConnected: function (){
            return this.conn != null;
        },

        openNewSocket: function (url, options){
            if (!this.isConnected()) {

            }
            // PRE: is connected
            if (options.onOpen){
                this.conn.onopen = options.onOpen;
            }
            if (options.onClose){
                this.conn.onclose = options.onClose;
            }
        },

        sendMessage: function(msg){
            console.log(msg, msg.serialize());
            this.conn.send(msg.serialize());
        }
    });

    function log(msg) {
        var control = $('#log');
        control.html(control.html() + msg + '<br/>');
        control.scrollTop(control.scrollTop() + 1000);
    }


    function connect() {
        var options = {
            onOpen: function() {
                log('Connected.');
                update_ui();
            },
            onClose: function() {
                log('Disconnected.');
                update_ui();
            }
        }
        log('Connecting...');
        Meerkat.transports = $('#protocols input:checked').map(
            function(){
                return $(this).attr('id');
            }).get();
        Meerkat.openNewSocket('http://localhost:9999/echo', options);
        Meerkat.connect();
    }

    function disconnect() {
        log('Disconnecting...');
        Meerkat.disconnect();
        update_ui();
    }

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
        if (!Meerkat.isConnected()) {
            connect();
        } else {
            disconnect();
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

$(function() {

    function MeerkatMessage (message, args) {
        this.message = message;
        this.args = args;
        this.serialize = function() {
            return JSON.stringify({message: this.message, args: this.args});
        };
    };

    var Meerkat = {
        protocol: {CONNECT: 'connect'},
        transports: ["websocket"],
        conn: null,

        isConnected: function (){
            return this.conn != null;
        },

        openNewSocket: function (url, options){
            if (!this.isConnected()) {
                this.conn = new SockJS(url, this.transports);
            }
            // PRE: is connected
            if (options.onOpen){
                this.conn.onopen = options.onOpen;
            }
            if (options.onClose){
                this.conn.onclose = options.onClose;
            }
        },

        connect: function (){
            var protocolMsg = this.getConnectionMessage('some-uui-auth-string');
            this.sendMessage(protocolMsg);
        },

        getConnectionMessage: function (auth_token) {
            return new MeerkatMessage('connect', {auth: auth_token});
        },

        disconnect: function() {
            if (this.conn != null) {
                this.conn.close();
                this.conn = null;
            }
        },

        sendMessage: function(msg){
            console.log(msg, msg.serialize());
            this.conn.send(msg.serialize());
        }
    };

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

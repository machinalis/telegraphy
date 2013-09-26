$(function() {
        
    var Meerkat = {
        transports: ["websocket"],
        conn: null,

        isConnected: function (){
            return this.conn != null;
        },

        openNewSocket: function (url){
            if (!this.isConnected()) {
                this.conn = new SockJS(url, this.transports);
            }
        },

        connect: function (options){
            // PRE: is connected
            if (options.onOpen){
                this.conn.onopen = options.onOpen;
            }
            if (options.onClose){
                this.conn.onclose = options.onClose;
            }
        },

        disconnect: function() {
            if (this.conn != null) {
                this.conn.close();
                this.conn = null;
            }
        },

        send: function(data){
            this.conn.send(data);
        }
    };

    function log(msg) {
        var control = $('#log');
        control.html(control.html() + msg + '<br/>');
        control.scrollTop(control.scrollTop() + 1000);
    }


    function connect() {
        Meerkat.openNewSocket('http://localhost:9999/echo');
        Meerkat.transports = $('#protocols input:checked').map(
            function(){
                return $(this).attr('id');
            }).get();
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
        Meerkat.connect(options);
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

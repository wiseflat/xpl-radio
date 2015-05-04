var Xpl = require('xpl-api');
var fs = require('fs');
var os = require('os');
var sys = require('sys');
var player = new require('./player').Player();
var pjson = require('../package.json');

process.chdir(__dirname); // Very important!

function wt(device, options) {
	options = options || {};
	this._options = options;
            
	this.basicFile = "/etc/wiseflat/radio.basic.json";
        this.basicHash = [];    

        this.configFile =  "/etc/wiseflat/radio.config.json";
        this.configHash = [];    

	this.version = pjson.version;
	
	options.xplSource = options.xplSource || "bnz-radio."+os.hostname();

	this.xpl = new Xpl(options);
};

module.exports = wt;

var proto = {
    
        init: function(callback) {
                var self = this;

                self.xpl.bind(function(error) {
                        if (error) {
                                return callback(error);
                        }

                        self._log("XPL is ready");
                        callback(null,  self.xpl);
                });
                
        },

	_log: function(log) {
		/*if (!this._configuration.xplLog) {
			return;
		}*/
                
		console.log('xpl-radio -', log);
	},
    
        _sendXplStat: function(body, schema, target) {
                var self = this;
                self.xpl.sendXplStat(
                        body, 
                        schema,
			target
                );
        },

        /*
         *  Config xPL message
         */
        
        readConfig: function(callback) {
                var self = this;
                fs.readFile(self.configFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.configFile+" is empty ..." + err);
                        else self.configHash = JSON.parse(body);
                });
        },

        sendConfig: function(callback) {
                var self = this;
                self._sendXplStat(self.configHash, 'radio.config', '*');
        },
        
        writeConfig: function(evt) {
                var self = this;
		self.configHash.version = self.version;
                self.configHash.enable = evt.body.enable;
                fs.writeFile(self.configFile, JSON.stringify(self.configHash), function(err) {
                        if (err) self._log("file "+self.configFile+" was not saved to disk ...");
			else self._sendXplStat(self.configHash, 'radio.config', evt.header.source);
                });
        },
    
        /*
         *  Basic xPL message
         */
        
        readBasic: function(callback) {
                var self = this;
                fs.readFile(self.basicFile, { encoding: "utf-8"}, function (err, body) {
                        if (err) self._log("file "+self.basicFile+" is empty ..."+ err);
                        else self.basicHash = JSON.parse(body);
                });
        },

        sendBasic: function(callback) {
                var self = this;
                self.basicHash.forEach(function(item, index) {
                    self._sendXplStat(item, 'radio.basic', '*');
                });
        },
            
        /*
         *  Plugin specifics functions
         */
        
        _puts: function puts(error, stdout, stderr) { 
                    sys.puts(stdout) ;
        },
              
        play: function (evt) {
                var self = this;				
                if (player.playing()) player.stop();
                player.play(evt.body.value);
                self._sendXplStat(evt.body, 'radio.basic', evt.header.source);
        },

        loop: function (evt) {
                var self = this;		
                player.play(evt.body.value, { repeat: true });
                self._sendXplStat(evt.body, 'radio.basic', evt.header.source);
        },

        timeLimit: function (evt) {
                var self = this;
                player.play(evt.body.value, { repeat: true, timeLimit: 0.25 });
                self._sendXplStat(evt.body, 'radio.basic', evt.header.source);
        },

        stop: function (evt) {
                var self = this;
                //if (player.playing()) {
                player.stop();
                self._sendXplStat(body, 'radio.basic', evt.header.source);
		//}
        }
}

for ( var m in proto) {
	wt.prototype[m] = proto[m];
}


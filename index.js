var xplradio = require("./lib/xpl-radio");
var schema_radiobasic = require('/etc/wiseflat/schemas/radio.basic.json');
var schema_radioconfig = require('/etc/wiseflat/schemas/radio.config.json');

var wt = new xplradio(null, {
        xplLog: false,
	forceBodySchemaValidation: false
});

wt.init(function(error, xpl) { 

	if (error) {
		console.error(error);
		return;
	}
        
	xpl.addBodySchema(schema_radiobasic.id, schema_radiobasic.definitions.body);
	xpl.addBodySchema(schema_radioconfig.id, schema_radioconfig.definitions.body);
	
        // Load config file into hash
        wt.readConfig();
        wt.readBasic();
        
        // Send every minutes an xPL status message 
        setInterval(function(){
                wt.sendConfig();
                wt.sendBasic();
        }, 60 * 1000);
                        
        xpl.on("xpl:radio.config", function(evt) {
                if(evt.headerName == 'xpl-cmnd') wt.writeConfig(evt);
        });
        
        xpl.on("xpl:radio.basic", function(evt) {
		if(wt.configHash.enable && evt.headerName == 'xpl-cmnd') {
			if(evt.body.command == 'play') wt.play(evt);
			if(evt.body.command == 'stop') wt.stop(evt);
			if(evt.body.command == 'loop') wt.loop(evt);
			if(evt.body.command == 'timelimit') wt.timeLimit(evt);
		}
        });
});


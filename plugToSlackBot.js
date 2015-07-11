// PlugToSlackBot v0.01

// TODO: set timeout to check back
// API.getTimeRemaining()

// TODO: after timeout, get new DJ/Media
// if things have changed, send POST to Slack, otherwise check back in another API.getTimeRemaining()

// TODO: send POST to Slack
/* $.ajax({
  type: 'post',
  url: 'https://hooks.slack.com/services/[stuff]',
  data: '{"text": "This is a test"}',  
  dataType: 'json'
}); */

var debug = true;

var SlackBot = function () {
    "use strict";
    var loaded = false, nextTimeout, currentData, newData, setup;
    
    this.pollPlug = function () {
        return {
            DJ: API.getDJ(),
            Media: API.getMedia()
        };
    };
    
    this.init = function () {
        this.currentData = this.pollPlug();
        this.nextTimeout = API.getTimeRemaining();
    };
    
    this.checkInit = function () {
        if (debug) { console.log("checking slackbot..."); }
        
        if (!this.loaded && API !== 'undefined' && $ !== 'undefined') {
            if (debug) { console.log("loading slackbot"); }
            
            this.init();
            
            this.loaded = true;
            
            clearInterval(this.setup);
            
            if (debug) {
                console.log("slackBot setup");
                console.info(this.currentData);
                console.info(this.nextTimeout);
            }
        }
    };
};

var sb = new SlackBot();
sb.setup = setInterval(function () { sb.checkInit(); }, 5000);
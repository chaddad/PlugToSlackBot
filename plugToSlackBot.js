// PlugToSlackBot v0.2

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
    var b = this, loaded = false, sendData = false, nextTimeout, currentData, newData, setup, updateTimeout;
    
    this.pollPlug = function () {
        return {
            DJ: API.getDJ(),
            Media: API.getMedia()
        };
    };
    
    this.init = function () {
        this.currentData = this.pollPlug();
        this.nextTimeout = API.getTimeRemaining() + 5;
        this.updateTimeout = this.resetTimeout();
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
    
    this.getUpdate = function () {
        this.newData = this.pollPlug();
        
        if (debug) {
            console.log("getting update from plug");
            console.info(this.newData);
        }
        
        var updated = false;
        
        if (this.currentData !== this.newData) {
            this.currentData = this.newData;
            
            updated = true;
            this.nextTimeout = API.getTimeRemaining() + 5;
            
            if (debug) { console.log("data doesn't match, refresh in " + this.nextTimeout); }
        } else {
            // data isn't fresh, reset updateTimeout
            
            if (debug) { console.log("data matches, refresh in 5s"); }
            this.nextTimeout = 5;
        }
         
        this.updateTimeout = this.resetTimeout();
        
        if (sendData && updated) {
            this.sendUpdate(currentData);
        }
    };
    
    this.resetTimeout = function () {
        return setTimeout(function () { b.getUpdate(); }, this.nextTimeout * 1000);
    };
    
    this.sendUpdate = function (data) {
        // TODO: send data to Slack
        //DJ.username, Media.author, Media.title
    };
};

var sb = new SlackBot();
sb.setup = setInterval(function () { sb.checkInit(); }, 5000);
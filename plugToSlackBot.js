// PlugToSlackBot v0.5

var debug = true;

var slackUrl = "https://your.slack.com/webhook";

var SlackBot = function () {
    "use strict";
    var b = this, loaded = false, nextTimeout, currentData, newData, setup, updateTimeout;
    
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
        this.sendUpdate();
        
        //this.getUpdate();
    };
    
    this.checkInit = function () {
        if (debug) { console.log("checking slackbot..."); }
        
        if (!this.loaded && API !== 'undefined' && $ !== 'undefined') {
            if (debug) { console.log("loading slackbot"); }
            
            this.init();
            
            this.loaded = true;
            
            clearInterval(this.setup);
            
            if (debug) {
                console.log("slackBot loaded - currentData and nextTimeout are");
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
            
            if (debug) { console.log("SUCCESS - data doesn't match, refresh in " + this.nextTimeout); }
        } else {
            // data isn't fresh, reset updateTimeout
            
            if (debug) { console.log("FAIL - data still matches, refresh in 5s"); }
            this.nextTimeout = 5;
        }
         
        this.updateTimeout = this.resetTimeout();
        
        if (debug) { console.log("updated: " + updated); }
        if (updated) {
            this.sendUpdate();
        }
    };
    
    this.resetTimeout = function () {
        return setTimeout(function () { b.getUpdate(); }, this.nextTimeout * 1000);
    };
    
    this.sendUpdate = function () {
        //DJ.username, Media.author, Media.title
        var t = "> " + this.currentData.DJ.username + " is spinning " + this.currentData.Media.title + " by " + this.currentData.Media.author, request = new XMLHttpRequest();
        
        if (debug) { console.log(t); }
        
        if (debug) { console.log("sending request to slack"); }
        request.open('post', slackUrl, true);
        request.send('{"text": "' + t + '"}');
    };
};

var sb = new SlackBot();
sb.setup = setInterval(function () { sb.checkInit(); }, 5000);
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

    };

    this.validTime = function(){    //setting window for no messages
        var tooEarlyHour = 8, tooEarlyMinute = 30; //8:30 AM
        var tooLateHour = 17, tooLateMinute = 30;  //5:30 PM

        var tooEarlyObject = new Date();
        tooEarlyObject.setHours(tooEarlyHour,tooEarlyMinute);

        var tooLateObject = new Date();
        tooLateObject.setHours(tooLateHour,tooLateMinute);


        var today = new Date();
        //between work hours then return true
        if(tooEarlyObject <= today && tooLateObject >= today){
            return true;
        }else{
            return false;
        }
    };


    //check if a weekday
    this.checkWeekday = function(){
        var today = new Date();
        if(today.getDay() === 0 || today.getDay() === 6){
            return false;
        }else{
            return true;
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
        if (updated && this.validTime && this.checkWeekday) {
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

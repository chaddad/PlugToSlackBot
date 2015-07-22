var debug = true, skipTimecheck = false;
var offsetSeconds = 5;
var slackUrl = "https://your.slack.com/webhook";
var DJ = (function () {
    function DJ() {
    }
    return DJ;
})();
var Media = (function () {
    function Media() {
    }
    return Media;
})();
var PlugData = (function () {
    function PlugData(DJ, Media) {
        this.DJ = DJ;
        this.Media = Media;
    }
    return PlugData;
})();
var SlackBot = (function () {
    function SlackBot() {
        this.sb = this;
        this.setup = setInterval(function () { this.sb.checkInitialize(); }, 5000);
    }
    SlackBot.prototype.pollPlug = function () {
        return new PlugData(API.getDJ(), API.getMedia());
    };
    SlackBot.prototype.checkInitialize = function () {
        if (debug) {
            console.log("checking slackbot...");
        }
        if (!this.loaded && API !== 'undefined' && $ !== 'undefined') {
            if (debug) {
                console.log("loading slackbot");
            }
            this.initialize();
            this.loaded = true;
            clearInterval(this.setup);
            if (debug) {
                console.log("slackBot loaded - currentData and nextTimeout are");
                console.info(this.currentData);
                console.info(this.nextTimeout);
            }
        }
    };
    SlackBot.prototype.initialize = function () {
        this.currentData = this.pollPlug();
        this.nextTimeout = API.getTimeRemaining() + offsetSeconds;
        this.updateTimeout = this.resetTimeout();
        this.sendUpdate();
    };
    SlackBot.prototype.validTime = function () {
        if (skipTimecheck) {
            return skipTimecheck;
        }
        var tooEarlyHour = 8, tooEarlyMinute = 30;
        var tooLateHour = 17, tooLateMinute = 30;
        var tooEarlyObject = new Date(), tooLateObject = new Date(), today = new Date();
        tooEarlyObject.setHours(tooEarlyHour, tooEarlyMinute);
        tooLateObject.setHours(tooLateHour, tooLateMinute);
        if (tooEarlyObject <= today && tooLateObject >= today) {
            return true;
        }
        else {
            return false;
        }
    };
    SlackBot.prototype.checkWeekday = function () {
        if (skipTimecheck) {
            return skipTimecheck;
        }
        var today = new Date();
        if (today.getDay() === 0 || today.getDay() === 6) {
            return false;
        }
        else {
            return true;
        }
    };
    SlackBot.prototype.getUpdate = function () {
        this.newData = this.pollPlug();
        if (debug) {
            console.log("getting update from plug");
            console.info(this.newData);
        }
        var updated = false;
        if (this.currentData !== this.newData) {
            this.currentData = this.newData;
            updated = true;
            this.nextTimeout = API.getTimeRemaining() + offsetSeconds;
            if (debug) {
                console.log("SUCCESS - data doesn't match, refresh in " + this.nextTimeout);
            }
        }
        else {
            if (debug) {
                console.log("FAIL - data still matches, refresh in " + offsetSeconds + "s");
            }
            this.nextTimeout = offsetSeconds;
        }
        this.updateTimeout = this.resetTimeout();
        if (debug) {
            console.log("updated: " + updated);
            console.log("skipTimecheck: " + skipTimecheck);
            console.log("validTime: " + this.validTime());
            console.log("checkWeekday: " + this.checkWeekday());
        }
        if (updated && this.validTime() && this.checkWeekday()) {
            this.sendUpdate();
        }
    };
    SlackBot.prototype.resetTimeout = function () {
        return setTimeout(function () { this.sb.getUpdate(); }, this.nextTimeout * 1000);
    };
    ;
    SlackBot.prototype.sendUpdate = function () {
        var t = "> " + this.currentData.DJ.username + " is spinning " + this.currentData.Media.title + " by " + this.currentData.Media.author;
        var request = new XMLHttpRequest();
        if (debug) {
            console.log(t);
        }
        if (debug) {
            console.log("sending request to slack");
        }
        request.open('post', slackUrl, true);
        request.send('{"text": "' + t + '"}');
    };
    return SlackBot;
})();
var sb = new SlackBot();

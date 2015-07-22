// declare placeholders for global variables
declare var console: any, API: any, $: any, clearInterval: any, Date: any, setTimeout: any, XMLHttpRequest: any, setInterval: any;

// PlugToSlackBot v0.6

var debug: boolean = true, skipTimecheck: boolean = false;
var offsetSeconds: number = 5;
var slackUrl: string = "https://your.slack.com/webhook";

class DJ {
  username: string;
}

class Media {
  title: string;
  author: string;
}

class PlugData {
  DJ: DJ;
  Media: Media;
  constructor(DJ:any, Media:any){
    this.DJ = DJ;
    this.Media = Media;
  }
}

class SlackBot {
  sb: SlackBot;
  loaded: boolean;
  nextTimeout: number;
  currentData: PlugData;
  newData: PlugData;
  setup;
  updateTimeout;

  // set reference to self, start setup loop
  constructor(){
    this.sb = this;
    this.setup = setInterval(function () { this.sb.checkInitialize(); }, 5000);
  }

  // return current Plug API data
  private pollPlug(): PlugData{
    return new PlugData(API.getDJ(), API.getMedia());
  }

  // checks every 1s to see if API and jQuery are loaded, and then calls initialize()
  private checkInitialize() {
    if (debug) { console.log("checking slackbot..."); }

    if (!this.loaded && API !== 'undefined' && $ !== 'undefined') {
        if (debug) { console.log("loading slackbot"); }

        this.initialize();

        this.loaded = true;

        clearInterval(this.setup);

        if (debug) {
            console.log("slackBot loaded - currentData and nextTimeout are");
            console.info(this.currentData);
            console.info(this.nextTimeout);
        }
    }
  }

  // gets the first set of data, sets the bot's loop, and sends update to Slack
  private initialize() {
    this.currentData = this.pollPlug();
    this.nextTimeout = API.getTimeRemaining() + offsetSeconds;
    this.updateTimeout = this.resetTimeout();
    this.sendUpdate();
  }

  // checks if the current update is within the specified daily time window
  private validTime():boolean {
      if (skipTimecheck) { return skipTimecheck; }

      // setting window for no messages - will not send unless between 8:30a and 5:30p
      var tooEarlyHour = 8, tooEarlyMinute = 30; // 08:30am
      var tooLateHour = 17, tooLateMinute = 30;  // 05:30pm
      var tooEarlyObject = new Date(), tooLateObject = new Date(), today = new Date();

      tooEarlyObject.setHours(tooEarlyHour, tooEarlyMinute);
      tooLateObject.setHours(tooLateHour, tooLateMinute);

      // if between work hours then return true
      if (tooEarlyObject <= today && tooLateObject >= today) {
          return true;
      } else {
          return false;
      }
  }

  // checks if the current update is within the specified days window
  private checkWeekday(): boolean {
      if (skipTimecheck) { return skipTimecheck; }

      var today = new Date();
      if (today.getDay() === 0 || today.getDay() === 6) {
          return false; // saturday or sunday
      } else {
          return true; // monday through friday
      }
  }

  // gets updated data from Plug, determines if data has changed and sends to Slack, or starts loop to check back in 5s
  private getUpdate(): void {
      this.newData = this.pollPlug();

      if (debug) {
          console.log("getting update from plug");
          console.info(this.newData);
      }

      var updated: boolean = false;

      if (this.currentData !== this.newData) {
          this.currentData = this.newData;

          updated = true;
          this.nextTimeout = API.getTimeRemaining() + offsetSeconds;

          if (debug) { console.log("SUCCESS - data doesn't match, refresh in " + this.nextTimeout); }
      } else {
          // data isn't fresh, reset updateTimeout

          if (debug) { console.log("FAIL - data still matches, refresh in " + offsetSeconds + "s"); }
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
  }

  // resets the bot's loop
  private resetTimeout() {
      return setTimeout(function () { this.sb.getUpdate(); }, this.nextTimeout * 1000);
  };

  // sends update to Slack
  private sendUpdate(): void {
      var t: string = "> " + this.currentData.DJ.username + " is spinning " + this.currentData.Media.title + " by " + this.currentData.Media.author;
      var request = new XMLHttpRequest();

      if (debug) { console.log(t); }

      if (debug) { console.log("sending request to slack"); }

      request.open('post', slackUrl, true);
      request.send('{"text": "' + t + '"}');
  }
}

var sb = new SlackBot();

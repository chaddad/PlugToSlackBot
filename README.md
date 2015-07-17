# PlugToSlackBot
A simple bot to run in your Plug.dj room that will send updates to a Slack chat when a new song comes on.
--

Current Release: v0.6

* On load, gets current DJ and Song info, and sends update to Slack
* Starts a setTimeout waiting for the current song (plus 5s) to end, and then polls for the next DJ and Song info
  * if things changed, send update to Slack, then wash, rinse, repeat
  * if things didn't change, go into a holding pattern checking every 5s until a change is detected, and then behave as above
* Doesn't send updates to Slack unless it's between 8:30a and 5:30p, M-F (aka don't spam the Slack channel over nights and weekends)
 * added global flag to control time check
 
TODOs:

* add interface buttons
  * toggle debug
  * toggle "afterhours" throttling
  * force skip
  * force update
* add plug chat interface
  * suppport for custom global /skip
* add two-way communication
*   support custom slack slash command to control bot

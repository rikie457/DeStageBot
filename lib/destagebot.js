'use strict';

var util = require('util');
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var DeStageBot = function Constructor(settings){
    this.settings = settings;
    this.settings.name = this.settings.name || 'destagebot';

    this.user = null;
    this.db = null;
};

DeStageBot.prototype.run = function(){
    DeStageBot.super_.call(this. this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

DeStageBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    //this._firstRunCheck();
};

DeStageBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

DeStageBot.prototype._connectDb = function () {
    this.db = mysql.createConnection({
        host: "www.tychoengberink.nl",
        user: "destagebot",
        password: "botstagede",
        db: 'destagebot'
    })

    this.db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
};

DeStageBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.query('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.query('INSERT INTO info(name, val) VALUES("lastrun", '+ currentTime +')');
        }

        // updates with new last running time
        self.db.query('UPDATE info SET val = '+ currentTime +' WHERE name = "lastrun"');
    });
};

DeStageBot.prototype._welcomeMessage = function () {
  this.postMessageToChannel(this.channels[0].name, 'Halloo ik ben de stagebot gemaakt in NodeJS helemaal door middel van klassen. Gemaakt door tycho natuurlijk', {as_user: true});
};

DeStageBot.prototype._onMessage = function (message) {
  if(this._isChatMessage(message) && this._isChannelConversation(message) && !this._isFromStageBot(message) && this._isMentioningStageBot(message)){
      this._replyMessage(message);
  }
};

DeStageBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

DeStageBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

DeStageBot.prototype._isFromStageBot = function (message) {
    return message.user === this.user.id;
};

DeStageBot.prototype._isMentioningStageBot = function (message) {
    return message.text.toLowerCase().indexOf('chuck norris') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

DeStageBot.prototype._replyMessage = function (originalMessage) {
    var self = this;
    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(channel.name, 'Tycho is baas', {as_user: true});
};

DeStageBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};


util.inherits(DeStageBot, Bot);

module.exports = DeStageBot;
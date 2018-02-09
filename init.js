'use strict';

var DeStageBot = require('../lib/destagebot');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var StageBot = new DeStageBot({
    token: token,
    name: name
});

StageBot.run();
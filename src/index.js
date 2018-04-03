'use strict';

const NUMBERS = {
  aTeam: [{ name: 'levi', value: 18053002970 }],
  bTeam: [{ name: 'levi2', value: 18053002970}],
  everyone: [{ name: 'levi3', value: 18053002970}]};

const
  NEXMO_KEY = process.env.NEXMO_KEY,
  NEXMO_SECRET = process.env.NEXMO_SECRET,
  NEXMO_PRIVATE = process.env.NEXMO_PRIVATE,
  NEXMO_APPID = process.env.NEXMO_APPID;

const axios = require('axios');
const Nexmo = require('nexmo');
const serial = require('asynckit/serial')
const parallel = require('asynckit/parallel')

const nexmo = new Nexmo({
  apiKey: NEXMO_KEY,
  apiSecret: NEXMO_SECRET,
  applicationId: NEXMO_APPID,
  privateKey: NEXMO_PRIVATE
}, {});

const slack = require('serverless-slack');

// The function that AWS Lambda will call
exports.handler = slack.handler.bind(slack);

// exports.nexmo = function (event, context, callback) {
//   const response = {
//     statusCode: 200,
//     body: ""
//   };
//   console.log("nexmo");
//   console.log(JSON.stringify(event));
//   callback(null, response);
// };

// exports.voice = function (event, context, callback) {
//   const response = {
//     statusCode: 200,
//     body:  {
//       "action": "talk",
//       "voiceName": "Russell",
//       "text": "Red alert! There has been an escalation.  Check the red alert channel for more information."
//     }
//   };
//   console.log("voice");
//   callback(null, response);
// };

  // supports full value, key, callback (shortcut) interface
  function asyncJob(item, cb)
  {
    // different delays (in ms) per item
    let delay = 1000;

    // pretend different jobs take different time to finish
    // and not in consequential order
    let timeoutId = setTimeout(function() {
      let result = pageNumber(item.value, item.message);
      cb(null, result);
    }, delay);

    // allow to cancel "leftover" jobs upon error
    // return function, invoking of which will abort this job
    return clearTimeout.bind(null, timeoutId);
  }


function pageNumber(number, message) {
  console.log("start")
  try {
    console.log(number);
    // nexmo.message.sendSms(12025168783,
    //                       number, "Redalert! Redalert! " + pager + " has turned on the bat-signal.  Check https://consensys.slack.com/messages/G7LEG8B97 for more information.",
    //                       (error, response) => { if(error) {
    //                                                throw error;
    //                                              } else if(response.messages[0].status != '0') {
    //                                                console.error(response);
    //                                                throw 'Nexmo returned back a non-zero status';
    //                                              } else {
    //                                                console.log(response);
    //                                              }
    //                                            });
    axios({
        method: 'post',
        url: 'https://rest.nexmo.com/sms/json',
        data: {
          api_key: NEXMO_KEY,
          api_secret: NEXMO_SECRET,
          to: number,
          from: 12025168783,
          text: message
        }
      });
  } catch (error) {
    console.error(error);
  }
}

// Slash Command handler
slack.on('/escalate', (msg, bot) => {
  let txt = msg.text + " ";

  let message = {
    text: "Whoa! Ok so the problem " + txt + "is serious enough to wake people up?  Who should be notified?",
    attachments: [{
      fallback: 'actions',
      callback_id: "group_click",
      actions: [
        { type: "button", name: "aTeam", text: "Infra", value: 0 },
        { type: "button", name: "bTeam", text: "Mobile", value: 1 },
        { type: "button", name: "everyone", text: "Everyone", value: 2 },
        { type: "button", name: "cancel", text: "Cancel", value: 3 }
      ]
    }]
  };

  // ephemeral reply
  bot.replyPrivate(message);
});

// Interactive Message handler
slack.on('group_click', (msg, bot) => {
  console.log(JSON.stringify(msg))
  //page the appropriate team by SMS.
  let numbers = [];
  switch (msg.actions[0].value) {
  case '0':
    numbers = NUMBERS['aTeam'];
    break;
  case '1':
    numbers = NUMBERS['bTeam'];
    break;
  case '2':
    numbers = NUMBERS['aTeam'] + NUMBERS['bTeam'];
    break;
  case '3':
    numbers = [];
    break;
  default:
    numbers = [];
  }

  for (var i = 0, len = numbers.length; i < len; i++) {
    numbers[i]["message"] = "Hey " + numbers[i].name + "! Redalert! " + msg.user.name + " has turned on the bat-signal. Check slack for more information."
  }

  let message = {
    text: "An issue has been escalated.  If nobody responds in 5 minutes, try again."
  };

  parallel(numbers, asyncJob, function(err, result) {
    if(err){
      console.log(err);
    } else if(result){
      console.log(result);
    }
    bot.reply(message);
    console.log('finish');
  });

  // page the team by voice call
  // axios ({
  //   method: 'post',
  //   url: 'https://api.nexmo.com/v1/calls',
  //   responseType: 'json',
  //   headers: {"Authorization": "Bearer ${NEXMO_JWT}",
  //             "Content-Type": "application/json"},
  //   data: {
  //     answer_url: ['https://brttsvnb5a.execute-api.us-east-1.amazonaws.com/dev/voice'],
  //     to: [{ type: 'phone', number: 18053002970 }],
  //     from: { type: 'phone', number: 120251687783 }
  //   }
  // }).then(function(response) {
  //   console.log(JSON.stringify(response.data));
  // });
});

//Reaction Added event handler
slack.on('reaction_added', (msg, bot) => {
  bot.reply({
    text: ':wave:'
  });
});

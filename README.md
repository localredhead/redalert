![](https://vignette.wikia.nocookie.net/memoryalpha/images/6/6b/RedAlert.jpg/revision/latest?cb=20100117050244&path-prefix=en)

### Requirements:

- Nexmo w/ API keys.
- Slack w/ API keys.
- Slack application created.
- AWS account for deployment.

### Installation

1. Create slack app
2. Create a slash command "/escalate"
3. sls deploy
4. Take the POST url, and create an interactive command in slack app.
5. Create a bot user for the slack app. Name it "redalert"
6. Go to the GET command provided by sls-deploy and authorize the app, or run `sls info` to see the URL again
7. test

### Adding phone numbers

1. Edit the source code `src/index.js`.  There is an object defined called `NUMBERS`.
2. Add each number as a new object in an array.  [{name: <person> value: <number>}].
3. Save changes and `sls deploy`.  Phone numbers are now live.

### Troublshooting:

Add console.log statements > `sls deploy` > run the following to see logging output.
```sls logs --service redalert --region us-east-1 --function slack -t```


### Future upgrades:

1. Voice calling.
2. Phased escalation from SMS > VOICE.
3. API or some way of adding phone numbers without modifying source code.

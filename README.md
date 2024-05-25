# Cognition-Hackathon
The opensoulcode directory is for sandbox code and setting up the soul.
The call-llm was taken from the eleven public repo and then modified to use the new soul code.

The goal is to link up witn this (repo)[https://github.com/elevenlabs/elevenlabs-examples/blob/main/examples/twilio/call-llm/src/llm.ts]



1. Init the Soul
# then CD into the samantha-learns example soul.
cd opensoulscode/customer-service-broker
# and npm install
npm install
# and then run samantha
npx soul-engine dev
2. Got from this guide https://elevenlabs.io/docs/api-reference/integrating-with-twilio

How to send an AI message through a phone call using Twilio and ElevenLabs in Node.js
In this guide, you’ll learn how to send an AI generated message through a phone call using Twilio and ElevenLabs. This process allows you to send high-quality voice messages directly to your callers.

Create accounts with Twilio, ngrok, and eleven labs
We’ll be using Twilio and ngrok for this guide, so go ahead and create accounts with them.

twilio.com
ngrok.com
​

# .env
SERVER_DOMAIN=
E
);
​
Point ngrok to your application
Twilio requires a publicly accessible URL. We’ll use ngrok to forward the local port of our application and expose it as a public URL.

Run the following command in your terminal:


ngrok http 4000
Copy the ngrok domain (without https://) to use in your environment variables.


Update your environment variables
Update the .env file with your ngrok domain and ElevenLabs API key.


# .env
SERVER_DOMAIN=*******.ngrok.app
ELEVENLABS_API_KEY=*************************
​
Start the application
Run the following command to start the app:

npm run dev
​
Set up Twilio
Follow Twilio’s guides to create a new number. Once you’ve created your number, navigate to the “Configure” tab in Phone Numbers -> Manage -> Active numbers

In the “A call comes in” section, enter the full URL to your application (make sure to add the/call/incoming path):

E.g. https://*******ngrok.app/call/incoming
​
Make a phone call
Make a call to your number. You should hear a message using the ElevenLabs voice.



### Future Guidance
Add in a way to call this number in such a way that it will connect this call with another call so that outbound calls can be made


That will create this flow
![photo](./voice_chat_sequence_diagram.png)


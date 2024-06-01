# Fractal Tech Hackathon
I got the ball rolling on this voice bot project during a congtion hackathon at Betaworks because, well, I thought it'd be pretty awesome. But ran out of steam. Because, honestly, I still think it's a cool idea, and I believe in it. So I tried to finish it here.


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


ngrok http 2000
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



## Diagrams

### Sequence Diagram
That will create this flow
``` mermaid
sequenceDiagram   
    participant User
    participant Twilio
    participant Backend
    participant Gladia
    participant OpenSouls
    participant ElevenLabs

    User->>Twilio: Initiates Call
    Twilio->>Backend: WebSocket Connection
    Backend->>Gladia: Send Raw Audio
    Gladia->>Backend: Return Transcribed Text
    Backend->>OpenSouls: Send Text
    OpenSouls->>Backend: Return AI Response
    Backend->>ElevenLabs: Send Text for Speech Conversion
    ElevenLabs->>Backend: Return Speech
    Backend-xTwilio: Send Speech Response
```

### C4 Diagrams

#### Context
``` mermaid
C4Context
   title System Context Diagram

    Person(User, "User", "Calls the voice bot for interaction")

    System(Twilio, "Twilio", "Handles the call and forwards it to the backend")
    System(Backend, "Backend", "Processes audio and text, orchestrates the flow")
    System(Gladia, "Gladia", "Transcribes audio to text")
    System(OpenSouls, "OpenSouls", "Generates AI responses based on text input")
    System(ElevenLabs, "ElevenLabs", "Converts text to speech")

    Rel(User, Twilio, "Initiates Call")
    Rel(Twilio, Backend, "WebSocket Connection")
    Rel(Backend, Gladia, "Send Raw Audio")
    Rel(Gladia, Backend, "Return Transcribed Text")
    Rel(Backend, OpenSouls, "Send Text")
    Rel(OpenSouls, Backend, "Return AI Response")
    Rel(Backend, ElevenLabs, "Send Text for Speech Conversion")
    Rel(ElevenLabs, Backend, "Return Speech")
    Rel(Backend, Twilio, "Send Speech Response")
    Rel(Twilio, User, "Respond with AI Generated Speech")
```

#### Container
``` mermaid
C4Container
    title Container Diagram

    Person(User, "User", "Calls the voice bot for interaction")

    Container(Twilio, "Twilio", "Handles the call and forwards it to the backend", "Voice Call Service")
    Container(Backend, "Backend", "Processes audio and text, orchestrates the flow", "Node.js")
    Container(Gladia, "Gladia", "Transcribes audio to text", "Audio Transcription Service")
    Container(OpenSouls, "OpenSouls", "Generates AI responses based on text input", "AI Response Service")
    Container(ElevenLabs, "ElevenLabs", "Converts text to speech", "Text to Speech Service")

    Rel(User, Twilio, "Initiates Call")
    Rel(Twilio, Backend, "WebSocket Connection")
    Rel(Backend, Gladia, "Send Raw Audio")
    Rel(Gladia, Backend, "Return Transcribed Text")
    Rel(Backend, OpenSouls, "Send Text")
    Rel(OpenSouls, Backend, "Return AI Response")
    Rel(Backend, ElevenLabs, "Send Text for Speech Conversion")
    Rel(ElevenLabs, Backend, "Return Speech")
    Rel(Backend, Twilio, "Send Speech Response")
    Rel(Twilio, User, "Respond with AI Generated Speech")
```

#### Container
``` mermaid
C4Component
    title Component Diagram for the Backend

   
        Component(AudioProcessor, "Audio Processor", "Handles audio processing tasks", "Node.js Module")
        Component(TextProcessor, "Text Processor", "Handles text processing tasks", "Node.js Module")
        Component(WorkflowOrchestrator, "Workflow Orchestrator", "Coordinates the flow between components", "Node.js Module")

        Rel(AudioProcessor, Gladia, "Send Raw Audio")
        Rel(Gladia, AudioProcessor, "Return Transcribed Text")
        Rel(AudioProcessor, TextProcessor, "Send Transcribed Text")
        Rel(TextProcessor, OpenSouls, "Send Text")
        Rel(OpenSouls, TextProcessor, "Return AI Response")
        Rel(TextProcessor, AudioProcessor, "Send AI Response")
        Rel(AudioProcessor, ElevenLabs, "Send Text for Speech Conversion")
        Rel(ElevenLabs, AudioProcessor, "Return Speech")
        Rel(WorkflowOrchestrator, AudioProcessor, "Coordinate Processing")
        Rel(WorkflowOrchestrator, TextProcessor, "Coordinate Processing")
        Rel(WorkflowOrchestrator, Twilio, "Send Speech Response")
    
```

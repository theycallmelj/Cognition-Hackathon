import express, { Response } from 'express';
import ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { Llm } from './llm';
import { Stream } from './stream';
import { TextToSpeech } from './text-to-speech';


const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000')
const SAMPLE_RATE = 8000


export const startApp = () => {
  const llm = new Llm();
  const webSocket = require('ws')
  const gladiaKey = process.env.GLADIA_API_KEY
  const gladiaUrl = "wss://api.gladia.io/audio/text/audio-transcription"
  const wsTranscription = new webSocket(gladiaUrl)
  wsTranscription.on("open", () => {
    const configuration = {
      x_gladia_key: gladiaKey,
      language_behaviour: "automatic single language",
      sample_rate: SAMPLE_RATE,
      encoding: "WAV/ULAW",
      model_type: "accurate",
      audio_enhancer: true
    }
    wsTranscription.send(JSON.stringify(configuration))
  })
  wsTranscription.on("message", (event : String) => {
    if (!event) return
    const utterance = JSON.parse(event.toString())
    if (!Object.keys(utterance).length) {
      console.log("Empty ...")
      return
    }
  
    if (utterance.event === "connected") {
      console.log(`${utterance.event} sucessfully with Connection id: ${utterance.request_id} `)
    }
    else if (utterance.event === "transcript" && utterance.transcription) {
      try {
        console.log(JSON.stringify(utterance, null, 2))
        if(utterance.type === "final") {
          console.log(`Transcription – STT -> LLM: ${utterance.transcription}`.yellow);
          llm.completion(utterance.transcription)
        }
      } catch (error) {
        console.error('Error in transcription:', error);
      }
    }
  })

  app.post('/call/incoming', (_, res: Response) => {
    const twiml = new VoiceResponse();

    twiml.connect().stream({
      url: `wss://${process.env.SERVER_DOMAIN}/call/connection`,
    });

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

  app.ws('/call/connection', (ws: WebSocket) => {
    console.log('Twilio -> Connection opened'.underline.green);

    ws.on('error', (error) => console.error('WebSocket error:', error));
    ws.on('close', () => console.log('WebSocket connection closed'));

    const stream = new Stream(ws);
    const textToSpeech = new TextToSpeech();

    let streamSid: string;
    let callSid: string;
    let marks: string[] = [];

    ws.on('message', (data: string) => {
      const message: {
        event: string;
        start?: { streamSid: string; callSid: string };
        media?: { payload: string };
        mark?: { name: string };
        sequenceNumber?: number;
      } = JSON.parse(data);

      if (message.event === 'start' && message.start) {
        streamSid = message.start.streamSid;
        callSid = message.start.callSid;
        stream.setStreamSid(streamSid);
        llm.setCallSid(callSid);
        console.log(
          `Twilio -> Starting Media Stream for ${streamSid}`.underline.red,
        );
        textToSpeech.generate({
          partialResponseIndex: null,
          partialResponse: 'Hi, Liam. How can I help you?',
        });
      } else if (message.event === 'media' && message.media) {
        wsTranscription.send(JSON.stringify({ frames: message.media.payload }))
      } else if (message.event === 'mark' && message.mark) {
        const label: string = message.mark.name;

        console.log(
          `Twilio -> Audio completed mark (${message.sequenceNumber}): ${label}`
            .red,
        );
        marks = marks.filter((m: string) => m !== message.mark?.name);
      } else if (message.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      }
    });

    llm.on('llmreply', async (llmReply: { partialResponse: string }) => {
      console.log(`LLM -> TTS: ${llmReply.partialResponse}`.green);
      textToSpeech.generate({
        partialResponseIndex: null,
        partialResponse: llmReply.partialResponse,
      })
    });

    textToSpeech.on(
      'speech',
      (responseIndex: number, audio: string, label: string) => {
        console.log(`TTS -> TWILIO: ${label}`.blue);
        stream.buffer(responseIndex, audio);
      },
    );

    stream.on('audiosent', (markLabel: string) => {
      marks.push(markLabel);
    });
  });

  app.listen(PORT, () => {
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Remote: https://${process.env.SERVER_DOMAIN}`);
  });
};

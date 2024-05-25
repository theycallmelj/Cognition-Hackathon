import express, { Response } from 'express';
import ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { Llm } from './llm';
import { Stream } from './stream';
import { TextToSpeech } from './text-to-speech';
import {OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');


const openai = new OpenAI();

export const startApp = () => {
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

    const llm = new Llm();
    const stream = new Stream(ws);
    const textToSpeech = new TextToSpeech();

    let streamSid: string;
    let callSid: string;
    let marks: string[] = [];
    const audioChunks: Buffer[] = [];

    // Path to save the audio file
    const audioFilePath = path.join(__dirname, 'audio.wav');

    // Function to process the audio file with OpenAI STT
    const processAudio = async (filePath: string) => {
      try {
        
        const audioBuffer = Buffer.from(
          fs.readFileSync(filePath));
        const transcription = await openai.audio.transcriptions.create({
          file: new File([new Blob([audioBuffer])], "input.wav", { type: "audio/wav" }),
          model: 'whisper-1', // Use the appropriate model name
          response_format: 'text',
        });
        console.log(`Transcription – STT -> LLM: ${transcription.text}`.yellow);
        llm.completion(transcription.text);
      } catch (error) {
        console.error('Error in OpenAI transcription:', error);
      }
    };

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
          partialResponse: 'Hi, my name is Eleven. How can I help you?',
        });
      } else if (message.event === 'media' && message.media) {
        const audioData = Buffer.from(message.media.payload, 'base64');
        audioChunks.push(audioData);
        fs.appendFileSync(audioFilePath, audioData);
      } else if (message.event === 'mark' && message.mark) {
        const label: string = message.mark.name;

        console.log(
          `Twilio -> Audio completed mark (${message.sequenceNumber}): ${label}`
            .red,
        );
        marks = marks.filter((m: string) => m !== message.mark?.name);
      } else if (message.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
        processAudio(audioFilePath);
      }
    });

    llm.on('llmreply', async (llmReply: { partialResponse: string }) => {
      console.log(`LLM -> TTS: ${llmReply.partialResponse}`.green);
      textToSpeech.generate(llmReply);
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

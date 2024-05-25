import EventEmitter from 'events';

import { Soul, said } from "@opensouls/soul";

export class Llm extends EventEmitter {
  private soul: Soul;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userContext: any[];

  constructor() {
    console.log("soul")
    super();
    this.soul = new Soul({
      organization: "capsaicinkidliamjohnston",
      blueprint: "customer-service-broker",
    });
    this.soul.connect().then(async () => {
      console.log("connected");
    });
    this.userContext = [];
    //callback for completion
    this.soul.on("says", async ({ content }) => {
      this.emit('llmreply', 1, await content());
    });
    
  }

  // Add the callSid to the chat context in case
  // LLM decides to transfer the call.
  setCallSid(callSid: string) {
    this.userContext.push({ role: 'system', content: `callSid: ${callSid}` });
  }

  updateUserContext(name: string, role: string, text: string) {
    if (name !== 'user') {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  async completion(text: string, role = 'user', name = 'user') {
    this.updateUserContext(name, role, text);
    console.log("Test")
    this.soul.dispatch(said("User", text)); 
    this.userContext.push({ role: 'assistant', content: this.userContext + text});
    console.log(`LLM -> user context length: ${this.userContext.length}`.green);
  }
}

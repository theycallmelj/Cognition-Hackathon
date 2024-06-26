import EventEmitter from 'events';
import { Soul, said } from "@opensouls/soul";

export class Llm extends EventEmitter {
  private soul: Soul;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userContext: any[];

  constructor() {
    console.log("Initializing Soul...");
    super();
    this.soul = new Soul({
      organization: "capsaicinkidliamjohnston",
      blueprint: "liamgpt",
    });
    this.userContext = [];

    this.initializeSoul();
  }
  initState =0;

  async initializeSoul() {
    if(this.initState === 0) {
      try {
        await this.soul.connect();
        console.log("Connected to Soul");
  
        this.soul.on("says", async ({ content }) => {
          try {
            const text = await content();
            console.log("Soul says:", text);
            this.emit('llmreply', { partialResponse: text });
          } catch (error) {
            console.error("Error handling 'says' event:", error);
          }
        });
  
      } catch (error) {
        console.error("Error connecting to Soul:", error);
      }
      this.initState = 1
    }
    
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
  async sendMessage (text : string) {
    await this.soul.dispatch(said("User", text)); 
    this.userContext.push({ role: 'assistant', content: text });
    console.log(`LLM -> user context length: ${this.userContext.length}`.green);
  }

  async completion(text: string, role = 'user', name = 'user') {
    try {
      this.updateUserContext(name, role, text);
      if(text && this.initState == 1) {
        try{
          await this.sendMessage(text);
        }
        catch(e){
          
          console.log("eerror")
          await this.soul.connect();
          await this.sendMessage(text);
        }
      
      }
    } catch (error) {
      console.error("Error in completion method:", error);
    }
  }
}

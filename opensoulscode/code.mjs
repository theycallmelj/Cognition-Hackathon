import { Soul, said } from "@opensouls/soul";
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const soul = new Soul({
  organization: "capsaicinkidliamjohnston",
  blueprint: "customer-service-broker",
});

soul.on("says", async ({ content }) => {
  console.log("Soul said", await content());
  askUserInput(); // After Soul's response, prompt for user input again
});

async function askUserInput() {
  rl.question("Enter your message: ", async (message) => {
    soul.dispatch(said("User", message));
  });
}

soul.connect().then(async () => {
  askUserInput(); // Start by asking for user input
});

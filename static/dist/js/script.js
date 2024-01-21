function cloneAnswerBlock() {
  const output = document.querySelector("#gpt-output");
  const template = document.querySelector('#chat-template');
  const clone = template.cloneNode(true);
  clone.id = "";
  output.appendChild(clone);
  clone.classList.remove("hidden")
  return clone.querySelector(".message");
}


function addToLog(message) {
  let answerBlock = cloneAnswerBlock();
  answerBlock.textContent = message;
  return answerBlock
}



function getChatHistory() {
  const messageBlocks = document.querySelectorAll(".message:not(#chat-template .message)")
  return Array.from(messageBlocks).map(block => block.innerHTML)
}



async function fetchPromptResponse() {
  const response = await fetch("/prompt", { //url de la route en python
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({messages: getChatHistory()}),
  });

  return response.body.getReader();
}


async function readResponseChunks(reader, gptanswer) {
  const decoder = new TextDecoder();
  const converter = new showdown.Converter();

  let chunks = "";
  while (true) {
      const {done, value} = await reader.read();
      if (done) {
          break;
      }
      chunks += decoder.decode(value);
      gptanswer.innerHTML = converter.makeHtml(chunks);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#prompt-form");
  const spinnerIcon = document.querySelector("#spinner-icon");
  const sendIcon = document.querySelector("#send-icon");

  form.addEventListener("submit", async (event) => {
      event.preventDefault(); //Empeche l'envoie du formulaire
      spinnerIcon.classList.remove("hidden");
      sendIcon.classList.add("hidden");

      const prompt = form.elements.prompt.value; //recup la valeur de l'input
      addToLog(prompt); //ajoute les messages au block
      form.elements.prompt.value = ""

      try {
          const gptOutput = addToLog("GPT est en train de réfléchir...");
          const reader = await fetchPromptResponse(prompt);
          await readResponseChunks(reader, gptOutput);
      } catch (error) {
          console.error('Une erreur est survenue:', error);
      } finally {
          spinnerIcon.classList.add("hidden");
          sendIcon.classList.remove("hidden");
          hljs.highlightAll();
      }
  });
});

import os
import openai
from dotenv import load_dotenv
from flask import Flask, render_template, request, Response

load_dotenv()

openai.api_key = os.getenv("KEY_OPEN_AI")

app = Flask(__name__)


@app.route("/")
def home():
    return render_template('index.html')



@app.route("/prompt", methods=["POST"])
def prompt():
    messages = request.json["messages"]
    conversation = build_conversation_dict(messages)

    return Response(event_stream(conversation), mimetype="text/event-sream")



def build_conversation_dict(messages: list) -> list[dict]:
    return [
        {"role": "user" if i % 2 == 0 else "assistant", "content": message}
        for i, message in enumerate(messages)
    ]


def event_stream(conversation: list[dict]) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation,
        stream=True
    )

    for line in response:
        text = line.choices[0].delta.get('content', '')
        if len(text):
            yield text


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
    conversation = build_conversation_dict(messages=["bonjour", "hola"])
    print(event_stream(conversation))

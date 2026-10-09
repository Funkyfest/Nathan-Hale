# Study pack — listen, then quiz yourself

Two ways to digest the Data Center Design guide away from the screen.

## 1. Listen: the podcast

`../podcast/inside-the-ai-factory.mp3` is a 27-minute, two-host walkthrough of the whole guide, in the same order as its nine parts. It has embedded chapter markers, so any podcast app or player that reads ID3 chapters (Apple Podcasts via "import file", Pocket Casts, VLC, Overcast, iOS Files) lets you jump between parts. The eleven chapter files in `../podcast/chapters/` are the same audio split up, if you prefer one file per topic.

The transcript is in `../podcast/transcript.md`. The voices are synthetic (Kokoro, an open-source text-to-speech model), so expect a few odd pronunciations of brand names.

Note: LM Studio runs language models; it does not play audio. Use any music or podcast app for the MP3, and use LM Studio for the part below.

## 2. Quiz yourself: the guide inside LM Studio

LM Studio can answer questions from documents you attach to a chat (it calls this RAG: the model reads the relevant passages before answering). Setup:

1. In LM Studio, download a chat model. Anything 7B or larger with an 8k+ context works well (for example a Llama 3.1 8B, Qwen 2.5 7B or Gemma 2 9B instruct build).
2. Start a new chat. Paste the contents of `system-prompt.txt` into the system prompt field (the "Settings" panel on the right in recent versions).
3. Attach `data-center-design-knowledge.md` to the chat with the paperclip / "attach file" button. This single file contains the full guide plus the podcast transcript, so the model has both the precise numbers and the conversational explanations.
4. Ask questions, or paste one of the prompts from `quiz-prompts.md`.

Tips:

- Raise the context length in the model's load settings to 8192 or more so the retrieved passages fit.
- If the model answers from general knowledge instead of the guide, ask it to "quote the passage you used". The system prompt tells it to do this, but smaller models sometimes forget.
- `data-center-design-knowledge.md` is plain Markdown, so it also works with any other local-RAG tool (Open WebUI, AnythingLLM, GPT4All, Msty).

## Files

| File | Purpose |
|---|---|
| `data-center-design-knowledge.md` | Guide + podcast transcript in one file, for attaching to a chat |
| `system-prompt.txt` | Turns the model into a tutor that quizzes you from the guide |
| `quiz-prompts.md` | Ready-made prompts: quizzes, explain-like-I'm-new, mock interview, number drills |
| `study-pack.zip` | Everything above plus the MP3, for copying to a phone |

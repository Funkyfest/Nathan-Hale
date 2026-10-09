#!/usr/bin/env python3
"""Turn script.txt into a two-voice podcast with Kokoro TTS (runs offline on CPU).

Outputs in docs/podcast/:
  inside-the-ai-factory.mp3   full episode with ID3 chapter markers
  chapters/NN-<id>.mp3        one file per chapter (used by the web player)
  timeline.json               chapter + line timings for a synced transcript
  transcript.md               readable transcript

Setup: pip install kokoro-onnx soundfile imageio-ffmpeg
Model files (kokoro-v1.0.onnx, voices-v1.0.bin) from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Usage: python3 synthesize.py --models /path/to/model/dir
"""
import json, pathlib, re, subprocess, sys

import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
VOICES = {"MAYA": ("af_heart", 1.0), "SAM": ("am_michael", 1.02)}
SR = 24000
TURN_GAP, SENT_GAP, CHAPTER_GAP = 0.32, 0.14, 1.1
# spoken forms for words the engine mispronounces; the transcript keeps the written form
SAY = {r"\bxAI's\b": "ex A I's", r"\bxAI\b": "ex A I", r"\bUPS\b": "U P S", r"\bGB two hundred\b": "G B two hundred",
       r"\bOdense\b": "Oh-then-seh", r"\bTPU\b": "T P U", r"\bNVLink\b": "N V link", r"\bNVL\b": "N V L",
       r"\bU\.S\.": "U S", r"\bCPUs\b": "C P Us", r"\bCPU\b": "C P U", r"\bGPUs\b": "G P Us", r"\bGPU\b": "G P U"}


def parse(path):
    chapters, cur = [], None
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("# "):
            continue
        if line.startswith("## "):
            cid, title, anchor = [p.strip() for p in line[3:].split("|")]
            cur = {"id": cid, "title": title, "anchor": anchor, "lines": []}
            chapters.append(cur)
            continue
        who, text = line.split(":", 1)
        cur["lines"].append({"speaker": who.strip(), "text": text.strip()})
    return chapters


def spoken(text):
    for pat, rep in SAY.items():
        text = re.sub(pat, rep, text)
    return text


def sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+", text) if s]


def silence(sec):
    return np.zeros(int(sec * SR), dtype=np.float32)


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def to_mp3(wav, mp3, meta=None):
    cmd = [ffmpeg(), "-y", "-loglevel", "error", "-i", str(wav)]
    if meta:
        cmd += ["-i", str(meta), "-map_metadata", "1", "-id3v2_version", "3"]
    cmd += ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "64k", str(mp3)]
    subprocess.run(cmd, check=True)


def main():
    from kokoro_onnx import Kokoro
    mdir = pathlib.Path(sys.argv[sys.argv.index("--models") + 1]) if "--models" in sys.argv else HERE
    k = Kokoro(str(mdir / "kokoro-v1.0.onnx"), str(mdir / "voices-v1.0.bin"))
    chapters = parse(HERE / "script.txt")
    out = HERE / "chapters"; out.mkdir(exist_ok=True)
    tmp = HERE / ".tmp"; tmp.mkdir(exist_ok=True)
    full, t, timeline = [], 0.0, []
    for ci, ch in enumerate(chapters):
        parts, ct = [], 0.0
        entry = {"id": ch["id"], "title": ch["title"], "anchor": ch["anchor"], "start": round(t, 2), "lines": [],
                 "file": f"chapters/{ci:02d}-{ch['id']}.mp3"}
        for li, ln in enumerate(ch["lines"]):
            voice, speed = VOICES[ln["speaker"]]
            start = ct
            for s in sentences(spoken(ln["text"])):
                a, sr = k.create(s, voice=voice, speed=speed, lang="en-us")
                assert sr == SR
                parts += [a.astype(np.float32), silence(SENT_GAP)]
                ct += len(a) / SR + SENT_GAP
            parts.append(silence(TURN_GAP)); ct += TURN_GAP
            entry["lines"].append({"speaker": ln["speaker"], "text": ln["text"], "start": round(start, 2), "end": round(ct, 2)})
        audio = np.concatenate(parts)
        sf.write(tmp / f"{ci:02d}.wav", audio, SR)
        to_mp3(tmp / f"{ci:02d}.wav", HERE / entry["file"])
        entry["duration"] = round(len(audio) / SR, 2)
        timeline.append(entry)
        full += [audio, silence(CHAPTER_GAP)]
        t += len(audio) / SR + CHAPTER_GAP
        print(f"[{ci + 1}/{len(chapters)}] {ch['title']}: {entry['duration'] / 60:.1f} min", flush=True)
    sf.write(tmp / "full.wav", np.concatenate(full), SR)
    meta = [";FFMETADATA1", "title=Inside the AI Factory", "artist=Data Center Design guide", "album=Data Center Design", "genre=Podcast"]
    for e in timeline:
        meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(e['start'] * 1000)}", f"END={int((e['start'] + e['duration']) * 1000)}", f"title={e['title']}"]
    (tmp / "meta.txt").write_text("\n".join(meta) + "\n")
    to_mp3(tmp / "full.wav", HERE / "inside-the-ai-factory.mp3", tmp / "meta.txt")
    (HERE / "timeline.json").write_text(json.dumps({"title": "Inside the AI Factory", "duration": round(t, 2), "chapters": timeline}, indent=1))
    md = ["# Inside the AI Factory — transcript", ""]
    for e in timeline:
        md += [f"## {e['title']}  ({int(e['start'] // 60)}:{int(e['start'] % 60):02d})", ""]
        md += [f"**{l['speaker'].title()}:** {l['text']}\n" for l in e["lines"]]
    (HERE / "transcript.md").write_text("\n".join(md))
    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()
    print(f"done: {t / 60:.1f} min")


if __name__ == "__main__":
    main()

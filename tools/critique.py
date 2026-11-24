#!/usr/bin/env python3
"""
Design critique on your own NVIDIA credit, not Claude's.

    python3 tools/critique.py shot.png
    python3 tools/critique.py shot.png --kind app
    python3 tools/critique.py shot.png --fix          # output as a work list

Takes a screenshot of a screen you have built and returns specific, ordered
fixes. It is meant for the boring half of design review — spacing, hierarchy,
contrast, touch targets — so the expensive model is left for the half that
needs judgement.

It never says the design is good. Praise is not actionable.

Treat the output as a checklist to argue with, not a verdict. It is a cheap
model looking at one still image: it cannot see hover, scroll or motion, and
roughly one point in three will be wrong. The wrong ones are obvious.

Requires the NVIDIA endpoint to be reachable. In this container the proxy
supplies the key; elsewhere set NVIDIA_API_KEY.
"""
import argparse, base64, datetime, json, os, re, subprocess, sys, urllib.request, urllib.error

ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"

# Checked 2026-11-24: this is the only vision model in the catalogue that
# answers. cosmos-reason2-8b is listed but returns 404.
VISION_MODELS = ["nvidia/nemotron-3.5-super-vl-120b-a12b"]

# It is a reasoning model and spends most of its budget thinking. Below about
# 4000 tokens it never reaches an answer and returns an empty message. The
# "thinking off" flags other Nemotron models accept are ignored here.
DEFAULT_MAX_TOKENS = 6000

# The method, in the order it is applied. Taken from how app redesigns are
# actually done: make the important thing bigger, show fewer things, give the
# screen one obvious action, and let everything else recede.
METHOD = """You judge a screen against this method, in this order of importance:

1. ONE JOB. A screen has one thing the person came to do. That thing should be
   the largest, highest-contrast element. If two things compete, the screen has
   no primary action.
2. SIZE CARRIES MEANING. The most important content (artwork, hero image, the
   price, the answer) should be visibly larger than everything else. Timid
   sizing is the most common fault.
3. FEWER THINGS. Cutting the number of items on screen almost always improves
   it. Density is not richness.
4. SECONDARY ACTIONS RECEDE. They become icons, or quiet text, never a second
   filled button.
5. SPACING IS A SYSTEM. Gaps come from one scale (multiples of 4 or 8). Uneven
   or arbitrary gaps read as careless.
6. TYPE IS A SYSTEM. Two faces at most, few sizes, hierarchy by weight and
   colour before size. Body text 15-17px, line height around 1.5, line length
   45-90 characters.
7. COLOUR IS A SYSTEM. One accent, used for the primary action and little else.
   Neutrals tinted slightly toward the accent, never flat grey. Body text at
   least 4.5:1 against its background.
8. TOUCH TARGETS. Anything tappable is at least 44px tall on a phone.
9. ALIGNMENT. Edges line up on a shared grid. Ragged left edges are visible
   from across a room.
10. NOTHING PLACEHOLDER. Lorem text, stock-looking filler, default shadows and
    identical rounded cards everywhere all read as unfinished."""

TELLS = """Signs the screen was generated rather than designed, which you must
call out by name if present: the Inter typeface with an indigo-to-purple
gradient; three equal rounded cards in a row; an emoji used as an icon; the
same border radius and drop shadow on every element; a centred hero with a
headline, a subheading and two buttons; glassy cards floating over colour
blobs; an eyebrow label above every single heading."""


def encode(path: str, width: int = 900) -> str:
    """Downscale so the request stays small; detail beyond ~900px adds nothing."""
    tmp = "/tmp/_critique_resized.jpg"
    try:
        subprocess.run(["convert", path, "-resize", f"{width}x>", "-quality", "82", tmp],
                       check=True, capture_output=True)
        data = open(tmp, "rb").read()
    except (subprocess.CalledProcessError, FileNotFoundError):
        data = open(path, "rb").read()          # send it as-is if there is no resizer
    return base64.b64encode(data).decode()


def strip_thinking(text: str) -> str:
    """These are reasoning models. Keep the answer, drop the working out."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S | re.I)
    # Reasoning often opens with "The user wants..." and the real answer starts
    # at the first numbered or bulleted line.
    marker = re.search(r"\n\s*(?:\*\*)?(?:1[\.\)]|#{1,3}\s|-\s)", text)
    if marker and marker.start() > 200:
        text = text[marker.start():]
    return text.strip()


def ask(model: str, prompt: str, b64: str, max_tokens: int) -> str:
    key = os.environ.get("NVIDIA_API_KEY", "proxy-supplied")
    payload = {
        "model": model, "max_tokens": max_tokens, "temperature": 0.2,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b64}},
        ]}],
    }
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=240) as r:
        body = json.loads(r.read())
    msg = body["choices"][0]["message"]
    return msg.get("content") or msg.get("reasoning_content") or ""


def main() -> int:
    ap = argparse.ArgumentParser(description="Critique a screen on NVIDIA credit.")
    ap.add_argument("image")
    ap.add_argument("--kind", choices=["web", "app"], default="web",
                    help="web page or phone app screen (default: web)")
    ap.add_argument("--fix", action="store_true",
                    help="return a numbered work list instead of prose")
    ap.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    args = ap.parse_args()

    if not os.path.exists(args.image):
        print(f"No such file: {args.image}", file=sys.stderr)
        return 1

    surface = ("a phone app screen. Judge it as an app, not a web page: "
               "navigation, touch targets, thumb reach and safe areas matter."
               if args.kind == "app" else
               "a web page. Judge the desktop and phone layout, type measure "
               "and the single clearest action.")

    shape = ("Return a numbered work list. Each line: the element, the problem, "
             "the exact change (with a number where one applies). Nothing else."
             if args.fix else
             "Return the 5 most serious problems, worst first. For each: name the "
             "element, say what is wrong in one sentence, then give the exact fix "
             "with a number where one applies.")

    # It cannot know things outside the picture, and will invent faults if not
    # told. Giving it the date stops it reporting today's date as a stale one.
    today = datetime.date.today().strftime("%d %B %Y")
    blind = (f"Today is {today}; a date on screen matching it is correct, not stale. "
             "You cannot see hover states, scrolling, or anything below the fold. "
             "Judge only what is visible, and never guess at behaviour.")

    prompt = (f"You are a senior product designer reviewing {surface}\n\n{METHOD}\n\n"
              f"{TELLS}\n\n{blind}\n\n{shape}\n\nNo praise, no summary, no preamble. "
              f"If something is already right, do not mention it.")

    b64 = encode(args.image)
    for model in VISION_MODELS:
        try:
            out = strip_thinking(ask(model, prompt, b64, args.max_tokens))
            if len(out) < 40:
                continue                        # model answered with nothing useful
            print(out)
            print(f"\n--- {model} · your NVIDIA credit, not Claude's ---", file=sys.stderr)
            return 0
        except urllib.error.HTTPError as e:
            print(f"{model}: HTTP {e.code}", file=sys.stderr)
        except Exception as e:
            print(f"{model}: {str(e)[:120]}", file=sys.stderr)

    print("No vision model answered. Check the NVIDIA endpoint is reachable.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())

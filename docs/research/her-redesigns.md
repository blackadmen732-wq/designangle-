# Her redesigns, step by step

November 2026. Six screen recordings by uidesignmahsa, each a 36 to 58
second redesign of one screen of a well-known app: Google Maps, Airbnb,
Uber Eats, Starbucks, Netflix and Gmail. The app style (`app-style/`) was
measured from these frames earlier; this is the other half, what she says
she changed and why, how she moves the camera and shows each change, and
how the video itself is built, so the reasons and the method are kept along
with the numbers. `.claude/skills/redesign-eye/` turns it into a way of
working.

## How it was read

Her narration is in the videos as one word at a time, in a white pill at the
right edge of the phone (and, during the intro, in white over her face).
Audio models could not be fetched here, so the words were read off the
frames: every frame at 10 per second, the caption region only, read with
RapidOCR, kept where the word sits on a white pill, repeats merged.
`tools/watch.py` does all of this for the next video: the words, a
storyboard, and the camera's moves. The
intro was read the same way from its own region. Then each sentence was
paired with three frames (as it starts, midway, as it ends) to see what
changes while she says it. The storyboards and frames are her work and stay
out of git (`.refs/`).

Her words below are the recovered text, cleaned of reading errors
("irections" is "Directions"); a word in [brackets] was not on screen but is
plainly meant. What changes on screen is observed from the frames, with
sizes in iOS points from the recreations in `app-style/screens/`.

## Google Maps: the place page (dark)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign Google Maps. This is the place page right now." | The old page: a small title, a row of blue action pills, a grid of photos, small tabs, a tickets list. |
| 0:04 | "First, the photos now open the page edge to edge: you see the place before you read about it." | One photo across the top, fading into the dark page. The name sits on it at 48pt (weight about 370), with Park and Accessible tags. |
| 0:10 | "The rating and opening hours sit in two clear cards: you know in one look it's good, and it's open right now." | Two cards side by side (175 x 88): 4.7 with stars and the review count; Open in green, Closes 10 pm. Under them, four round actions with labels: Directory, Save, Share, Website. |
| 0:17 | "The tabs became bigger pills that are easy to tap." | A 45pt segmented track; the current tab a white pill. |
| 0:20 | "Tickets show what's free and what you pay for: you can compare prices right away." | A card (radius 28) with each entry and its price; Free in green. |
| 0:24 | "And Directions is now the main button at the bottom, with save, share and website next to it, always under your thumb." | A full-width blue Directions pill floats at the bottom over a fade. |
| 0:32 | "Before and after. Which app next?" | Old and new side by side. |

## Airbnb: the listing page (dark)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign Airbnb. This is the listing page right now." | A white sheet over the top 40%: a three-line bold centred title, a rating row, the host, "Saved to Menlo Park 2026", a red Check availability button. |
| 0:04 | "First, the photo now fills the whole screen, and these small previews take you to any room in one tap: you feel the place right away." | The photo fills the screen; a row of small rounded room thumbnails (+15) sits low on it. |
| 0:13 | "The title is shorter, and the bed and bathroom sit in clear chips you read in one look." | The title in two tones, left-aligned, 29.5pt at 400: "Sunny Silicon Valley / Crashpad and Workspace". 1 queen bed and Shared bathroom become chips with icons. |
| 0:18 | "The rating, the guest favorite badge and reviews now live together in one card: you know it's trusted instantly." | One card: 4.93 with stars, Guest favorite and Top 10% of homes, 184 Reviews. |
| 0:25 | "Eric gets his own host card, one tap away." | A card with his photo, Superhost and 11 years hosting, and a chevron. "Saved to Menlo Park" and the ranking note are gone. |
| 0:28 | "And check availability stays at the bottom, always under your thumb." | A white pill, Check availability with Add dates for prices, and a calendar circle of the same height. |
| 0:32 | "Before and after. Which app next?" | |

## Uber Eats: home (light, her only light screen)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign the Uber Eats app. This is their home screen right now." | A small address line, colourful 3D category pictures, food cards with offers printed on them, search in the tab bar. |
| 0:05 | "First, your address and search now sit together at the top: you can start an order right away." | "Delivering to" over "1226 University Dr" in two tones at 29pt, 400. A dish bleeds in from the top right. Service chips (All, Rides, Grocery, Convenience) and a 51pt search field under it. |
| 0:10 | "The categories are clean icons you can scan in one look, and filters like Pickup and Offers sit in one easy row." | The pictures become line icons in white 58pt squares (radius 18) with 13pt grey labels. Uber One, Pickup, Offers, Under 30 min as small chips in one row. |
| 0:18 | "Featured restaurants show rating, reviews and delivery time right on the card: you can choose without opening each one." | "Featured on Uber Eats" in two tones at 21.5pt with an arrow circle; cards 180 x 191, the photo fading into white, a badge and a heart, the name at 17.5pt, then 4.5 Rating, 2,000+ Reviews, 18 Min as numbers over labels. |
| 0:24 | "And the bottom bar keeps home, cart and account one tap away, with [a] big search button for your thumb." | A floating dock: a dark Home pill, three icons, a green search circle at the right. |
| 0:31 | "Before and after. Which app next?" | |

Measured on the last frame: the page is #f8f8f5 (248, 248, 245), the cards
#ffffff with a soft shadow and no border. Blocks sit 15.5 to 17pt apart, a
section head 26 to 30.5pt below what came before, and 16.5pt above what it
heads.

## Starbucks: rewards (dark)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign the Starbucks app. This is their rewards screen right now." | A white page, two tabs on green, "You have 0★ ready to redeem" in small type, a long list of rewards with "★ away" tags. |
| 0:05 | "First, the tabs sit on [a] warm coffee photo: you know you're in Rewards straight away." | A dark coffee photo behind the top; the tabs on it. |
| 0:10 | "Your star balance becomes the headline: you see what you can redeem the moment you open [it]." | "You have", then 142 at 131pt, weight 200, then "Stars ready to redeem" at 29.5pt, 400. |
| 0:15 | "Then [I] added [a] reward gauge that shows how close you are to your next reward [at a] glance." | A thin gauge: 58 Stars to your next reward. |
| 0:21 | "Each reward now [has] its own card, with the stars you need and how far away it is, side by side." | "Rewards menu" at 21.5pt, then a row of cards: a drink, 25★, what it gets, a yellow Redeem pill. |
| 0:26 | "And Rewards gets its own button next to the nav: it's always one tap away." | A white circle with a star beside the dock. |
| 0:31 | "Before and after. Which app next?" | |

## Netflix: the show page (dark, two screens)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign Netflix. This is the show page right now." | |
| 0:04 | "The trailer [is a] small box on top, and everything else is [a] long list." | The old page, marked up. |
| 0:09 | "Now the trailer plays full screen, like [a] reel." | The trailer fills the screen. |
| 0:11 | "The title and key details sit right on top." | Black Mirror at 44pt over the foot of the trailer, tags and one line of synopsis. |
| 0:15 | "Play, Download and My List are all under your thumb." | A white Play pill (with S7 E1) and two circles of the same height, at the bottom. |
| 0:18 | "And when you swipe down, the page slides over the trailer and blurs [it] in the back." | The details page slides up; the trailer blurs behind it. |
| 0:23 | "Now the rest [of] the old page: the trailer and the title took half the screen." | The old detail page. |
| 0:27 | "Now the trailer keeps playing in [a] small player right next to the title." | A small player at the top left, the title at 28.5pt beside it. |
| 0:31 | "Play and Download sit just below." | A white Play pill and a Download circle. |
| 0:33 | "The long description and the three buttons became one clean card, and share moved to the top." | Description, cast and creator in one card; Share in the top bar. |
| 0:39 | "The tabs stay simple, and the episodes became [a] row you can swipe, with downloads and how far you got." | Episodes as a row of cards with a progress bar and a download icon each. |
| 0:45 | "Before and after. Which app next?" | |

## Gmail: the inbox (light, a grey ground with white panels)

| Time | What she says | What changes on screen |
|---|---|---|
| 0:00 | "Let's redesign the Gmail inbox. This is it right now." | Her face under the title, "redesigning" in a bold sans over "Gmail" in an italic serif, the app's icon above. At 2.8s the inbox dissolves in over her face in 300ms. |
| 0:04 | "Promotions sit right between your real emails." | The camera moves in on the list. A selection box marks the Promotions row, second in the list, between Sam and Square. |
| 0:06 | "Every row looks the same, and the tab bar takes the whole strip at the bottom." | A cut, a slow push, then the camera moves to the bottom: a full-width bar of three icons, Compose floating over the last row. |
| 0:11 | "Let's fix it, step by step." | The camera pulls back to the whole screen. |
| 0:13 | "The search bar turns into soft glass, with your account right next to it." | One white bar with a shadow (menu, field and avatar inside it) becomes three parts: a grey circle with the menu, a soft grey pill field, the account as a blue circle beside it. Her action row, at the top. |
| 0:17 | "Promotions move out of the list into their own stacked card. They never push your real mail down, and you still see how many are new." | The row leaves the list and becomes a white card at the top, with the edge of a second card showing behind it; the tag in a pale green circle; "4 new" as a pale green pill. |
| 0:25 | "Emails are grouped by time, this evening and afternoon: you can catch up in a second, without any filter." | The list moves onto one white panel with rounded top corners; "This evening" and "Afternoon" in grey head each group. The star on every row is gone; a red dot before the time marks unread; read mail is grey. |
| 0:31 | "Each sender gets a small icon for photos, orders or security: you know what it's about at a glance." | Every avatar becomes a letter in a colour circle (the Pinterest logo too), with a small white badge at its lower right: a picture, a parcel, a shield, a megaphone. |
| 0:37 | "When someone sends photos, you see them right in the list, not just a file name." | The attachment chip (a file name) gives way to a photo thumbnail at the end of the row, with the count (3) on its corner. |
| 0:42 | "When an order is on the way, a tiny calendar shows the delivery date." | "Expected by Tue, Jan 14" under the row becomes a pale blue tile at the end of it: Tue over 14. |
| 0:46 | "And [the] tab bar becomes [a] small floating glass [pill]: [it] takes less space, you see more emails every time you open it." | The full-width bar becomes a dark glass pill of three circles at the lower left (mail with 99+, chat, video); Compose becomes a red circle with a pencil at the lower right; the list runs on under both. |
| 0:53 | "Before and after. Which app next?" | The old inbox whole, then the new one, a cat reacting in a corner; "which app next?" with "next?" in the italic serif. |

Measured on the last frame, in points: the ground a cool light grey
(#f2f3f6) with flat white panels and cards on it, no shadow, radius about
24, 8pt from the screen's edges; avatars 48 with a 20 badge; rows about 70
tall; type 17 (the sender, heavier when unread), 15 (subject, preview, group
labels), 13 (the time). Her light ground has two forms, then: shadowed
cards on near-white for a page of cards (Uber Eats), flat white panels on a
cool grey for a long list (Gmail).

## How she moves, measured

Her videos are edited, so the motion is the camera and the changes, not an
app running. Measured on the Gmail video, 30 frames a second, by following
the screen's box and how much of it changes from frame to frame
(`python3 tools/watch.py motion <video>`):

- **The camera holds still while she names the screen,** at the start and
  at the end, and moves in on each part as she talks about it: to about
  1.2 times, in 600ms (17 to 20 frames), on an S-curve (10% of the way at
  200ms, 90% at about 500ms). Then it holds, 3.5 to 6 seconds, while she
  speaks. Between two framings it sometimes cuts instead of moving; while
  holding, it sometimes pushes in slowly.
- **A selection box comes first.** A thin blue box (the design tool's own)
  and her cursor mark the part before it changes, so the eye is there
  already.
- **Each change is a dissolve in place,** 250 to 300ms (8 or 9 frames): the
  old part fades as the new one appears where it was. Nothing slides. A
  part that is only added (the "This evening" label) fades in.
- **One word at a time,** in a white pill at the right edge of the phone,
  never over what is being changed: 3 to 4 words a second, bold black sans.
  The last line sets "next?" in the italic serif of the title.
- **A countdown** at the top right, from the video's length to 0:00.

In the apps themselves, the motion she designs has a job each time: the
page slides over the trailer and blurs it (Netflix); the photo opens the
page edge to edge (Maps, Airbnb); the chrome floats so the content runs
under it (Gmail, Uber Eats).

## How the video is built

The same six beats in every one, 36 to 58 seconds in all:

1. **The hook (0 to 3s).** Her face, "redesigning" over the app's name, its
   icon. An app everyone uses, so everyone already has an opinion.
2. **The problem (3 to 10s).** "This is it right now," and one or two pains
   in the words a user would use: "Promotions sit right between your real
   emails." The camera on each.
3. **The promise.** "Let's fix it, step by step."
4. **The changes,** four to seven, one every 4 to 6 seconds, from the top of
   the screen down, the main action last. Each sentence says what changed,
   then what you get: "you know what it's about at a glance".
5. **The payoff.** "Before": the old screen whole. "And after": the new
   one whole. A reaction (the cat) for a laugh.
6. **The ask.** "Which app next?" The comments choose the next video: it is
   a series, and the audience is in it.

## Her playbook

The same moves run through all six. Each is in at least two videos, except
where marked.

1. **What you came for is the headline.** The place (Maps, Airbnb), where
   the order is going (Uber Eats), the balance (Starbucks), the show
   (Netflix).
2. **Photo first on dark, white first on light.** Her dark screens open
   with a photo edge to edge. Her one light screen keeps the page white and
   puts the food in the cards, with one dish at a corner.
3. **Type in a few sizes, in regular weight, in two tones.** Titles 29 to
   29.5pt at 400; 44 to 48pt only over a full-screen photo; section heads
   21.5pt at 400; names on cards 17.5pt at 500; labels 13pt; one huge thin
   number when the number is the point (131pt at 200).
4. **Facts as numbers over small labels, side by side, in a card.** Rating
   and hours (Maps); rating, badge and reviews (Airbnb); rating, reviews and
   time (Uber Eats); stars needed and how far (Starbucks).
5. **One card per thing,** in a row you swipe when there are several:
   rewards, restaurants, episodes; the host gets his own.
6. **Fewer words.** A shorter title, chips instead of a line of text, a long
   description folded into one card.
7. **Icons for categories, not pictures.**
8. **Bigger controls:** pill tabs, chips, a 56pt main pill.
9. **The main action at the bottom, under the thumb,** in every video: a
   pill with circles of the same height, or a circle beside the dock.
10. **A tight rhythm on light:** blocks 16pt apart, 28pt above a section.
    The white between blocks separates them, not the distance.
11. **Cut what does not help the choice:** "Saved to Menlo Park", the
    ranking note, the printed offers, the long list.
12. **Motion with a job:** the page slides over the media and blurs it.
13. **Keep the noise out of the way of the real thing:** promotions leave
    the inbox for one stacked card that still shows how many are new
    (Gmail); "Saved to Menlo Park" goes (Airbnb).
14. **Group by what people scan for:** by time, "This evening",
    "Afternoon", so catching up needs no filter (Gmail).
15. **Show what it is before it is opened:** a badge on each sender for the
    kind of mail; photos as a thumbnail with a count; a delivery date as a
    calendar tile (Gmail); prices on the card (Maps, Uber Eats).
16. **One bar becomes circle, pill, circle:** the search bar splits into a
    menu circle, a soft pill field and the account circle (Gmail), the same
    shape as her action rows.
17. **Shrink the chrome so the content grows:** the tab bar becomes a
    floating pill and Compose a circle (Gmail); the dock floats (Uber
    Eats).
18. **Calm what repeats:** no star on every row, logos made letters in
    colour circles, read mail grey and unread in ink with a dot (Gmail).

## The Chick-fil-A study against her

The first study (commit 24a2c91) passed every audit: 100 on unslop, 100 on
motion, no usability failures. It still did not look like her work, and
the audits could not say so: they measure the tells of AI-made screens,
usability and motion, not likeness to a reference. Only putting it beside
her nearest screen (Uber Eats, the same ground) showed it. That step was
missing from the method; it is in the app-redesign and app-style skills now.

| Her move | The first study | Why it went that way | Now |
|---|---|---|---|
| White first on light: #f8f8f5, white cards | #f7f5f2, a warm beige | After the tickets test I wrote "a warm off-white page" into the skill, a choice of mine, not a measurement, then warmed it further for the brand. | Her #f8f8f5 and white cards. The skill says so. |
| Photo first only on dark | A 312pt photo across the top of Home | I took the signature of her dark screens to a light one, so the top third was brown. | The food is in the usual's card and in each dish's card. |
| Titles 29pt at 400 | 36pt at 500, over three lines | The skill said 36 to 48pt for a title, which holds only over a full-screen photo on dark. And the usual was written as a sentence for a headline. | 29pt at 400: the restaurant, in two tones. |
| Section heads 21.5pt at 400, an arrow circle | 20pt at 500, an "All" link | The system's section head was set when the first example needed one, and never measured. | 22pt at 400 in the system, with `.go`. |
| Blocks 16pt apart, 28 above a section | 24 and 40, and the content pushed 152pt down the photo | The system had no rule for rhythm, and I spaced by feel, with the habits of the kit's websites (sections there are 96pt and more apart). | `--space-block` and `--space-sec` in the system. |
| Categories as clean icons | 84pt photo circles | There were no food icons, so I used photos: the very thing she replaced. | Five icons drawn: sandwich, drumstick, fries, salad, drink. |
| Facts as numbers over labels | Points as a sentence ("3 rewards ready · 2,760 points this year to Red"); dishes as a name, a description and a price | I wrote sentences where she writes numbers. | Points: 1,240, 3 and Silver over labels. Each dish: the price on its own and as a meal. |
| One card per thing | Popular dishes as plain rows on the beige page | The list row was used as it came. | A card per dish on Home; a white card per row on the Menu. |
| What you came for is the headline | "Your usual?" as the headline | The brief's one thing became words. | The usual is the first card, with the photo and the pill. The headline is the restaurant, which answers the reported problem (orders sent to the wrong one), as her address does. |
| A page that slides over and blurs | Sheets dimmed the page | The system's sheet only dimmed. | Every sheet in the system blurs what is behind it. |
| The balance as the headline | Done: 1,240 at 120pt | | Kept, with "points to spend" at 29pt, as she sets "Stars ready to redeem". |
| The main action under the thumb | Done: the bag button, Place order | | Kept. |
| Chips easy to tap | Done | | Kept, and how you pick up moved to the top of Home, where her service chips sit. |
| Cut what does not help | Done: the carousel, gift cards, loading money | | Kept. |

## What changed in the system

- `app-style.css`: section heads at 22pt and 400 with a `.go` arrow circle;
  `--space-block` (16) and `--space-sec` (28) with `.sec`; a blurred
  backdrop behind every sheet, and a lighter dim on light.
- `app-icons.css`: sandwich, drumstick, fries, salad and drink; then, for
  Gmail, image, shield, megaphone, video, person and a filled tag.
- Her Gmail moves, as parts: `.list-panel`, `.group-label`, `.group-split`,
  `.mono` with `.mono-kind`, `.dot-new`, `.thumb-n`, `.tile-date`,
  `.stacked` and `.pill-bar`, proved by rebuilding her last frame
  (`app-style/screens/gmail-inbox.html`, every row within 2pt).
- `tools/reel.js` tells one of our redesigns as a reel built like hers:
  the six beats, her camera (measured back with `watch.py`: 1.2 times,
  half-second S-curves, a 300ms dissolve), one word at a time, a
  countdown; our title card and mark.
- `tools/watch.py` reads the next video: her words, a storyboard, the
  camera. `.claude/skills/redesign-eye/` is how she thinks, as a skill.
- `tools/slop.js`: two thresholds were stricter than her own screens (the
  title 1.6 times the section heads, 2.2 times the body). Her Uber Eats
  title is 1.35 and 1.9. Calibrated to her; the deliberately bad page still
  scores 18.
- `tools/check.js`: a small control below the fold, or under a floating
  dock as the page loads, is brought to the middle of the screen and probed
  there, so a 36pt circle with a 44pt hit area is measured as it is.

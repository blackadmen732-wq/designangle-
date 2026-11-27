# Her five redesigns, step by step

November 2026. Five screen recordings by uidesignmahsa, each a 37 to 50
second redesign of one screen of a well-known app: Google Maps, Airbnb,
Uber Eats, Starbucks and Netflix. The app style (`app-style/`) was measured
from these frames earlier; this is the other half, what she says she
changed and why, so the reasons are kept along with the numbers.

## How it was read

Her narration is in the videos as one word at a time, in a white pill at the
right edge of the phone (and, during the intro, in white over her face).
Audio models could not be fetched here, so the words were read off the
frames: every frame at 10 per second, the caption region only, read with
RapidOCR, kept where the word sits on a white pill, repeats merged. The
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

## Her playbook

The same moves run through all five. Each is in at least two videos.

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
- `app-icons.css`: sandwich, drumstick, fries, salad and drink.
- `tools/slop.js`: two thresholds were stricter than her own screens (the
  title 1.6 times the section heads, 2.2 times the body). Her Uber Eats
  title is 1.35 and 1.9. Calibrated to her; the deliberately bad page still
  scores 18.
- `tools/check.js`: a small control below the fold, or under a floating
  dock as the page loads, is brought to the middle of the screen and probed
  there, so a 36pt circle with a 44pt hit area is measured as it is.

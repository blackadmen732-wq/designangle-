/*
 * EXAMPLE CONTENT. Comb & Coat is an invented barbershop with a nail bar.
 *
 * Every name, price, address, phone number and opening hour here is made up.
 * The phone number is in the 555-01xx range that is never assigned, and the
 * email domain is .example, which never resolves. Photos are free-licence
 * Unsplash stock (img/CREDITS.json); three were cropped to take another
 * business's lettering out of the frame. Replace them with the client's own.
 * Run `node tools/launch-check.js barber` before this goes anywhere near a
 * real business: it refuses while the example details are still in here.
 *
 * On the design direction. A barbershop site defaults to black and gold, a
 * script face and a barber pole. This is none of those: a cool stone ground,
 * an oxblood taken from the leather of an old chair, and a condensed
 * industrial display face (Big Shoulders Display) that reads like signage
 * painted on a window, in two weights only: a heavy one and a light one.
 *
 * On the layout. The atelier layout, as the salon uses: one photograph at full
 * bleed with the name over it, then the work, then a price ledger. People
 * choose a barber by looking at fades, not by reading. The second line of the
 * headline is light, in a tint of the accent, so the promise reads in two
 * tones: what the chairs do, and what the nail bar does.
 *
 * On the words. Each line says what you get, in the words a customer uses:
 * walk in for a cut, book the nail bar, the price is said before we start.
 */
module.exports = {
  lang: 'en',

  layout: 'atelier',

  sections: [
    'belt',
    'showcase',
    'list',
    'story',
    'band',
    'contact'
  ],
  name: 'Comb & Coat',
  short: 'Comb & Coat',

  seo: {
    title: 'Comb & Coat — barbers and a nail bar, Columbus',
    description:
      'Fades, cuts, beards and straight-razor shaves at the chairs, and a nail '
      + 'bar at the back. Walk in for a cut; book the nails.',
    type: 'BarberShop',
    telephone: '(614) 555-0147'
  },

  theme: {
    bg: '#efeeea',        // cool stone, not cream
    ink: '#16130f',       // 15.95:1 on the ground
    muted: '#5f5a53',     // 5.88:1
    line: '#dcd9d2',
    soft: '#e6e3dc',
    accent: '#8e2a24',    // 7.22:1. Oxblood, from the leather of an old chair.
    tag: '#2f4a3f',       // 8.33:1
    tint: '#eadbd6',
    display: '"Big Shoulders Display", "Arial Narrow", "Roboto Condensed", system-ui, sans-serif',
    body: '"Instrument Sans", "Helvetica Neue", Arial, system-ui, sans-serif',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@300;800&family=Instrument+Sans:wght@400;600&display=swap'
  },

  cta: { label: 'Book', href: '#book' },

  hero: {
    label: 'The shop',
    eyebrow: 'Olde Towne East, Columbus',
    primary: { label: 'Book a chair', href: '#book' },
    headline: 'Sharp lines,',
    headlineAccent: 'soft hands.',
    lead: 'Fades, beards and razor shaves at the front. A nail bar at the back. '
        + 'Walk in for a cut; book the nails.',
    footNote: 'Scroll',
    slides: [
      { img: 'hero-fade.webp',
        alt: 'A barber with a tattooed forearm combing up the top of a fresh skin fade',
        title: 'Fades and cuts',
        text: 'Clipper or scissor, blended by hand.',
        meta: '40 minutes',
        tint: '#1c1713' }
    ]
  },

  belt: [
    { img: 'chair.webp', text: 'Walk-ins at the chairs, every day we are open' },
    { img: 'nails-art.webp', text: 'Gel, builder gel and freehand art' },
    { img: 'razor.webp', text: 'Hot towel and a straight razor' },
    { img: 'curls.webp', text: 'Every texture, every length' },
    { img: 'nails-red.webp', text: 'Tools sterilised between every client' }
  ],

  showcase: {
    id: 'work',
    navLabel: 'Work',
    eyebrow: 'Chairs at the front, nails at the back',
    title: 'What we do',
    text: 'Three barbers and two nail technicians under one roof, so a cut and '
        + 'a manicure can happen in the same visit.',
    cards: [
      { img: 'clipper-fade.webp',
        alt: 'A barber taking the sides down to a skin fade with clippers',
        title: 'Fades',
        meta: '40 min',
        text: 'Skin, low, mid or high, blended by hand and finished with a '
            + 'razor line-up.' },
      { img: 'curls.webp',
        alt: 'A barber shaping a client’s curls with a pick and clippers',
        title: 'Curls and texture',
        meta: '45 min',
        text: 'Twists, tapers and shape-ups, cut wet or dry the way the hair '
            + 'actually sits.' },
      { img: 'razor.webp',
        alt: 'A barber holding a straight razor to a client’s cheek under warm light',
        title: 'Hot towel shave',
        meta: '35 min',
        text: 'Hot towels, a straight razor, a cold one to close. Bring ten '
            + 'minutes you do not need.' },
      { img: 'beard-bw.webp',
        alt: 'A black and white close-up of scissors shaping a full beard',
        title: 'Beards',
        meta: '20 min',
        text: 'Shaped to the face, the neckline cleaned, the cheeks lined '
            + 'with a razor.' },
      { img: 'nails-work.webp',
        alt: 'A nail technician shaping a client’s nails at a lit nail station',
        title: 'Nails',
        meta: '50 min',
        text: 'Manicures for anyone, gel that lasts three weeks, and soak-off '
            + 'done gently, never scraped.' },
      { img: 'nails-art.webp',
        alt: 'A hand with glossy black and tortoiseshell nail art against a grey sleeve',
        title: 'Nail art',
        meta: 'From $5 a nail',
        text: 'Freehand, from one accent nail to a full set. Bring a photo or '
            + 'leave it to Ivy.' }
    ]
  },

  list: {
    id: 'prices',
    navLabel: 'Prices',
    eyebrow: 'Said before we start',
    title: 'Prices',
    text: 'The same price whether it is your first visit or your fiftieth. '
        + 'If something would change it, you hear it before the clippers go on.',
    note: 'Card or cash. A tip is never added for you.',
    groups: [
      { name: 'Cuts', items: [
        { title: 'Haircut', meta: '$38', text: 'Clipper or scissor, washed and styled.' },
        { title: 'Skin fade', meta: '$42', text: 'Blended to the skin, razor line-up.' },
        { title: 'Buzz cut', meta: '$25', text: 'One length all over, edges cleaned.' },
        { title: 'Under twelve', meta: '$26', text: 'Any cut, with patience.' },
        { title: 'Line-up only', meta: '$15', text: 'Edges and neckline between cuts.' }
      ]},
      { name: 'Beards and shaves', items: [
        { title: 'Beard trim', meta: '$22', text: 'Shape, neckline, cheek line.' },
        { title: 'Hot towel beard', meta: '$30', text: 'Trim, hot towel, razor finish.' },
        { title: 'Straight-razor shave', meta: '$40', text: 'Two hot towels, lather, a cold one to close.' },
        { title: 'Head shave', meta: '$35', text: 'Razor, then a balm.' }
      ]},
      { name: 'Nails', items: [
        { title: 'Tidy and buff', meta: '$24', text: 'Shape, cuticles, a matte buff. No polish.' },
        { title: 'Classic manicure', meta: '$30', text: 'Shape, cuticles, one colour.' },
        { title: 'Gel manicure', meta: '$45', text: 'Lasts about three weeks.' },
        { title: 'Pedicure', meta: '$50', text: 'Soak, shape, heels, polish.' },
        { title: 'Nail art', meta: 'From $5', text: 'Per nail, freehand.' },
        { title: 'Gel soak-off', meta: '$12', text: 'Free with a new set the same visit.' }
      ]},
      { name: 'Together', items: [
        { title: 'Cut and beard', meta: '$55', text: '$60 apart.' },
        { title: 'Cut and a tidy and buff', meta: '$56', text: 'Same visit, $62 apart.' },
        { title: 'Fade and a gel manicure', meta: '$80', text: 'Same visit, $87 apart.' }
      ]}
    ]
  },

  story: {
    id: 'about',
    navLabel: 'The shop',
    eyebrow: 'Since 2020',
    title: 'One shop, two rooms',
    img: 'shop.webp',
    alt: 'Three leather barber chairs under warm pendant lights against a brick wall',
    paragraphs: [
      'Comb & Coat is Dre at the first chair, Sam and Jun beside him, and '
      + 'Lena and Ivy at the nail bar in the back room.',
      'The chairs take walk-ins: put your name on the board and we will text '
      + 'you when you are next, so you can wait at the coffee place across the '
      + 'street instead of on our bench.',
      'The nail bar is by appointment, because a good set takes the time it '
      + 'takes. Book it with a cut and it is cheaper than the two apart.'
    ],
    facts: [
      { value: 3, label: 'barber chairs' },
      { value: 2, label: 'nail stations' },
      { value: 7, label: 'days a week, Mondays short' }
    ]
  },

  band: {
    img: 'nails-pastel.webp',
    alt: 'A hand with grey, white and silver glitter nails against a white knit sleeve',
    title: 'Walk in for a cut. Book the nail bar.',
    link: { label: 'Book a time', href: '#book' }
  },

  contact: {
    id: 'book',
    navLabel: 'Find us',
    eyebrow: 'Walk in or book',
    title: 'Book a time',
    hoursTitle: 'When we are open',
    hours: [
      ['Monday', '12:00 – 18:00'],
      ['Tuesday to Friday', '10:00 – 19:00'],
      ['Saturday', '09:00 – 17:00'],
      ['Sunday', '11:00 – 16:00']
    ],
    blocks: [
      { title: 'Where we are',
        lines: ['17 Alder Street', 'Olde Towne East', 'Columbus, OH 43205'] },
      { title: 'Talk to us',
        lines: ['(614) 555-0147', 'hello@combandcoat.example'] }
    ],
    form: {
      title: 'Request a time',
      contactLegend: 'About you',
      phoneLabel: 'Phone',
      phonePlaceholder: '(614) 555-0147',
      emailLabel: 'Email, if you prefer',
      whereLegend: 'Who you see',
      addressLabel: 'Have you been to us before?',
      addressPlaceholder: 'First time, or who usually cuts your hair',
      jobLegend: 'What and when',
      choiceLabel: 'What would you like',
      choices: ['Cut', 'Beard or shave', 'Nails', 'Cut and nails'],
      defaultChoice: 'Cut',
      dateLabel: 'Preferred date',
      timeLabel: 'Time of day',
      times: ['Morning', 'Lunchtime', 'After work', 'Any'],
      defaultTime: 'Any',
      notesLabel: 'Anything else',
      notesPlaceholder: 'A photo of the cut or the nails you are after helps.',
      button: 'Send request',
      confirm: '{choice} for {name}, {date}, {time}. We will confirm by text.',
      note: 'This is a demonstration site and no booking system is connected, '
          + 'so nothing was sent.',
      nameError: 'Add your name so we know who to ask for.',
      phoneError: 'Add a phone number so we can confirm.',
      addressError: 'Let us know if you have been before.',
      dateError: 'Pick a date.'
    }
  },

  footer: {
    mark: 'Comb & Coat',
    left: 'Barbers and a nail bar, Olde Towne East',
    right: 'Walk-ins at the chairs, nails by appointment'
  }
};

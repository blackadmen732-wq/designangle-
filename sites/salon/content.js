/*
 * EXAMPLE CONTENT. Maison Verrier is an invented salon.
 *
 * Every name, price, address, phone number and opening hour here is made up.
 * Photos are free-licence Unsplash stock; replace them with the client's own.
 * Run `node tools/launch-check.js salon` before this goes anywhere near a
 * real business — it will refuse while the example phone number is in here.
 *
 * On the design direction. The design skill's generated-design list names
 * "cream background, serif display, terracotta accent" as a tell, and that is
 * exactly what a salon site defaults to. So: a warm off-white that is cooler
 * and greyer than cream, a grotesque rather than a serif for display, and a
 * deep wine accent instead of terracotta.
 *
 * On the layout, and why it is not the default. A person choosing a salon is
 * not comparing items on a list; they are deciding whether the place looks
 * like somewhere they want to sit for an hour. The default layout — text
 * beside a carousel, arrows, dots, thumbnails — answers the first question and
 * gets in the way of the second. `layout: 'atelier'` answers the second: one
 * photograph at full bleed with the name over it, then an asymmetric gallery
 * and a price ledger. See template/site.css, "LAYOUT: atelier".
 *
 * On the photography. An earlier version of this file ran on stock macro shots
 * of a hand against fabric — nine near-identical pictures, interchangeable and
 * badly lit. No layout rescues a page built from those. These are hands at
 * work: craft, motion and real light, which is what the business actually
 * sells.
 */
module.exports = {
  lang: 'en',

  // Not the default layout. See template/site.css, "LAYOUT: atelier".
  layout: 'atelier',
  name: 'Maison Verrier',
  short: 'Verrier',

  seo: {
    title: 'Maison Verrier — hair and nails, Columbus',
    description:
      'A hair and nail studio in German Village. Colour, cutting, manicures '
      + 'and pedicures, by appointment.',
    type: 'BeautySalon',
    telephone: '(614) 555-0188'
  },

  theme: {
    bg: '#faf8f6',        // warm off-white, cooler than cream
    ink: '#231a1e',       // 16.01:1 on the ground
    muted: '#6b5f63',
    line: '#ebe5e3',
    soft: '#f5eef0',
    accent: '#7d3350',    // 8.05:1 on the ground. Deep wine, not terracotta.
    tag: '#3f5c50',
    tint: '#efe2e6'
  },

  cta: { label: 'Book', href: '#book' },

  hero: {
    label: 'Studio',
    eyebrow: 'German Village, Columbus',
    primary: { label: 'Book a chair', href: '#book' },
    headline: 'An hour that is',
    headlineAccent: 'entirely yours.',
    lead: 'Hair and nails in a four-chair studio. The person who starts your '
        + 'appointment is the one who finishes it.',
    footNote: 'Scroll',
    slides: [
      { img: 'hero-cut.webp',
        alt: 'Scissors cutting into a long, glossy curtain of dark hair',
        title: 'Colour and cutting',
        text: 'A consultation first, then a cut that works the way your hair '
            + 'already falls.',
        meta: '70 minutes',
        tint: '#2a1b18' }
    ]
  },

  belt: [
    { img: 'tools.webp', text: 'Sterilized between every client' },
    { img: 'interior-chairs.webp', text: 'Four chairs, never more' },
    { img: 'brush-blonde.webp', text: 'Gel, builder gel, or plain polish' },
    { img: 'long-hair.webp', text: 'Walk-ins when we have a gap' },
    { img: 'nails-ombre.webp', text: 'Soak-off done properly, never scraped' }
  ],

  showcase: {
    id: 'work',
    navLabel: 'Work',
    eyebrow: 'Hair and nails',
    title: 'What we do',
    text: 'Hair on the left side of the studio, nails on the right, and the '
        + 'same two people have been doing both since we opened.',
    cards: [
      { img: 'hero-cut.webp',
        alt: 'Scissors cutting into a long, glossy curtain of dark hair',
        title: 'Cutting',
        meta: '70 min',
        text: 'Dry-cut where it suits the hair, so you see the shape as it '
            + 'happens rather than after it has been blown out.' },
      { img: 'brush-blonde.webp',
        alt: 'A round brush lifting a section of pale blonde hair against white',
        title: 'Blow-dry and finish',
        meta: '45 min',
        text: 'Smooth or with movement. Booked on its own, or on the end of '
            + 'anything else.' },
      { img: 'updo-hands.webp',
        alt: 'Two hands pinning a braided updo at the nape of a neck',
        title: 'Hair up',
        meta: '60 min',
        text: 'Weddings, and Tuesdays. Timed to the hour you need to be '
            + 'somewhere.' },
      { img: 'braids.webp',
        alt: 'A close black-and-white portrait of fine, neatly parted braids',
        title: 'Braiding and protective styles',
        meta: 'Quoted',
        text: 'Priced on length and time, quoted before we start, and never '
            + 'rushed to fit a slot.' },
      { img: 'nails-tortoise.webp',
        alt: 'A hand with dark tortoiseshell-patterned nails against a grey sleeve',
        title: 'Nails',
        meta: '55 min',
        text: 'Gel, builder gel and freehand art. Soaked off properly, never '
            + 'scraped.' }
    ]
  },

  list: {
    id: 'prices',
    navLabel: 'Prices',
    eyebrow: 'No surprises',
    title: 'Prices',
    text: 'What you see is what you pay. Anything that would change the price '
        + 'gets said out loud before it happens.',
    note: 'The same price whether it is your first visit or your fiftieth. '
        + 'Anything that would change it gets said before it happens.',
    groups: [
      { name: 'Nails', items: [
        { title: 'File and polish', meta: '$28', text: 'Shape, tidy, one colour.' },
        { title: 'Gel manicure', meta: '$48', text: 'Shaped, cuticles, gel colour and top coat.' },
        { title: 'Builder gel overlay', meta: '$62', text: 'On your own nail, for strength.' },
        { title: 'Nail art, per nail', meta: 'From $4', text: 'Freehand. Simple to involved.' },
        { title: 'Soak-off and repair', meta: '$18', text: 'Included free if you are having something new put on the same visit.' },
        { title: 'Pedicure', meta: '$58', text: 'Soak, shape, heels, massage, polish.' }
      ]},
      { name: 'Hair', items: [
        { title: 'Cut and finish', meta: '$72', text: 'Consultation, wash, cut, dry.' },
        { title: 'Restyle', meta: '$95', text: 'A significant change. Longer appointment.' },
        { title: 'Half head of foils', meta: '$140', text: 'Top and sides.' },
        { title: 'Full head of foils', meta: '$195', text: 'Including a toner and a finish.' },
        { title: 'Root tint', meta: '$88', text: 'Regrowth only.' },
        { title: 'Blow dry', meta: '$42', text: 'Smooth or with movement.' }
      ]},
      { name: 'Both', items: [
        { title: 'Cut and gel manicure', meta: '$108', text: 'Booked together, same visit. $120 apart.' },
        { title: 'Full head and pedicure', meta: '$235', text: 'Full head of foils plus a pedicure, $253 apart. The long one; bring something to read.' },
        { title: 'Before an occasion', meta: 'From $130', text: 'Hair up and nails done, timed to the hour you need.' }
      ]}
    ]
  },

  story: {
    id: 'about',
    navLabel: 'The studio',
    eyebrow: 'Since 2019',
    title: 'Four chairs, two people',
    img: 'two-stylists.webp',
    alt: 'Two stylists working together on a client’s hair in a bright studio',
    paragraphs: [
      'Maison Verrier is Claire and Ode. Claire cuts and colours, Ode does '
      + 'nails, and between them they have been doing this for longer than '
      + 'either will put in writing.',
      'We kept the studio small on purpose. Four chairs means nobody is '
      + 'waiting at a basin while somebody else is being finished, and it '
      + 'means the person who started your appointment is the one who ends it.',
      'We do not play music loudly, we do not upsell at the till, and we will '
      + 'tell you honestly if what you have asked for will not suit your hair.'
    ],
    facts: [
      { value: 4, label: 'chairs, never more' },
      { value: 2, label: 'of us, start to finish' },
      { value: 200, label: 'colours on the wall' }
    ]
  },

  band: {
    // Not the green-wall interior that was here: that photograph carries a
    // product brand's name on the shelving, which puts a partnership on a
    // client's homepage that they may not have.
    img: 'interior-chairs.webp',
    alt: 'A stylist working at a row of salon chairs and mirrors, black and white',
    title: 'Appointments open on the first of the month.',
    link: { label: 'Book yours', href: '#book' }
  },

  contact: {
    id: 'book',
    navLabel: 'Find us',
    eyebrow: 'By appointment',
    title: 'Book an appointment',
    hoursTitle: 'When we are open',
    hours: [
      ['Tuesday to Friday', '09:00 – 19:00'],
      ['Saturday', '09:00 – 17:00'],
      ['Sunday and Monday', 'Closed']
    ],
    blocks: [
      { title: 'Where we are',
        lines: ['188 Thurman Avenue', 'German Village', 'Columbus, OH 43206'] },
      { title: 'Talk to us',
        lines: ['(614) 555-0188', 'hello@maisonverrier.example'] }
    ],
    form: {
      title: 'Request a time',
      contactLegend: 'About you',
      phoneLabel: 'Phone',
      phonePlaceholder: '(614) 555-0188',
      emailLabel: 'Email, if you prefer',
      whereLegend: 'Anything we should know',
      addressLabel: 'Have you been to us before?',
      addressPlaceholder: 'First time, or who you usually see',
      jobLegend: 'What and when',
      choiceLabel: 'What would you like',
      choices: ['Nails', 'Hair', 'Both', 'Not sure yet'],
      defaultChoice: 'Nails',
      dateLabel: 'Preferred date',
      timeLabel: 'Time of day',
      times: ['Morning', 'Early afternoon', 'Late afternoon', 'Any'],
      defaultTime: 'Any',
      notesLabel: 'Anything else',
      notesPlaceholder: 'A photograph of what you are after is always welcome.',
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
    mark: 'Verrier',
    left: 'Hair and nails, German Village',
    right: 'By appointment, Tuesday to Saturday'
  }
};

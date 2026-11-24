/*
 * EXAMPLE CONTENT. Vesper is an invented meditation studio.
 *
 * Every name, price, address, phone number and timetable here is made up.
 * Photos are free-licence Unsplash stock. Run `node tools/launch-check.js
 * meditation` before this goes near a real business.
 *
 * On the direction, and why it is not the other two sites with different
 * words. The salon is a bright, crisp, editorial page: warm off-white, a
 * grotesque at speed, prices in a tabbed list, five sliding photographs. The
 * right page for somebody choosing a colour.
 *
 * This is the opposite instrument, and the difference is structural rather
 * than a change of colour. The default layout sells a thing you choose from:
 * carousel, arrows, dots, thumbnails, a tint blob. Nobody compares five
 * meditation sittings and picks the best value, so all of that is noise here.
 *
 * `layout: 'still'` gives one centred column, one photograph, and none of the
 * carousel furniture. The ground stays light, because a small local business
 * is read in daylight by people who are not designers, and a dark page makes
 * that harder for no gain. The calm comes from the space, not the darkness.
 *
 * What is deliberately avoided: sage green, beige, sunrise gradients, a lotus,
 * a person cross-legged on a beach, and the word "journey". Those are the
 * meditation equivalent of the salon's cream-and-terracotta, and the design
 * skill's generated-design list exists to catch exactly that reflex.
 */
module.exports = {
  lang: 'en',

  // Not the default layout. See template/site.css, "LAYOUT: still".
  layout: 'still',
  name: 'Vesper',
  short: 'Vesper',

  seo: {
    title: 'Vesper — a room to sit in, Columbus',
    description:
      'A meditation studio in Franklinton. Evening sittings, beginners’ '
      + 'courses and a quiet room that is open all day.',
    type: 'LocalBusiness',
    telephone: '(614) 555-0133'
  },

  theme: {
    bg: '#f7f5f0',        // paper, not cream and not beige
    ink: '#23201c',       // 14.89:1
    muted: '#6a645c',     // 5.37:1
    line: '#e6e1d8',
    soft: '#f1ede4',
    accent: '#9c3a2a',    // 6.31:1. A seal red, not sage and not terracotta.
    tag: '#4a5f4e',       // 6.34:1
    tint: '#ece6da'
  },

  cta: { label: 'Sit with us', href: '#book' },

  hero: {
    label: 'Studio',
    eyebrow: 'Franklinton, Columbus',
    headline: 'Nothing to achieve.',
    headlineAccent: 'Somewhere to sit.',
    lead: 'A room above a bike shop on Rich Street, open from seven in the '
        + 'morning. You can come in, sit down, and leave without speaking to '
        + 'anybody.',
    primary: { label: 'See the timetable', href: '#times' },
    slides: [
      { img: 'doorway.webp',
        alt: 'A person sitting in a dark room looking out through an open doorway to a garden',
        title: 'Evening sitting',
        text: 'Forty minutes, guided for the first ten. Come straight from work; '
            + 'nobody changes clothes.',
        meta: 'Weeknights, 18:30',
        tint: '#1c2026' },
      { img: 'cushion.webp',
        alt: 'A single floor cushion on tatami in warm lamplight',
        title: 'The quiet room',
        text: 'Open all day. No booking, no teacher, no talking. Take a cushion '
            + 'and stay as long as you like.',
        meta: 'Free, always',
        tint: '#221d18' },
      { img: 'shoji.webp',
        alt: 'A tatami room with screens, light falling in patterns across the floor',
        title: 'Beginners’ four weeks',
        text: 'One evening a week for a month. By the end you will know what to '
            + 'do when you sit down alone.',
        meta: 'Four Tuesdays',
        tint: '#262119' },
      { img: 'hall-dim.webp',
        alt: 'Rows of floor cushions in a dimly lit hall',
        title: 'Saturday long sit',
        text: 'Two hours with breaks. Harder than it sounds and easier than you '
            + 'think.',
        meta: 'First Saturday',
        tint: '#1a1b20' },
      { img: 'round.webp',
        alt: 'A circular window in a traditional room looking onto green leaves',
        title: 'One-to-one',
        text: 'If sitting in a room with other people is the part you cannot '
            + 'face yet.',
        meta: 'By arrangement',
        tint: '#1b221c' }
    ]
  },

  belt: [
    { img: 'cushion.webp', text: 'Cushions and benches provided' },
    { img: 'corridor.webp', text: 'Shoes off at the door' },
    { img: 'lamp.webp', text: 'No incense, no chanting' },
    { img: 'hall-blue.webp', text: 'Arrive late, leave early, nobody minds' },
    { img: 'beams.webp', text: 'Two minutes from the Scioto trail' }
  ],

  showcase: {
    id: 'what',
    navLabel: 'Sittings',
    eyebrow: 'Five ways in',
    title: 'What happens here',
    text: 'All of it is just sitting down. The differences are how long, who '
        + 'is talking, and whether anyone is expecting you.',
    cards: [
      { img: 'doorway.webp',
        alt: 'A seated figure silhouetted in a doorway',
        title: 'Evening sitting',
        meta: '40 min',
        text: 'The main thing we do. Ten minutes guided, twenty-five quiet, '
            + 'five to come back.' },
      { img: 'cushion.webp',
        alt: 'A cushion on tatami under a warm lamp',
        title: 'The quiet room',
        meta: 'Any time',
        text: 'No instruction and no attendance taken. Some people come every '
            + 'day at lunchtime.' },
      { img: 'shoji.webp',
        alt: 'Light through screens onto a tatami floor',
        title: 'Beginners’ course',
        meta: '4 weeks',
        text: 'Posture, breath, what to do with your thoughts, and what to do '
            + 'when it is not working.' },
      { img: 'hall-dim.webp',
        alt: 'Cushions arranged in a low-lit hall',
        title: 'Long sit',
        meta: '2 hours',
        text: 'Walking between rounds. Tea afterwards. You can leave at any '
            + 'break.' },
      { img: 'round.webp',
        alt: 'A round window onto a garden',
        title: 'One-to-one',
        meta: '50 min',
        text: 'For an injury, a grief, or because a room full of people is too '
            + 'much right now.' }
    ]
  },

  list: {
    id: 'times',
    navLabel: 'Times',
    eyebrow: 'Timetable',
    title: 'When',
    text: 'The quiet room is open whenever the door is. Everything else runs '
        + 'to the clock and starts on time, because a sitting that starts late '
        + 'is a sitting people spend waiting.',
    note: 'Pay what you can. The suggested amount keeps the lights on; less is '
        + 'genuinely fine and nobody is told.',
    groups: [
      { name: 'Weeknights', items: [
        { title: 'Monday – Thursday, 18:30', meta: '$12 suggested',
          text: 'Evening sitting. Doors 18:15, we begin at 18:30 exactly.' },
        { title: 'Wednesday, 07:00', meta: '$12 suggested',
          text: 'Morning sitting. Shorter, thirty minutes, no guidance.' },
        { title: 'Thursday, 20:00', meta: 'Free',
          text: 'Open floor. Bring a question or sit and listen.' }
      ]},
      { name: 'Weekends', items: [
        { title: 'First Saturday, 09:00', meta: '$28 suggested',
          text: 'Long sit. Two hours with walking breaks and tea.' },
        { title: 'Sunday, 17:00', meta: '$12 suggested',
          text: 'Evening sitting, slightly longer. The busiest one.' }
      ]},
      { name: 'Courses', items: [
        { title: 'Beginners’ four weeks', meta: '$85',
          text: 'Four Tuesdays, 19:00. Ten people maximum.' },
        { title: 'One-to-one', meta: '$60',
          text: 'Fifty minutes, arranged directly.' },
        { title: 'The quiet room', meta: 'Free',
          text: 'Open all day, every day we are open. No booking.' }
      ]}
    ]
  },

  story: {
    id: 'about',
    navLabel: 'The room',
    eyebrow: 'Since 2021',
    img: 'beams.webp',
    alt: 'A timber ceiling and beams above a quiet room',
    title: 'A room, and somebody who turns up',
    paragraphs: [
      'Vesper is one room above a bike shop on Rich Street, and Tomas, who '
      + 'opens it. There is no app, no membership, no app notification telling '
      + 'you that you have broken a streak.',
      'We are not affiliated with a tradition and we do not teach one. What '
      + 'happens here is secular and plain: you sit down, you pay attention to '
      + 'your breathing, and your mind wanders off, and you bring it back.',
      'If you have tried this before and found it did not work, the most '
      + 'common reason is that nobody told you the wandering off is the '
      + 'practice. It is not the failure before the practice.'
    ],
    facts: [
      { value: 40, suffix: ' min', label: 'the usual sitting' },
      { value: 18, label: 'cushions in the room' },
      { value: 0, label: 'things to download' }
    ]
  },

  band: {
    img: 'lamp.webp',
    alt: 'Warm lamplight out of focus in a dark room',
    title: 'The door is open from seven in the morning.',
    link: { label: 'Come and sit', href: '#book' }
  },

  contact: {
    id: 'book',
    navLabel: 'Find us',
    eyebrow: 'Rich Street',
    title: 'Come and sit',
    hoursTitle: 'When the door is open',
    hours: [
      ['Monday to Friday', '07:00 – 21:00'],
      ['Saturday', '08:00 – 18:00'],
      ['Sunday', '09:00 – 19:00']
    ],
    blocks: [
      { title: 'Where we are',
        lines: ['414 West Rich Street', 'Franklinton', 'Columbus, OH 43215'] },
      { title: 'Talk to us',
        lines: ['(614) 555-0133', 'hello@vespersits.example'] }
    ],
    form: {
      title: 'Tell us you are coming',
      contactLegend: 'About you',
      phoneLabel: 'Phone',
      phonePlaceholder: '(614) 555-0133',
      emailLabel: 'Email, if you prefer',
      whereLegend: 'Where you are starting from',
      addressLabel: 'Have you sat before?',
      addressPlaceholder: 'Never, a bit, or for years',
      jobLegend: 'What and when',
      choiceLabel: 'What are you coming to',
      choices: ['Evening sitting', 'Beginners’ course', 'Long sit', 'The quiet room'],
      defaultChoice: 'Evening sitting',
      dateLabel: 'Which day',
      timeLabel: 'Time of day',
      times: ['Morning', 'Evening', 'Either'],
      defaultTime: 'Evening',
      notesLabel: 'Anything we should know',
      notesPlaceholder: 'Knees, back, hips — we have chairs and benches too.',
      button: 'Let us know',
      confirm: '{choice}, {date}, {time}. See you there, {name}.',
      note: 'This is a demonstration site and no booking system is connected, '
          + 'so nothing was sent.',
      nameError: 'Add your name so we know who to expect.',
      phoneError: 'Add a phone number so we can reach you.',
      addressError: 'Let us know how much you have done before.',
      dateError: 'Pick a day.'
    }
  },

  footer: {
    mark: 'Vesper',
    left: 'A room to sit in, Franklinton',
    right: 'Pay what you can'
  }
};

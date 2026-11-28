/*
 * PREVIEW BASE: a barbershop. Not a site and not an example business. It is
 * what tools/preview.js copies for `--trade barber`, in place of the example
 * at sites/barber/.
 *
 * Why it exists. The other trades' previews start from their example site and
 * scrub out what reads as a claim. That cannot work for the barbershop
 * example: it is full of facts a pattern cannot tell from prose, such as
 * "Comb & Coat is Dre at the first chair, Sam and Jun beside him", "three
 * barbers and two nail technicians" and "since 2020". Copied into a
 * stranger's preview, each would be an invented fact about their shop.
 *
 * So this base is written to say nothing that is not true of every
 * barbershop: no names, no counts, no years, no address, no hours, no prices,
 * no promises, and no nail bar. Each line is either the layout's own words (a
 * section title) or a plain description of a service, which the shop confirms
 * or rewrites before launch: tools/launch-check.js lists every one of them.
 *
 * The design is the barbershop example's: the same layout, theme and photos
 * (barbering only; the nail photos stay with the example). The photos are
 * the kit's free-licence stock, to be replaced by the shop's own.
 */
const example = require('../../sites/barber/content.js');

module.exports = {
  lang: 'en',
  kind: 'business',
  layout: 'atelier',

  sections: ['belt', 'showcase', 'list', 'story', 'band', 'contact'],

  name: 'Barbershop',
  short: 'Barbershop',

  seo: { type: 'BarberShop' },

  theme: Object.assign({}, example.theme),

  cta: { label: 'Book', href: '#book' },

  hero: {
    label: 'The shop',
    eyebrow: 'Barbershop',
    primary: { label: 'Book a chair', href: '#book' },
    headline: 'Fresh cuts,',
    headlineAccent: 'clean lines.',
    lead: 'Cuts, fades, beards and shaves.',
    footNote: 'Scroll',
    slides: [
      { img: 'hero-fade.webp',
        alt: 'A barber with a tattooed forearm combing up the top of a fresh skin fade',
        title: 'Cuts and fades',
        text: 'Clipper or scissor, finished at the neckline.',
        tint: '#1c1713' }
    ]
  },

  belt: [
    { img: 'chair.webp', text: 'Cuts and fades' },
    { img: 'razor.webp', text: 'Shaves with a straight razor' },
    { img: 'curls.webp', text: 'Curls and texture' },
    { img: 'clipper-fade.webp', text: 'Clipper and scissor work' },
    { img: 'beard-bw.webp', text: 'Beards shaped and lined' }
  ],

  showcase: {
    id: 'work',
    navLabel: 'Work',
    eyebrow: 'What the chairs are for',
    title: 'Cuts, beards and shaves',
    text: 'A haircut, a beard, or both in one sitting.',
    cards: [
      { img: 'clipper-fade.webp',
        alt: 'A barber taking the sides down to a skin fade with clippers',
        title: 'Fades',
        text: 'Taken down with clippers and blended into the length on top.' },
      { img: 'curls.webp',
        alt: 'A barber shaping a client’s curls with a pick and clippers',
        title: 'Curls and texture',
        text: 'Shaped for the way the hair grows and sits.' },
      { img: 'razor.webp',
        alt: 'A barber holding a straight razor to a client’s cheek under warm light',
        title: 'Shaves',
        text: 'Hot towels and a straight razor.' },
      { img: 'beard-bw.webp',
        alt: 'A black and white close-up of scissors shaping a full beard',
        title: 'Beards',
        text: 'Shaped to the face, with the neckline cleaned up.' }
    ]
  },

  list: {
    id: 'services',
    navLabel: 'Services',
    eyebrow: 'Services',
    title: 'Services',
    text: 'What you can book.',
    groups: [
      { name: 'Cuts', items: [
        { title: 'Haircut', text: 'Cut with clippers, scissors or both, then styled.' },
        { title: 'Skin fade', text: 'Faded down to the skin at the sides.' },
        { title: 'Buzz cut', text: 'One length all over.' },
        { title: 'Kids’ cut', text: 'Any cut, for the younger ones.' },
        { title: 'Line-up', text: 'The edges and the neckline, between cuts.' }
      ]},
      { name: 'Beards and shaves', items: [
        { title: 'Beard trim', text: 'Shaped and lined.' },
        { title: 'Hot towel shave', text: 'Hot towels, lather and a straight razor.' },
        { title: 'Head shave', text: 'Taken down with a razor.' }
      ]},
      { name: 'Together', items: [
        { title: 'Cut and beard', text: 'Both in one sitting.' }
      ]}
    ]
  },

  story: {
    id: 'about',
    navLabel: 'The shop',
    eyebrow: 'About',
    title: 'About the shop',
    img: 'shop.webp',
    alt: 'Three leather barber chairs under warm pendant lights against a brick wall',
    paragraphs: ['[their story, in their words]'],
    facts: []
  },

  band: {
    img: 'chair.webp',
    alt: 'A tufted leather barber chair under a row of warm bulbs',
    title: 'Your next cut starts here.',
    link: { label: 'Book a time', href: '#book' }
  },

  contact: {
    id: 'book',
    navLabel: 'Find us',
    eyebrow: 'Book',
    title: 'Book a time',
    hoursTitle: 'When we are open',
    hours: [
      ['Monday', '—'],
      ['Tuesday to Friday', '—'],
      ['Saturday', '—'],
      ['Sunday', '—']
    ],
    blocks: [
      { title: 'Where we are', lines: ['[address]'] },
      { title: 'Talk to us', lines: ['[phone number]', '[email]'] }
    ],
    form: Object.assign({}, example.contact.form, {
      choices: ['Haircut', 'Skin fade', 'Beard or shave', 'Cut and beard'],
      defaultChoice: 'Haircut',
      whereLegend: 'Who you see',
      addressLabel: 'Have you been to us before?',
      addressPlaceholder: 'First time, or who usually cuts your hair',
      phonePlaceholder: '',
      notesPlaceholder: 'A photo of the cut you are after helps.',
      confirm: '{choice} for {name}, {date}, {time}. We will be in touch to confirm.',
      note: 'This is a preview and no booking system is connected, so nothing was sent.'
    })
  },

  footer: {
    mark: 'Barbershop',
    left: 'Barbershop',
    right: ''
  }
};

/*
 * EXAMPLE CONTENT. Ninefold is an invented product: a meditation cushion and
 * the mat that goes under it. There is no company, no shop and no stock.
 *
 * Every name, size, price and claim here is made up. The photos are the
 * kit's free-licence stock, copied from sites/meditation/img; they show
 * cushions and mats in general, not this one.
 *
 * Why it exists: the first page this kit built that is not a business. It
 * sets `kind: 'product'`, so it has no contact section and no form, and the
 * build is happy about that. It is the test that the builder can make a page
 * whose job is to sell one thing rather than take an enquiry.
 *
 * On the design direction. A meditation product defaults to sage green, a
 * lotus and a thin script. This is a rice-paper ground and an indigo taken
 * from dyed cotton, with a calm serif (Newsreader) in a light weight for the
 * words and Instrument Sans for everything you act on.
 *
 * On the words. Each line says what changes for the person sitting on it:
 * knees lower than hips, ankles on something soft, a cover you can wash.
 */
module.exports = {
  lang: 'en',

  kind: 'product',

  sections: [
    'showcase',
    'story',
    'list',
    'band'
  ],
  name: 'Ninefold',
  short: 'Ninefold',

  seo: {
    title: 'Ninefold — a meditation cushion and the mat beneath it',
    description:
      'A buckwheat cushion you can tune to your hips, and a cotton mat that '
      + 'keeps your ankles off the floor. An invented product.',
    type: 'Product'
  },

  theme: {
    bg: '#f4f1ea',        // rice paper
    ink: '#1b1a18',       // 15.42:1 on the ground
    muted: '#5d5850',     // 6.25:1
    line: '#e2ddd2',
    soft: '#ebe6db',
    accent: '#2e3f6e',    // 9.07:1. Indigo, from dyed cotton.
    tag: '#4f5b3a',       // 6.44:1
    tint: '#e4e3ea',
    display: '"Newsreader", "Iowan Old Style", Georgia, serif',
    body: '"Instrument Sans", "Helvetica Neue", Arial, system-ui, sans-serif',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,500&family=Instrument+Sans:wght@400;600&display=swap'
  },

  cta: { label: 'Sizes and prices', href: '#sizes' },

  hero: {
    label: 'The cushion and the mat',
    eyebrow: 'A meditation cushion and its mat',
    headline: 'Sit longer,',
    headlineAccent: 'ache less.',
    primary: { label: 'Choose a size', href: '#sizes' },
    slides: [
      { img: 'cushion.webp',
        alt: 'A dark round cushion on a tatami floor in low light',
        title: 'The cushion',
        text: 'Buckwheat hulls you can add or take out, until your hips sit just above your knees.',
        meta: 'From $78',
        tint: '#e4e3ea' },
      { img: 'shoji.webp',
        alt: 'Grey mats laid out on a wooden floor in light through a lattice screen',
        title: 'The mat',
        text: 'Cotton folded nine times, so knees and ankles rest on something soft.',
        meta: 'From $96',
        tint: '#ebe6db' },
      { img: 'hall-blue.webp',
        alt: 'Rows of round cushions on a blue floor in front of tall lattice windows',
        title: 'The pair',
        text: 'Made to be sat on every day, alone or in a room of thirty.',
        meta: '$165',
        tint: '#dfe5ee' }
    ]
  },

  showcase: {
    id: 'why',
    navLabel: 'What it does',
    eyebrow: 'What changes when you sit on it',
    title: 'Made for the twentieth minute',
    text: 'Most cushions are comfortable for five. These four details are '
        + 'about what happens after that.',
    cards: [
      { img: 'cushion.webp',
        alt: 'A dark round cushion on a tatami floor',
        title: 'Tune the height',
        meta: '12 to 18 cm',
        text: 'Open the inner zip and add or take out a cup of hulls. Your hips '
            + 'should sit just above your knees.' },
      { img: 'shoji.webp',
        alt: 'Grey mats on a wooden floor in slatted light',
        title: 'A mat for the ankles',
        meta: 'Nine folds',
        text: 'The cushion lifts your hips; the mat is what your knees and '
            + 'ankles rest on for the next half hour.' },
      { img: 'round.webp',
        alt: 'A bright, empty studio with grey mats on a dark floor',
        title: 'Quiet when you shift',
        meta: 'Cleaned twice',
        text: 'The hulls are sifted and cleaned twice, so moving your weight '
            + 'makes no crackle in a quiet room.' },
      { img: 'beams.webp',
        alt: 'A long attic room under wooden beams, with mats in two rows',
        title: 'Covers that come off',
        meta: 'Washable',
        text: 'A zipped linen cover over a cotton inner, both washable at 30°. '
            + 'A spare cover is sold on its own.' }
    ]
  },

  story: {
    id: 'made',
    navLabel: 'How it is made',
    eyebrow: 'Why buckwheat, and why nine folds',
    title: 'Firm enough to hold, soft enough to sink',
    img: 'beams.webp',
    alt: 'A long attic room under wooden beams, with mats laid out in two rows',
    paragraphs: [
      'Foam pushes back. Buckwheat hulls move out of the way and then stay '
      + 'there, so the cushion takes the shape of how you sit and keeps it '
      + 'for the whole sitting.',
      'The mat is one length of cotton batting folded nine times and stitched '
      + 'through, which is where the name comes from. Folded, it stays flat for '
      + 'years instead of thinning where the knees go.',
      'Neither needs anything from you except a shake now and then, and a wash '
      + 'when the cover asks for one.'
    ],
    facts: [
      { value: 9, label: 'folds in the mat' },
      { value: 3, label: 'cushion heights' },
      { value: 2, label: 'kilos of buckwheat' }
    ]
  },

  list: {
    id: 'sizes',
    navLabel: 'Sizes',
    eyebrow: 'Sizes and prices',
    title: 'Pick a height, then a mat',
    text: 'If you are not sure of the height, the standard cushion suits most '
        + 'people, and the hulls let you change it later.',
    note: 'An invented product for testing this kit: there is no shop behind '
        + 'this page, and nothing on it can be bought.',
    groups: [
      { name: 'Cushions', items: [
        { title: 'Low', meta: '$78', text: '12 cm. For a kneeling bench habit, or long legs.' },
        { title: 'Standard', meta: '$84', text: '15 cm. Where most people start.' },
        { title: 'Tall', meta: '$90', text: '18 cm. For stiff hips, or sitting cross-legged.' }
      ]},
      { name: 'Mats', items: [
        { title: 'Single', meta: '$96', text: '70 by 80 cm. Room for knees and ankles.' },
        { title: 'Wide', meta: '$118', text: '90 by 100 cm. Room to change how you sit.' }
      ]},
      { name: 'Together', items: [
        { title: 'Standard cushion and single mat', meta: '$165', text: '$180 apart.' },
        { title: 'Tall cushion and wide mat', meta: '$192', text: '$208 apart.' }
      ]},
      { name: 'Spares', items: [
        { title: 'Buckwheat hulls, 1 kg', meta: '$14', text: 'To make a cushion taller.' },
        { title: 'Linen cover', meta: '$32', text: 'Indigo, rust, oat or charcoal.' }
      ]}
    ]
  },

  band: {
    img: 'hall-dim.webp',
    alt: 'Rows of low cushions in a dim hall under a rough plaster wall',
    title: 'Sit on it for ten minutes. Then decide.',
    link: { label: 'See the sizes', href: '#sizes' }
  },

  footer: {
    mark: 'Ninefold',
    left: 'A meditation cushion and the mat beneath it',
    right: 'An invented product, made to test this kit'
  }
};

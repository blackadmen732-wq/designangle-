/*
 * EXAMPLE CONTENT. Pomelo Kitchen is an invented restaurant.
 * Every name, price, address, phone number and photo here is a placeholder.
 * Photos are free-licence stock from Unsplash; replace them with the client's own.
 */
module.exports = {
  lang: 'en',

  // The sections this page has, in order. One name per line. Each name is also
  // the key its content lives under below, so 'story' renders `story:`.
  sections: [
    'belt',
    'showcase',
    'list',
    'story',
    'band',
    'contact'
  ],

  name: 'Pomelo Kitchen',
  short: 'Pomelo',
  seo: {
    title: 'Pomelo Kitchen | Wood-fire kitchen & citrus bar',
    description: 'A wood-fire kitchen and citrus bar. One oak-fired oven, one long table, a short menu that changes with the market.',
    type: 'Restaurant',
    servesCuisine: 'Wood-fired, Italian',
    priceRange: '$$',
    telephone: '(555) 010-2140',
    address: { streetAddress: '214 Harbour Street', addressLocality: 'Your City' }
  },
  theme: {
    accent: '#db2235', soft: '#fff4f1', tint: '#ffe3dc', tag: '#1f6b45'
  },
  cta: { label: 'Reserve', href: '#visit' },

  hero: {
    label: 'Featured dishes',
    eyebrow: 'Wood-fire kitchen & citrus bar',
    headline: 'Straight from the fire,',
    headlineAccent: 'still crackling.',
    primary: { label: 'Book a table', href: '#visit' },
    slides: [
      { img: 'pizza.webp', alt: 'Margherita pizza with a blistered crust and fresh basil', title: 'Margherita al forno', text: 'San Marzano tomato, fior di latte and basil on 48-hour dough, blistered in ninety seconds.', meta: '$18', tint: '#ffe3dc' },
      { img: 'farfalle.webp', alt: 'Farfalle in green pesto with cherry tomatoes', title: 'Farfalle, basil pesto', text: 'Hand-cut farfalle tossed in basil pesto with cherry tomatoes and rocket.', meta: '$16', tint: '#e3f2df' },
      { img: 'salmon.webp', alt: 'Grilled salmon fillet on greens with a lime wedge', title: 'Charred salmon, lime', text: 'Fire-grilled salmon over wilted greens and ribbon vegetables, finished with lime.', meta: '$26', tint: '#dcedf4' },
      { img: 'steak.webp', alt: 'Sliced grilled steak with fries', title: 'Oak-grilled steak & fries', text: 'Sliced bavette off the oak grill with rosemary fries and parsley.', meta: '$32', tint: '#ffefc7' },
      { img: 'cake.webp', alt: 'A slice of layered raspberry cream cake', title: 'Raspberry cream cake', text: 'Layers of sponge, vanilla cream and fresh raspberries. The house sweet.', meta: '$9', tint: '#ffe0e8' }
    ]
  },

  belt: [
    { img: 'pizza.webp', text: 'Wood-fired' },
    { img: 'farfalle.webp', text: 'Hand-cut daily' },
    { img: 'salmon.webp', text: 'Off the boat at six' },
    { img: 'steak.webp', text: 'Grilled over oak' },
    { img: 'cake.webp', text: 'Finished with citrus' }
  ],

  showcase: {
    id: 'tonight', navLabel: 'Tonight', eyebrow: 'Tonight',
    title: 'Six plates we would order ourselves.',
    text: 'Keep going. The table fills up as you move.',
    cards: [
      { img: 'salad.webp', alt: 'A dark bowl of salad leaves with olives beside cut oranges', title: 'Citrus & garden leaves', meta: '$12', text: 'Leaves, olives, feta and toasted walnuts in orange dressing.' },
      { img: 'penne.webp', alt: 'A white plate of penne in tomato ragù', title: 'Penne al ragù', meta: '$17', text: 'Slow-cooked ragù, tomato, black pepper and pecorino.' },
      { img: 'fish.webp', alt: 'Seared fish topped with diced cucumber salsa', title: 'Sea trout, cucumber salsa', meta: '$24', text: 'Seared trout on wilted greens with cucumber and apple salsa.' },
      { img: 'pork.webp', alt: 'A grilled pork chop topped with roasted apple, with broccoli', title: 'Pork chop, roasted apple', meta: '$25', text: 'Thick-cut chop from the grill, roasted apple and charred broccoli.' },
      { img: 'tagliatelle.webp', alt: 'A pan of tagliatelle with beef and mushrooms', title: 'Tagliatelle, beef & mushroom', meta: '$19', text: 'Pan-tossed with seared beef, mushrooms and spinach.' },
      { img: 'pannacotta.webp', alt: 'Small jars of panna cotta topped with strawberries', title: 'Strawberry panna cotta', meta: '$8', text: 'Set vanilla cream in a jar under macerated strawberries.' }
    ]
  },

  list: {
    id: 'menu', navLabel: 'Menu', eyebrow: 'The menu',
    title: 'Short list. Big flavour.',
    text: 'We cook what the market sends us, so the menu changes with the week. This is what is on tonight.',
    note: 'V = vegetarian. Tell your server about any allergies before you order.',
    groups: [
      { name: 'Small plates', items: [
        { title: 'Citrus & garden leaves', meta: '$12', text: 'Olives, feta, toasted walnuts, orange dressing.', tag: 'V' },
        { title: 'Burrata & heirloom tomato', meta: '$14', text: 'Lemon oil, green leaves, cracked pepper.', tag: 'V' },
        { title: 'Ember-roasted carrots', meta: '$11', text: 'Whipped feta, orange, toasted seeds.', tag: 'V' },
        { title: 'Wood-oven flatbread', meta: '$8', text: 'Garlic butter, sea salt, charred lemon.', tag: 'V' },
        { title: 'Grilled octopus', meta: '$17', text: 'Smoked paprika, potato, parsley oil.' },
        { title: 'Blistered padrón peppers', meta: '$9', text: 'Lime salt. One in ten is hot.', tag: 'V' }
      ] },
      { name: 'From the fire', items: [
        { title: 'Margherita al forno', meta: '$18', text: 'San Marzano tomato, fior di latte, basil.', tag: 'V' },
        { title: 'Farfalle, basil pesto', meta: '$16', text: 'Cherry tomatoes, rocket, pecorino.', tag: 'V' },
        { title: 'Penne al ragù', meta: '$17', text: 'Slow-cooked ragù, tomato, black pepper.' },
        { title: 'Tagliatelle, beef & mushroom', meta: '$19', text: 'Seared beef, mushrooms, spinach.' },
        { title: 'Charred salmon, lime', meta: '$26', text: 'Wilted greens, ribbon vegetables.' },
        { title: 'Sea trout, cucumber salsa', meta: '$24', text: 'Cucumber, apple, wilted greens.' },
        { title: 'Pork chop, roasted apple', meta: '$25', text: 'Charred broccoli, pan juices.' },
        { title: 'Oak-grilled steak & fries', meta: '$32', text: 'Bavette, rosemary fries, parsley.' }
      ] },
      { name: 'Sweets', items: [
        { title: 'Raspberry cream cake', meta: '$9', text: 'Sponge, vanilla cream, fresh raspberries.', tag: 'V' },
        { title: 'Strawberry panna cotta', meta: '$8', text: 'Vanilla cream, macerated strawberries.' },
        { title: 'Burnt honey ice cream', meta: '$7', text: 'Olive oil, flaky salt.', tag: 'V' },
        { title: 'Wood-oven peaches', meta: '$10', text: 'Mascarpone, thyme, almond crumb.', tag: 'V' }
      ] }
    ]
  },

  story: {
    id: 'story', navLabel: 'Our kitchen', eyebrow: 'Our kitchen',
    img: 'table.webp', alt: 'A plated dish being set down on a long table with wine glasses and bread',
    title: 'One oven, one long table, no shortcuts.',
    paragraphs: [
      'Everything at Pomelo passes through a single oak-fired oven. The dough rests for two days before it gets anywhere near it. The fish comes in at six, and when it is gone, it is gone.',
      'We finish almost every plate with citrus, because a squeeze of something sharp makes smoke taste better. That is where the name comes from.'
    ],
    facts: [
      { value: 450, suffix: '°C', label: 'oven floor temperature' },
      { value: 48, suffix: ' h', label: 'dough fermentation' },
      { value: 38, suffix: '', label: 'seats, one long table' }
    ]
  },

  band: {
    img: 'room.webp', alt: 'The dining room in the evening, tables set and lamps lit',
    title: 'Fridays and Saturdays, the oven burns until eleven.',
    link: { label: 'See the hours', href: '#visit' }
  },

  contact: {
    id: 'visit', navLabel: 'Visit', eyebrow: 'Visit', title: 'Pull up a chair.',
    hoursTitle: 'Hours',
    hours: [['Monday', 'Closed'], ['Tuesday to Thursday', '17:00 – 22:00'], ['Friday & Saturday', '12:00 – 23:00'], ['Sunday', '12:00 – 21:00']],
    blocks: [
      { title: 'Find us', lines: ['214 Harbour Street', 'Ground floor, the old sail loft'] },
      { title: 'Talk to us', lines: ['hello@pomelokitchen.example', '(555) 010-2140'], selectable: true }
    ],
    form: {
      title: 'Reserve a table',
      contactLegend: 'How we reach you',
      phoneLabel: 'Phone', phonePlaceholder: '(555) 000-0000',
      emailLabel: 'Email',
      jobLegend: 'Your table',
      notesLabel: 'Anything we should know',
      notesPlaceholder: 'Allergies, a birthday, a pushchair.',
      phoneError: 'Add a phone number so we can confirm the table.',
      times: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'], defaultTime: '19:00',
      choiceLabel: 'Guests', choices: ['1', '2', '3', '4', '5', '6', '7', '8'], defaultChoice: '2',
      button: 'Request this table',
      confirm: 'Table for {choice} on {date} at {time}, under {name}.',
      note: 'This is a demonstration site and no booking system is connected, so nothing was sent.',
      nameError: 'Add a name for the booking.', dateError: 'Pick a date for the booking.'
    }
  },

  footer: { mark: 'Pomelo', left: '© Pomelo Kitchen', right: 'Wood-fire kitchen & citrus bar' }
};

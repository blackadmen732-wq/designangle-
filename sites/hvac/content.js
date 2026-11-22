/*
 * EXAMPLE CONTENT. Northwind Heating & Air is an invented company.
 * Every name, price, guarantee, number, address and photo here is a placeholder.
 * Do not publish any of it for a real client: replace it with their real facts.
 * Photos are free-licence stock from Unsplash; replace them with the client's own.
 */
module.exports = {
  lang: 'en',
  name: 'Northwind Heating & Air',
  short: 'Northwind',
  seo: {
    title: 'Northwind Heating & Air | Heating and cooling, fixed properly',
    description: 'Heating and cooling repair, installation and maintenance. Upfront prices, tidy work, and one technician from quote to finish.',
    type: 'HVACBusiness',
    priceRange: '$$',
    telephone: '(555) 010-4470',
    areaServed: 'Your City',
    address: { streetAddress: '18 Foundry Lane', addressLocality: 'Your City' }
  },
  theme: {
    accent: '#0b63ce', soft: '#f1f6fc', tint: '#dcebfb', tag: '#0b63ce',
    ink: '#101820', muted: '#5b6672', line: '#e4e9ef'
  },
  cta: { label: 'Get a quote', href: '#book' },

  hero: {
    label: 'Featured services',
    eyebrow: 'Heating, cooling & air quality',
    headline: 'The right temperature,',
    headlineAccent: 'every room.',
    primary: { label: 'Book a visit', href: '#book' },
    slides: [
      { img: 'thermostat.webp', alt: 'A round smart thermostat on a white wall showing 63 degrees', title: 'Smart thermostat install', text: 'Fitted, wired and set up on your phone in one visit, with a schedule that matches your week.', meta: 'From $249', tint: '#dcebfb' },
      { img: 'repair.webp', alt: 'Hands repairing a circuit board with a fine tool', title: 'Same-day repairs', text: 'Most faults are a control board, a capacitor or a sensor. We carry the common parts on the van.', meta: 'Call-out $89', tint: '#ffe9d6' },
      { img: 'plans.webp', alt: 'Hands drawing on a set of building plans', title: 'New system design', text: 'We measure every room and size the system to the house, so it is never too big or too small.', meta: 'Free quote', tint: '#e6f2e4' },
      { img: 'pipework.webp', alt: 'Grey pipework and valves mounted on a brick wall', title: 'Boilers & pipework', text: 'Boiler swaps, leaking valves and noisy pipes, pressure-tested before we leave.', meta: 'From $180', tint: '#f3e3dc' },
      { img: 'app.webp', alt: 'A hand holding a phone with a home control app open', title: 'Comfort from your phone', text: 'Zone control and alerts in one app, so you can warm the house up on the way home.', meta: 'From $320', tint: '#e8e6f6' }
    ]
  },

  belt: [
    { img: 'thermostat.webp', text: 'Upfront prices' },
    { img: 'repair.webp', text: 'Same-day repairs' },
    { img: 'plans.webp', text: 'Sized to your home' },
    { img: 'pipework.webp', text: 'Pressure-tested' },
    { img: 'app.webp', text: 'One technician, start to finish' }
  ],

  showcase: {
    id: 'services', navLabel: 'Services', eyebrow: 'What we fit',
    title: 'Six ways to a comfortable home.',
    text: 'Keep going. There is a fix for every room.',
    cards: [
      { img: 'room-light.webp', alt: 'A bright living room with a sofa, plant and floor lamp', title: 'Ductless mini-splits', meta: 'From $2,900', text: 'Heating and cooling for one room or an extension, with no ductwork.' },
      { img: 'room-open.webp', alt: 'A large open-plan living room with wide windows', title: 'Central air', meta: 'From $5,400', text: 'One quiet system for the whole house, sized room by room.' },
      { img: 'room-blue.webp', alt: 'A living room with a blue sofa and a herringbone wood floor', title: 'Heat pumps', meta: 'From $6,800', text: 'Heats in winter, cools in summer, and runs on electricity.' },
      { img: 'room-chair.webp', alt: 'A calm room with a yellow armchair and a floor lamp', title: 'Air quality', meta: 'From $450', text: 'Filtration and humidity control for dust, pollen and dry winter air.' },
      { img: 'room-modern.webp', alt: 'A modern living room with a large sofa and timber wall', title: 'Zoning', meta: 'From $1,200', text: 'Different temperatures upstairs and downstairs, on one system.' },
      { img: 'room-warm.webp', alt: 'A warm neutral living room with a sectional sofa', title: 'Care plan', meta: '$19 / month', text: 'Two tune-ups a year, priority call-outs and no call-out fee.' }
    ]
  },

  list: {
    id: 'pricing', navLabel: 'Pricing', eyebrow: 'Pricing',
    title: 'Prices before we start.',
    text: 'You get a fixed price in writing before any work begins. These are our usual starting points.',
    note: 'Starting prices for a standard home. Your written quote is the price you pay.',
    groups: [
      { name: 'Repair', items: [
        { title: 'Diagnostic call-out', meta: '$89', text: 'Fault found and explained. Taken off the bill if we do the repair.' },
        { title: 'Capacitor or contactor', meta: '$160', text: 'The most common reason an outdoor unit will not start.' },
        { title: 'Thermostat replacement', meta: '$190', text: 'Standard programmable model, fitted and tested.' },
        { title: 'Refrigerant leak repair', meta: 'From $320', text: 'Leak located, sealed, pressure-tested and recharged.' },
        { title: 'Blower motor', meta: 'From $480', text: 'Supply and fit, including the run capacitor.' },
        { title: 'After-hours call-out', meta: '$149', text: 'Evenings, weekends and holidays.', tag: '24/7' }
      ] },
      { name: 'Install', items: [
        { title: 'Smart thermostat', meta: 'From $249', text: 'Fitted, wired and set up on your phone.' },
        { title: 'Ductless mini-split', meta: 'From $2,900', text: 'Single room, including wall bracket and line set.' },
        { title: 'Central air system', meta: 'From $5,400', text: 'Outdoor unit, coil and controls, sized to the house.' },
        { title: 'Heat pump', meta: 'From $6,800', text: 'Replaces furnace and air conditioner in one system.' }
      ] },
      { name: 'Care plans', items: [
        { title: 'Seasonal tune-up', meta: '$129', text: 'One visit: clean, test, and a written report.' },
        { title: 'Care plan', meta: '$19 / month', text: 'Two tune-ups a year, priority call-outs, no call-out fee.' },
        { title: 'Filter service', meta: '$15 / month', text: 'The right filters, delivered and fitted on schedule.' }
      ] }
    ]
  },

  story: {
    id: 'about', navLabel: 'How we work', eyebrow: 'How we work',
    img: 'desk.webp', alt: 'A technician sketching a system layout on paper plans at a workbench',
    title: 'Measured first, then fitted once.',
    paragraphs: [
      'Most comfort problems start with a system that was the wrong size for the house. So before we quote, we measure every room, check the insulation and look at the ductwork that is already there.',
      'The technician who quotes the job is the one who does it. You get a fixed price in writing, a tidy site, and a walkthrough of the controls before we leave.'
    ],
    facts: [
      { value: 90, suffix: ' min', label: 'typical repair visit' },
      { value: 12, suffix: ' mo', label: 'workmanship guarantee' },
      { value: 7, suffix: ' days', label: 'a week for emergencies' }
    ]
  },

  band: {
    img: 'house.webp', alt: 'A modern house at dusk with warm light in the windows',
    title: 'No heat tonight? We answer the phone at any hour.',
    link: { label: 'Book an urgent visit', href: '#book' }
  },

  contact: {
    id: 'book', navLabel: 'Book', eyebrow: 'Book a visit', title: 'Tell us what is wrong.',
    hoursTitle: 'Opening hours',
    hours: [['Monday to Friday', '07:00 – 19:00'], ['Saturday', '08:00 – 16:00'], ['Sunday', 'Emergencies only'], ['Emergency line', '24 hours']],
    blocks: [
      { title: 'Where we work', lines: ['Your City and the surrounding area', 'Workshop: 18 Foundry Lane'] },
      { title: 'Talk to us', lines: ['hello@northwindair.example', '(555) 010-4470'], selectable: true }
    ],
    form: {
      title: 'Request a visit',
      dateLabel: 'Preferred date', timeLabel: 'Arrival window',
      times: ['08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00', '14:00 – 16:00', '16:00 – 18:00'], defaultTime: '10:00 – 12:00',
      choiceLabel: 'What do you need?', choices: ['Repair', 'New installation', 'Tune-up', 'Not sure yet'], defaultChoice: 'Repair',
      button: 'Request this visit',
      confirm: '{choice} visit on {date}, {time}, for {name}.',
      note: 'This is a preview site, so the request has not been sent to anyone yet.',
      nameError: 'Add your name so we know who to ask for.', dateError: 'Pick a date for the visit.'
    }
  },

  footer: { mark: 'Northwind', left: '© Northwind Heating & Air', right: 'Heating, cooling & air quality' }
};

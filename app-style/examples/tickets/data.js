// Exported from a Trac 1.6 project by source/export.py. Invented data; see source/seed.py.
window.TRAC = {
 "project": "Northwind website",
 "exported": "2026-11-26T14:45:52+00:00",
 "source": "Trac 1.6, seeded by seed.py. Invented studio, people and tickets.",
 "milestones": [
  {
   "name": "Launch",
   "due": "2026-12-02T09:59:35+00:00",
   "completed": null,
   "description": "The site goes live for Northwind Heating & Air."
  },
  {
   "name": "Winter care plan",
   "due": "2026-12-26T09:59:35+00:00",
   "completed": null,
   "description": "The care plan page and its price list."
  }
 ],
 "components": [
  "Booking form",
  "Copy",
  "Hero and photos",
  "Owner panel",
  "Speed"
 ],
 "people": [
  "jo",
  "priya",
  "sam"
 ],
 "tickets": [
  {
   "id": 1,
   "summary": "Booking form accepts a lead with no phone number",
   "type": "defect",
   "priority": "blocker",
   "component": "Booking form",
   "owner": "sam",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "new",
   "resolution": null,
   "description": "Submitting with the phone field empty still shows \"Thanks\". A lead needs a name and a phone number, and the collector refuses one without them, so the form must not say thanks first.",
   "opened": "2026-11-23T17:59:35+00:00",
   "changed": "2026-11-23T22:59:35+00:00",
   "events": [
    {
     "at": "2026-11-23T19:59:35+00:00",
     "author": "jo",
     "comment": "Seen in Safari and Chrome. The thank-you screen shows and nothing reaches the owner's list.",
     "changes": []
    },
    {
     "at": "2026-11-23T22:59:35+00:00",
     "author": "sam",
     "comment": "The collector does refuse it. The form shows Thanks before the reply comes back. Changing it to wait for the reply.",
     "changes": []
    }
   ],
   "attachments": []
  },
  {
   "id": 2,
   "summary": "Hero photo takes 4 seconds on a phone over 3G",
   "type": "defect",
   "priority": "critical",
   "component": "Speed",
   "owner": "priya",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "assigned",
   "resolution": null,
   "description": "thermostat.webp is 1.8 MB. Export at quality 74, max 1600px.",
   "opened": "2026-11-23T22:29:35+00:00",
   "changed": "2026-11-24T16:29:35+00:00",
   "events": [
    {
     "at": "2026-11-24T08:29:35+00:00",
     "author": "sam",
     "comment": "Priya, can you take this one?",
     "changes": [
      {
       "field": "status",
       "from": "new",
       "to": "assigned"
      }
     ]
    },
    {
     "at": "2026-11-24T12:29:35+00:00",
     "author": "priya",
     "comment": "Exported at quality 74 and 1600px wide: 1.8 MB down to 212 KB.",
     "changes": []
    },
    {
     "at": "2026-11-24T13:29:35+00:00",
     "author": "jo",
     "comment": "Is that enough on a phone?",
     "changes": []
    },
    {
     "at": "2026-11-24T16:29:35+00:00",
     "author": "priya",
     "comment": "Testing on a throttled 3G profile next, then adding an 800px version for phones.",
     "changes": []
    }
   ],
   "attachments": []
  },
  {
   "id": 3,
   "summary": "Owner panel: call taps shown as calls",
   "type": "defect",
   "priority": "critical",
   "component": "Owner panel",
   "owner": "sam",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "accepted",
   "resolution": null,
   "description": "The weekly email says \"45 calls\". They are taps on the number, not calls.",
   "opened": "2026-11-24T02:59:35+00:00",
   "changed": "2026-11-24T08:59:35+00:00",
   "events": [
    {
     "at": "2026-11-24T08:59:35+00:00",
     "author": "sam",
     "comment": "Taps live in mk_events and real calls in mk_calls. The email will say \"45 taps on your number\" and leave calls out until a call line is connected.",
     "changes": [
      {
       "field": "status",
       "from": "new",
       "to": "accepted"
      }
     ]
    }
   ],
   "attachments": []
  },
  {
   "id": 4,
   "summary": "Add Saturday hours to the footer",
   "type": "enhancement",
   "priority": "minor",
   "component": "Copy",
   "owner": "jo",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "new",
   "resolution": null,
   "description": "Saturday 08:00 to 16:00, as the client wrote.",
   "opened": "2026-11-24T07:29:35+00:00",
   "changed": "2026-11-24T07:29:35+00:00",
   "events": [],
   "attachments": []
  },
  {
   "id": 5,
   "summary": "Distance shows \"6.4 mi\" with no \"about\"",
   "type": "defect",
   "priority": "major",
   "component": "Booking form",
   "owner": "priya",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "new",
   "resolution": null,
   "description": "Distances are estimates and must say so.",
   "opened": "2026-11-24T11:59:35+00:00",
   "changed": "2026-11-24T14:59:35+00:00",
   "events": [
    {
     "at": "2026-11-24T14:59:35+00:00",
     "author": "jo",
     "comment": "Should read \"about 6.4 mi\". It is a straight line adjusted for roads, not a drive time.",
     "changes": []
    }
   ],
   "attachments": []
  },
  {
   "id": 6,
   "summary": "Price list: care plan from $19 a month",
   "type": "enhancement",
   "priority": "major",
   "component": "Copy",
   "owner": "jo",
   "reporter": "jo",
   "milestone": "Winter care plan",
   "status": "new",
   "resolution": null,
   "description": "The client confirmed the price by email.",
   "opened": "2026-11-24T16:29:35+00:00",
   "changed": "2026-11-24T16:29:35+00:00",
   "events": [],
   "attachments": []
  },
  {
   "id": 7,
   "summary": "Owner panel blank when the client library fails to load",
   "type": "defect",
   "priority": "major",
   "component": "Owner panel",
   "owner": "sam",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "closed",
   "resolution": "fixed",
   "description": "With the CDN blocked the panel is an empty page.",
   "opened": "2026-11-24T20:59:35+00:00",
   "changed": "2026-11-25T16:59:35+00:00",
   "events": [
    {
     "at": "2026-11-25T16:59:35+00:00",
     "author": "sam",
     "comment": "Fixed: the panel now says it could not load, and what to do.",
     "changes": [
      {
       "field": "resolution",
       "from": null,
       "to": "fixed"
      },
      {
       "field": "status",
       "from": "new",
       "to": "closed"
      }
     ]
    }
   ],
   "attachments": []
  },
  {
   "id": 8,
   "summary": "Swap the van photo into the story section",
   "type": "task",
   "priority": "trivial",
   "component": "Hero and photos",
   "owner": "jo",
   "reporter": "jo",
   "milestone": "Winter care plan",
   "status": "new",
   "resolution": null,
   "description": "The client sent a new photo.",
   "opened": "2026-11-25T01:29:35+00:00",
   "changed": "2026-11-25T01:29:35+00:00",
   "events": [],
   "attachments": []
  },
  {
   "id": 9,
   "summary": "Notice banner for the Thanksgiving closure",
   "type": "task",
   "priority": "minor",
   "component": "Owner panel",
   "owner": "sam",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "assigned",
   "resolution": null,
   "description": "Hide it after Nov 28.",
   "opened": "2026-11-25T05:59:35+00:00",
   "changed": "2026-11-25T13:59:35+00:00",
   "events": [
    {
     "at": "2026-11-25T13:59:35+00:00",
     "author": "sam",
     "comment": "Picked this up.",
     "changes": [
      {
       "field": "status",
       "from": "new",
       "to": "assigned"
      }
     ]
    }
   ],
   "attachments": []
  },
  {
   "id": 10,
   "summary": "Six ways heading touches the left edge on phones",
   "type": "defect",
   "priority": "major",
   "component": "Hero and photos",
   "owner": "priya",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "new",
   "resolution": null,
   "description": "On a phone the \"What we fit\" label and the \"Six ways\" heading sit at 0px from the left edge. Screenshot attached.",
   "opened": "2026-11-25T10:29:35+00:00",
   "changed": "2026-11-25T11:29:35+00:00",
   "events": [
    {
     "at": "2026-11-25T11:29:35+00:00",
     "author": "priya",
     "comment": "When the scroll script does not load, the section falls back to a plain row and loses its padding.",
     "changes": []
    }
   ],
   "attachments": [
    {
     "name": "six-ways-phone.webp",
     "size": 24852,
     "at": "2026-11-25T10:49:35+00:00",
     "author": "priya",
     "note": "A phone, 393 wide, with the scroll script blocked."
    }
   ]
  },
  {
   "id": 11,
   "summary": "Emergency line copy: \"24 hours\" not \"24/7\"",
   "type": "task",
   "priority": "minor",
   "component": "Copy",
   "owner": "jo",
   "reporter": "jo",
   "milestone": "Launch",
   "status": "closed",
   "resolution": "fixed",
   "description": "Use the client's own words.",
   "opened": "2026-11-25T14:59:35+00:00",
   "changed": "2026-11-26T02:59:35+00:00",
   "events": [
    {
     "at": "2026-11-26T02:59:35+00:00",
     "author": "jo",
     "comment": "Done.",
     "changes": [
      {
       "field": "resolution",
       "from": null,
       "to": "fixed"
      },
      {
       "field": "status",
       "from": "new",
       "to": "closed"
      }
     ]
    }
   ],
   "attachments": []
  },
  {
   "id": 12,
   "summary": "Reviews section: client has no reviews to show yet",
   "type": "enhancement",
   "priority": "minor",
   "component": "Copy",
   "owner": "jo",
   "reporter": "jo",
   "milestone": "Winter care plan",
   "status": "new",
   "resolution": null,
   "description": "Do not invent any. Hide the section until there are real ones.",
   "opened": "2026-11-25T19:29:35+00:00",
   "changed": "2026-11-25T19:29:35+00:00",
   "events": [],
   "attachments": []
  }
 ]
};

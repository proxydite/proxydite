/* ==========================================================================
   proxydite — content.js
   THE single source of truth for every word and media reference on the site.
   Edit here; nothing content-related lives in index.html or main.js.

   Notes:
   - "pending: true" renders a labelled placeholder frame instead of media.
     When the file or link exists, add it and set pending to false (or just
     delete the pending line).
   - Paths are case-sensitive on GitHub Pages. Match filenames exactly.
   ========================================================================== */

window.SITE_CONTENT = {

  site: {
    title: "proxydite",
    tagline: "making things for calmer futures",
    description: "Ryan Samuel Davies is a Welsh artist working across video, sound, sculpture, painting and text, based in Abertawe."
  },

  /* Header, top right, above the navigation. Icons: "x", "instagram", "substack". */
  socials: [
    { id: "x",         label: "X",         url: "https://x.com/proxydite" },
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/proxydite_/" },
    { id: "substack",  label: "Substack",  url: "https://proxydite.substack.com" }, 
    { id: "github", label: "GitHub", url: "https://github.com/proxydite/" } /* confirm URL */
  ],

  /* Set enabled: false to switch the opening animation off. It plays once
     per browser session and never for visitors who prefer reduced motion. */
  intro: { enabled: true },

  nav: [
    { label: "projects",  to: "#projects" },
    { label: "about",     to: "#about" },
    { label: "video art", to: "#video" },
    { label: "theatre",   to: "#theatre" },
    { label: "art",       to: "#art" },
    { label: "music",     to: "#music" },
    { label: "contact",   to: "#contact" }
  ],

  hero: {
    name: "Ryan Samuel Davies",
    lead: "Welsh artist working across video, sound, sculpture, painting and text, based in Abertawe.",
    image: { src: "assets/Home/hero.jpg", alt: "Ryan Samuel Davies in darkness beside the Y Cynfod clay figures, lit by projection" }
  },

  projects: {
    heading: "Ongoing Projects",
    items: [
      {
        id: "ycynfod",
        title: "Y Cynfod",
        cta: "enter the project →",
        tile: { src: "assets/Art/Y Cynfod/YCynfod.jpg", alt: "Small pale clay figures standing in near-darkness under blue projected light" },
        panel: {
          meta: "First exhibited in Shades of Existence · Elysium Gallery, Abertawe · 26 June – 5 July 2026 · Curated by Hannah Jones",
          blocks: [
            { type: "paras", items: [
              "Y Cynfod is Welsh for \"the before-beings\". The name refers to a state that exists before identity: before a body has a face, a history or a name. Y Cynfod are faceless clay figures representing matter at the point before it becomes a person, standing for existence itself rather than any individual. Across the three works in this exhibition, they appear in different states."
            ]},
            { type: "grid", cols: 3, items: [
              { kind: "image", src: "assets/Art/Y Cynfod/WeWereHere_1.jpg", alt: "We Were Here, clay figures with projection, view one", ratio: "r43" },
              { kind: "image", src: "assets/Art/Y Cynfod/WeWereHere_2.jpg", alt: "We Were Here, clay figures with projection, view two", ratio: "r43" },
              { kind: "image", src: "assets/Art/Y Cynfod/WeWereHere_3.jpg", alt: "We Were Here, clay figures with projection, view three", ratio: "r43" }
            ]},
            { type: "media", item: {
              kind: "video",
              src: "assets/video/wewerehere.mp4",
              poster: "assets/video/posters/wewerehere.jpg",
              title: "We Were Here · moving image",
              note: "assets/video/wewerehere.mp4 · self-hosted"
            }},
            { type: "grid", cols: 2, items: [
              { kind: "video",
                src: "assets/video/smallfires.mp4",
                poster: "assets/video/posters/smallfires.jpg",
                title: "smallfires",
                caption: "smallfires. Single-channel video for CRT, stereo audio. 2026." },
              { kind: "image",
                src: "assets/Art/Y Cynfod/instructionsforcontainment_ycynfod.jpg",
                alt: "Instructions for Containment, photographed in the exhibition",
                ratio: "r169",
                caption: "Instructions for Containment. 18 × 24 in. Acrylic on canvas. 2026." }
            ]},
            { type: "links", items: [
              { label: "→ y stori · read the short story", url: "field.html" }
            ]}
          ]
        }
      },
      {
        id: "sfalm",
        title: "Studies for a Loving Machine",
        cta: "enter the project →",
        tile: { src: "assets/Art/Studies for a Loving Machine/SFaLM.jpg", alt: "Diagram on orange fabric: System and Behaviour connected by a waveform" },
        panel: {
          meta: "Moving image · installation · 2025–",
          blocks: [
            { type: "paras", items: [
              "An ongoing body of moving-image and installation works examining the systems shaping life on Earth. It begins from a simple observation: most of us live inside networks we can't fully see. Energy, capital, housing, logistics, healthcare, food, data, borders; these systems choreograph our days, distributing access, risk and possibility in ways that are felt personally but rarely perceived structurally."
            ]},
            { type: "grid", cols: 2, items: [
              { kind: "image", src: "assets/Art/Studies for a Loving Machine/rocks.png", alt: "Diagram: rocks", ratio: "r54" },
              { kind: "image", src: "assets/Art/Studies for a Loving Machine/systems.png", alt: "Diagram: systems", ratio: "r54" }
            ]},
            { type: "grid", cols: 3, items: [
              { kind: "video", src: "assets/video/SFaLM_05_1.mp4", poster: "assets/video/posters/SFaLM_05_1.jpg", title: "Study 0.5" },
              { kind: "video", src: "assets/video/SFaLM_05_2.mp4", poster: "assets/video/posters/SFaLM_05_2.jpg", title: "Study 0.5" },
              { kind: "video", src: "assets/video/SFaLM_05_3.mp4", poster: "assets/video/posters/SFaLM_05_3.jpg", title: "Study 0.5" }
            ]},
            { type: "media", item: {
              kind: "image",
              src: "assets/Art/Studies for a Loving Machine/StudiesTV.jpeg",
              alt: "Studies TV",
              natural: true
            }}
          ]
        }
      }
    ]
  },

  /* Light, text-only section between Ongoing Projects and About.
     Remove an item (or empty the list) and the section hides itself. */
  upcoming: {
    heading: "Upcoming",
    items: [
      {
        title: "Trouble in Tahiti / The Seven Deadly Sins",
        role: "Video Designer",
        venue: "Opera Holland Park",
        when: "August 2026",
        url: "https://operahollandpark.com/productions/opera-prelude-trouble-in-tahiti-seven-deadly-sins/"
      },
      {
        title: "Tomorrow Town",
        by: "by Mabli Leonard",
        role: "Creative Designer",
        venue: "Volcano Theatre",
        when: "dates to be announced",
        url: ""
      }
    ]
  },

  about: {
    heading: "About",
    paragraphs: [
      "Ryan Samuel Davies is a Welsh artist working across video, sound, sculpture, painting and text, based in Abertawe. His work is concerned with existence: the impulse to make, the materiality of being, and the continuity between ancient and digital acts of creation.",
      "A 2023 graduate of the Guildhall School of Music and Drama, he also designs video and sound for theatre across Wales and England."
    ],
    bullets: [
      "Video design & screen content for theatre",
      "Sound design / composition for performance and installation",
      "Animation, projection mapping, and media systems",
      "Installation builds and documentation"
    ]
  },

  video: {
    heading: "Video Art",
    spotlight: {
      kind: "video",
      src: "assets/video/summer.mp4",
      poster: "assets/video/posters/summer.jpg",
      title: "efallai ei bod hi'n haf nawr",
      caption: "efallai ei bod hi'n haf nawr / maybe it's summer now. Single-channel video, stereo audio. 2026."
    },
    /* Prominent pair below the spotlight, above the Vimeo carousel. */
    featured: [
      { kind: "video",
        src: "assets/video/body.mp4",  poster: "assets/video/posters/body.png",
        title: "body",  caption: "body." },
      { kind: "video",
        src: "assets/video/bloom.mp4", poster: "assets/video/posters/bloom.jpg",
        title: "bloom", caption: "bloom." }
    ],
    items: [
      { kind: "vimeo", vimeoId: "713729049",  title: "Kandinsky Drawing",   caption: "Kandinsky Drawing." },
      { kind: "vimeo", vimeoId: "1035620136", title: "Moving Screens 2023", caption: "Moving Screens. 2023." },
      { kind: "vimeo", vimeoId: "974556495",  title: "sandy tides",         caption: "sandy tides." }
    ]
  },

  theatre: {
    heading: "Theatre",
    intro: "Video design for theatre: projected image, live camera, and scenic systems.",
    rowNote: "Click a production for details.",
    row: [
      { img: "assets/Theatre/BMFN.jpg",        title: "Ble Mae Fy Nghartref", year: "2025", role: "Lighting, Sound and Video Designer", venue: "Volcano Theatre", text: "Based on a true story by Eric Ngalle Charles. A new collaboration between Eric Ngalle Charles and Volcano.", url: "https://volcanotheatre.wales/bmfn/" },
      { img: "assets/Theatre/snre.JPG",        title: "Silent Night, Raging Eve", year: "2025", role: "Lighting, Sound and Video Designer", venue: "Volcano Theatre", text: "Lighting, sound and video design for Volcano Theatre.", url: "https://volcanotheatre.wales/silent-night-raging-eve/" },
      { img: "assets/Theatre/hungergames.jpg", title: "The Hunger Games On Stage", year: "2025", role: "Animator", venue: "Troubadour Theatre, Canary Wharf", text: "Animator for screen content, working for Video Designer Tal Rosner.", url: "https://thehungergamesonstage.com" },
      { img: "assets/Theatre/wtfigo1.jpeg",    title: "what the fuck is going on? (or how I see things)", year: "2025", role: "Video Designer, writer & performer", venue: "Volcano Theatre", text: "Commissioned by Volcano Theatre. Video design, writing and performance.", url: "https://volcanotheatre.wales" },
      { img: "assets/Theatre/ykmm.jpg",        title: "You Know My Mum", year: "2025", role: "Associate Video Designer", venue: "Belgrade Theatre, Coventry & National Tour", text: "Working for Video Designer Hayley Egan.", url: "https://www.belgrade.co.uk/events/you-know-my-mum/" },
      { img: "assets/Theatre/iphigenia.jpg",   title: "Iphigenia Yn Sblot", year: "2024", role: "Video Designer", venue: "Sherman Theatre", text: "Welsh language premiere.", url: "https://www.shermantheatre.co.uk" },
      { img: "assets/Theatre/opera.jpg",       title: "Opera Triple Bill", year: "2022", role: "Video Designer", venue: "Silk Street Theatre, Barbican", text: "Video design for the Guildhall School opera triple bill.", url: "https://www.barbican.org.uk/whats-on" }
    ],
    credits: {
      heading: "Full credits",
      groups: [
        { role: "Lighting, Sound & Video Designer", items: [
          { title: "Ble Mae Fy Nghartref", url: "https://volcanotheatre.wales/bmfn/", context: "Volcano Theatre" },
          { title: "Silent Night, Raging Eve", url: "https://volcanotheatre.wales/silent-night-raging-eve/", context: "Volcano Theatre" }
        ]},
        { role: "Video Designer", items: [
          { title: "what the fuck is going on?", url: "https://volcanotheatre.wales/shape25/", context: "Volcano Theatre · also writer & performer" },
          { title: "Reykjavik", url: "https://www.hampsteadtheatre.co.uk/whats-on/reykjavik/", context: "Hampstead Theatre" },
          { title: "Iphigenia Yn Sblot", url: "https://www.shermantheatre.co.uk/event/iphigenia-yn-sblot/", context: "Sherman Theatre" },
          { title: "Succession Theme is my Ringtone", url: "https://www.rosetheatre.org/whats-on/succession-theme-is-my-ringtone/", context: "Rose Theatre Kingston" },
          { title: "Invisible Animal", url: "https://www.omnibus-clapham.org/invisible-animal/", context: "Omnibus Theatre" },
          { title: "Under Milk Wood / Dan y Wenallt", url: "https://www.shermantheatre.co.uk/event/under-milk-wood-dan-y-wenallt/", context: "National Youth Arts Wales" },
          { title: "The Welsh Lxdies", url: "https://www.purplestringproductions.com/the-welsh-lxdies", context: "Purple String Productions" },
          { title: "HOT IN HERE", url: "https://cptheatre.co.uk/show/hot-in-here/", context: "Camden People's Theatre & Tour" },
          { title: "Attempts on Her Life", url: "https://www.barbican.org.uk/whats-on/2024/event/attempts-on-her-life", context: "Guildhall School of Music and Drama" },
          { title: "Cabaret Boheme", url: "https://www.thebohemianstheatre.com/cabaret-boheme", context: "Union Theatre" },
          { title: "Macbeth", url: "https://www.barbican.org.uk/whats-on/2024/event/macbeth", context: "Guildhall School of Music and Drama" },
          { title: "Opera Triple Bill", url: "https://www.barbican.org.uk/whats-on", context: "Guildhall School of Music and Drama" }
        ]},
        { role: "Associate Video Designer", items: [
          { title: "You Know My Mum", url: "https://www.belgrade.co.uk/events/you-know-my-mum/", context: "Video Designer: Hayley Egan" }
        ]},
        { role: "Animator", items: [
          { title: "The Hunger Games on Stage", url: "https://thehungergamesonstage.com", context: "Troubadour Theatre, Canary Wharf" }
        ]},
        { role: "Assistant Video Designer", items: [
          { title: "The Lesson", url: "https://www.icarustheatre.co.uk/the-lesson", context: "Southwark Playhouse & Tour" }
        ]},
        { role: "Digital Associate", items: [
          { title: "This Incredible Life", url: "https://www.ambobdim.cymru/en/profile-content/this-incredible-life/", context: "Online" }
        ]},
        { role: "Designer", items: [
          { title: "SIMUL", url: "", context: "Virtual Reality" }
        ]},
        { role: "Programmer", items: [
          { title: "Scissorhandz", url: "https://www.scissorhandzthemusical.com", context: "Musical" }
        ]},
        { role: "Production Video Engineer", items: [
          { title: "Footballers Wives", url: "https://fwmusical.com", context: "Musical" },
          { title: "Scissorhandz", url: "https://www.scissorhandzthemusical.com", context: "Musical" }
        ]},
        { role: "Assistant Director", items: [
          { title: "This Incredible Life", url: "https://asiw.co.uk/reviews/this-incredible-life-canoe-theatre-theatrau-sir-gar-chapter", context: "" }
        ]}
      ]
    }
  },

  /* Painting and Digital Art, grouped as tiles that open panels,
     the same interaction as Ongoing Projects. */
  art: {
    heading: "Art",
    groups: [
      {
        id: "painting",
        title: "Painting",
        cta: "view the work →",
        tile: { src: "assets/Art/Y Cynfod/proofofexistence.jpg", alt: "Proof of Existence, acrylic and clay on canvas" },
        panel: {
          meta: null,
          blocks: [
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Y Cynfod/proofofexistence.jpg",
              alt: "Proof of Existence, acrylic and clay on canvas",
              caption: "Proof of Existence. 32 × 40 in. Acrylic and clay on canvas. 2026." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Painting/instructionsforcontainment.jpeg",
              alt: "Instructions for Containment, acrylic on canvas",
              caption: "Instructions for Containment. 18 × 24 in. Acrylic on canvas. 2026." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Painting/hebetudeinorange.jpeg",
              alt: "hebetude in orange, acrylic on canvas",
              caption: "hebetude in orange. 9 × 12 in. Acrylic on canvas. 2026." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Painting/halfwaytonowhere.jpeg",
              alt: "halfway to nowhere, acrylic on canvas",
              caption: "halfway to nowhere. 9 × 12 in. Acrylic on canvas. 2025." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Painting/therightplace.jpeg",
              alt: "the right place, acrylic and chalk on paper",
              caption: "the right place. Acrylic and chalk on paper. 2025." }}
          ]
        }
      },
      {
        id: "digital",
        title: "Digital Art",
        cta: "view the work →",
        tile: { src: "assets/Art/Digital Art/medusa.jpg", alt: "medusa, digital work" },
        panel: {
          meta: null,
          blocks: [
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Digital Art/medusa.jpg",
              alt: "medusa, digital work",
              caption: "medusa." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Digital Art/thekiss.jpg",
              alt: "the kiss, digital work",
              caption: "the kiss." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Digital Art/beginning.jpg",
              alt: "beginning, digital work",
              caption: "beginning." }},
            { type: "media", item: { kind: "image", natural: true,
              src: "assets/Art/Digital Art/untitledflowers.jpg",
              alt: "untitled flowers, digital work",
              caption: "untitled flowers." }}
          ]
        }
      }
    ]
  },

  /* Planned, not yet live. Set enabled: true and add
     { label: "creative technology", to: "#creativetech" } to nav when ready. */
  creativeTech: {
    enabled: false,
    heading: "Creative Technology",
    groups: [
      {
        id: "telephonebooth",
        title: "Telephone Booth",
        cta: "enter the project →",
        tile: null,
        panel: {
          meta: "Interactive installation · Volcano Theatre",
          blocks: [
            { type: "paras", items: [
              "A Discord-based tin-can communication system built for Volcano. Text to come."
            ]}
          ]
        }
      },
      {
        id: "renderlauncher",
        title: "Blender Render Launcher",
        cta: "view the tool →",
        tile: null,
        panel: {
          meta: "Open-source desktop tool · Pop!_OS / Linux",
          blocks: [
            { type: "paras", items: [ "A GTK desktop application for queueing and launching Blender renders. Text to come." ]},
            { type: "links", items: [ { label: "→ GitHub", url: "https://github.com/proxydite/blender-render-launcher" } ]}
          ]
        }
      }
    ]
  },

  music: {
    heading: "Music",
    intro: "Four releases — built from field recordings, synth fragments, and small, stubborn melodies.",
    embeds: [
      { title: "socially awkward chicken",
        album: "3287311794",
        link: "https://proxydite.bandcamp.com/album/socially-awkward-chicken" },
      { title: "what the fuck is going on? (or how I see things)",
        album: "1514763297",
        link: "https://proxydite.bandcamp.com/album/what-the-fuck-is-going-on-or-how-i-see-things" },
      { title: "non, je ne regrette rien",
        album: "495219216",
        link: "https://proxydite.bandcamp.com/album/non-je-ne-regrette-rien" },
      { title: "TODAY, TOMORROW & YESTERDAY",
        album: "3354648981",
        link: "https://proxydite.bandcamp.com/album/today-tomorrow-yesterday" }
    ],
    /* Player colours matched to the site palette */
    playerBg: "0f0d0b",
    playerLink: "a6896a"
  },

  contact: {
    heading: "Contact",
    email: "hello@proxydite.net",
    note: "For commissions, collaborations, or just to say hello."
  },

  footer: "© 2026 Ryan Samuel Davies · proxydite.net"
};

import {
  EventDetails,
  BudgetItem,
  BudgetCategory,
  TimelineTask,
  VendorItem,
  PersonalizedIdea,
  AccessibilityCheckItem,
  FullEventPlan,
} from '../types/event';

export function generateEventPlan(details: EventDetails): FullEventPlan {
  const budget = generateBudgetItems(details);
  const timeline = generateTimelineTasks(details);
  const vendors = generateVendorItems(details);
  const ideas = generatePersonalizedIdeas(details);
  const accessibility = generateAccessibilityItems(details);

  return {
    details,
    budget,
    timeline,
    vendors,
    ideas,
    accessibility,
  };
}

/* -------------------------------------------------------------------------- */
/* BUDGET GENERATION LOGIC                                                    */
/* -------------------------------------------------------------------------- */
export function generateBudgetItems(details: EventDetails): BudgetItem[] {
  const B = details.totalBudget;
  const G = Math.max(1, details.guestCount);
  const type = details.type;

  let items: { cat: BudgetCategory; name: string; pct: number; notes: string }[] = [];

  if (type === 'wedding') {
    items = [
      {
        cat: 'Venue & Rentals',
        name: 'Ceremony & Reception Venue Rental',
        pct: 0.22,
        notes: 'Includes facility fee, tables, chairs, and security deposit.',
      },
      {
        cat: 'Catering & Beverages',
        name: `Catering (${G} guests @ ~$${Math.round((B * 0.28) / G)}/head)`,
        pct: 0.28,
        notes: 'Buffet or plated dinner, cocktail hour appetizers, and service staff.',
      },
      {
        cat: 'Catering & Beverages',
        name: 'Bar & Beverage Package (Wine, Beer, Mocktails)',
        pct: 0.08,
        notes: 'Signature drinks, non-alcoholic station, bartender fees, and corkage.',
      },
      {
        cat: 'Photography & Video',
        name: 'Lead Photographer & Assistant (8 Hours Coverage)',
        pct: 0.10,
        notes: 'Full day coverage, engagement session, high-res digital gallery.',
      },
      {
        cat: 'Decor, Florals & Signage',
        name: 'Bridal Bouquets, Centerpieces & Arch Florals',
        pct: 0.08,
        notes: 'Seasonal florals, ceremony arch draping, and table runners.',
      },
      {
        cat: 'Music & Entertainment',
        name: 'DJ / MC & Sound Equipment',
        pct: 0.06,
        notes: 'Wireless mics for vows/toasts, dance lighting, and sound system.',
      },
      {
        cat: 'Attire & Beauty',
        name: 'Wedding Attire, Alterations & Hair/Makeup',
        pct: 0.06,
        notes: 'Bridal gown/suit, accessories, hair styling, and trial runs.',
      },
      {
        cat: 'Stationery & Favors',
        name: 'Save-the-Dates, Invitations & Guest Favors',
        pct: 0.03,
        notes: 'Eco-friendly printed or digital suites and customized keepsakes.',
      },
      {
        cat: 'Contingency Fund',
        name: 'Emergency & Weather Contingency Buffer',
        pct: 0.09,
        notes: 'Reserved for unexpected guest additions, last-minute vendor tips, or weather tenting.',
      },
    ];
  } else if (type === 'birthday') {
    items = [
      {
        cat: 'Venue & Rentals',
        name: 'Private Room, Backyard Marquee or Lounge Space',
        pct: 0.25,
        notes: 'Space rental, lounge furniture, and cleanup fee.',
      },
      {
        cat: 'Catering & Beverages',
        name: `Food Spread & Finger Foods (${G} guests)`,
        pct: 0.32,
        notes: 'Custom catering or gourmet sliders, grazing table, and appetizers.',
      },
      {
        cat: 'Catering & Beverages',
        name: 'Custom Theme Birthday Cake & Dessert Station',
        pct: 0.07,
        notes: 'Multi-tiered or artisan themed cake, macarons, and dessert display.',
      },
      {
        cat: 'Decor, Florals & Signage',
        name: 'Bespoke Balloon Installation, Photo Backdrop & Neon Sign',
        pct: 0.12,
        notes: 'Organic balloon arch, customized birthday signage, and table decor.',
      },
      {
        cat: 'Music & Entertainment',
        name: 'DJ, Performer or Interactive Activity / Games',
        pct: 0.10,
        notes: 'Live acoustic set, DJ, trivia host, or magician/activity coordinator.',
      },
      {
        cat: 'Photography & Video',
        name: 'Event Photographer / Interactive Photobooth',
        pct: 0.06,
        notes: '3-hour photobooth with instant digital prints & prop box.',
      },
      {
        cat: 'Contingency Fund',
        name: 'Party Supplies & Emergency Buffer',
        pct: 0.08,
        notes: 'Ice, extra mixers, emergency tape/lighting, and guest surprises.',
      },
    ];
  } else {
    // Community Event
    items = [
      {
        cat: 'Permits, Insurance & Safety',
        name: 'City Parks/Street Permit & Event Liability Insurance',
        pct: 0.18,
        notes: 'Municipal permit fees, road closure notice, and 1M event coverage.',
      },
      {
        cat: 'Venue & Rentals',
        name: 'Stage, Pop-Up Tents, Folding Chairs & Bleachers',
        pct: 0.22,
        notes: 'Community stage canopy, volunteer check-in tent, and shade pavilions.',
      },
      {
        cat: 'Music & Entertainment',
        name: 'PA Sound System, Microphones & Local Performers',
        pct: 0.16,
        notes: 'Stage audio system, technician, generator rental, and performer honorariums.',
      },
      {
        cat: 'Logistics & Waste',
        name: 'Portable Restrooms, ADA Toilets & Recycling/Trash Stations',
        pct: 0.14,
        notes: 'Sanitation stations, waste diversion bins, hand sanitizer stands.',
      },
      {
        cat: 'Catering & Beverages',
        name: 'Hydration Stations, Snacks & Volunteer Refreshments',
        pct: 0.12,
        notes: 'Filtered water refill points, healthy snacks for 40+ volunteers.',
      },
      {
        cat: 'Decor, Florals & Signage',
        name: 'Community Banners, Directional Wayfinding & Schedule Boards',
        pct: 0.08,
        notes: 'Weatherproof high-visibility signs, map boards, and registration flags.',
      },
      {
        cat: 'Contingency Fund',
        name: 'Public Safety, First Aid Supplies & Weather Buffer',
        pct: 0.10,
        notes: 'First aid tent supplies, rain contingencies, and unforeseen municipal fees.',
      },
    ];
  }

  return items.map((item, index) => {
    const estimated = Math.round(B * item.pct);
    return {
      id: `budget-${index + 1}`,
      category: item.cat,
      name: item.name,
      estimatedCost: estimated,
      actualCost: 0,
      status: 'planned',
      notes: item.notes,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* TIMELINE & RUN-OF-SHOW GENERATION LOGIC                                    */
/* -------------------------------------------------------------------------- */
export function generateTimelineTasks(details: EventDetails): TimelineTask[] {
  const type = details.type;
  const eventDate = details.date || '2026-10-31';

  const tasks: TimelineTask[] = [];

  // Helper to adjust date
  const subtractDays = (days: number) => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  if (type === 'wedding') {
    tasks.push(
      {
        id: 'task-1',
        phase: 'early-planning',
        phaseLabel: '9-12 Months Before',
        title: 'Establish Vision & Reserve Main Ceremony/Reception Venue',
        description: 'Tour top 3 venues, review curfew & alcohol rules, and lock in the date with a deposit.',
        dueDate: subtractDays(270),
        priority: 'high',
        status: 'completed',
        category: 'Venue',
      },
      {
        id: 'task-2',
        phase: 'early-planning',
        phaseLabel: '6-9 Months Before',
        title: 'Book Core Creative Vendors (Photographer, Videographer, Caterer)',
        description: 'Review portfolios, schedule food tasting, and confirm dietary customization possibilities.',
        dueDate: subtractDays(210),
        priority: 'high',
        status: 'in_progress',
        category: 'Vendors',
      },
      {
        id: 'task-3',
        phase: 'vendor-booking',
        phaseLabel: '4-6 Months Before',
        title: 'Send Save-the-Dates & Finalize Attire',
        description: 'Collect postal and email addresses, order invitations, and order bridal party outfits.',
        dueDate: subtractDays(150),
        priority: 'medium',
        status: 'todo',
        category: 'Guests & Attire',
      },
      {
        id: 'task-4',
        phase: 'details-coordination',
        phaseLabel: '2 Months Before',
        title: 'Collect RSVPs & Finalize Floor Seating Chart',
        description: 'Finalize headcount with caterer, verify vegetarian/vegan/gluten-free options.',
        dueDate: subtractDays(60),
        priority: 'high',
        status: 'todo',
        category: 'Catering & Logistics',
      },
      {
        id: 'task-5',
        phase: 'final-countdown',
        phaseLabel: '1-2 Weeks Before',
        title: 'Final Vendor Walkthrough & Marriage License Application',
        description: 'Distribute timeline to bridal party, deliver vendor tip envelopes, and pack bridal emergency kit.',
        dueDate: subtractDays(10),
        priority: 'high',
        status: 'todo',
        category: 'Coordination',
      },
      // Day-Of Run-Of-Show
      {
        id: 'task-6',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Hair & Makeup Styling and Vendor Load-in',
        description: 'Bridal suite preparation; florist arrives with bouquets and centerpieces.',
        dueDate: eventDate,
        timeSlot: '09:00 AM - 12:30 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-7',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'First Look & Couple Portraits',
        description: 'Private first look photo session in garden area before guest arrival.',
        dueDate: eventDate,
        timeSlot: '01:00 PM - 02:30 PM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-8',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Guest Arrival, Seating & Prelude Music',
        description: 'Ushers guide guests, acoustic instrumental playlist playing.',
        dueDate: eventDate,
        timeSlot: '03:30 PM - 04:00 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-9',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Ceremony & Exchange of Vows',
        description: 'Processional, heartfelt personalized vows, ring exchange, and pronouncement.',
        dueDate: eventDate,
        timeSlot: '04:00 PM - 04:45 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-10',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Cocktail Hour & Passed Hors d’Oeuvres',
        description: 'Signature cocktails, interactive guestbook station, and family group portraits.',
        dueDate: eventDate,
        timeSlot: '04:45 PM - 06:00 PM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-11',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Grand Entrance, Dinner & Toasts',
        description: 'Couple entrance, welcome speech, seated dinner service, and best man / maid of honor toasts.',
        dueDate: eventDate,
        timeSlot: '06:00 PM - 08:00 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-12',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'First Dance, Cake Cutting & Open Dance Floor',
        description: 'Spotlight dances, cake ceremonial slice, DJ kicks off high-energy party.',
        dueDate: eventDate,
        timeSlot: '08:00 PM - 11:00 PM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-13',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Sparkler Grand Exit & Vendor Teardown',
        description: 'Guests line up with sparklers; lead coordinator oversees equipment teardown.',
        dueDate: eventDate,
        timeSlot: '11:00 PM - 11:45 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      }
    );
  } else if (type === 'birthday') {
    tasks.push(
      {
        id: 'task-1',
        phase: 'early-planning',
        phaseLabel: '4-6 Weeks Before',
        title: 'Choose Theme, Reserve Space & Create Digital Invitations',
        description: 'Select colors/aesthetic, reserve lounge or backyard tent, and launch RSVP link.',
        dueDate: subtractDays(35),
        priority: 'high',
        status: 'completed',
        category: 'Planning',
      },
      {
        id: 'task-2',
        phase: 'vendor-booking',
        phaseLabel: '3 Weeks Before',
        title: 'Order Custom Cake & Confirm Catering or Food Truck',
        description: 'Specify dietary needs, finalize flavor profiles, and request delivery window.',
        dueDate: subtractDays(21),
        priority: 'high',
        status: 'in_progress',
        category: 'Catering',
      },
      {
        id: 'task-3',
        phase: 'details-coordination',
        phaseLabel: '1-2 Weeks Before',
        title: 'Assemble Custom Playlist, Decor Props & Favors',
        description: 'Build 4-hour music curve (ambient -> energetic -> singalongs) and buy photo props.',
        dueDate: subtractDays(10),
        priority: 'medium',
        status: 'todo',
        category: 'Decor & Entertainment',
      },
      {
        id: 'task-4',
        phase: 'final-countdown',
        phaseLabel: '2 Days Before',
        title: 'Finalize RSVP List, Grocery Run & Beverage Chill',
        description: 'Confirm final headcount with venue; buy ice, fresh garnishes, and party snacks.',
        dueDate: subtractDays(2),
        priority: 'medium',
        status: 'todo',
        category: 'Logistics',
      },
      // Day-Of
      {
        id: 'task-5',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Setup Balloon Garland, Lighting & Sound Check',
        description: 'Inflate balloons, test speakers, set up selfie ring light / photobooth area.',
        dueDate: eventDate,
        timeSlot: '04:00 PM - 06:30 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-6',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Guest Arrival, Welcome Cocktails & Grazing Table',
        description: 'Upbeat background playlist, welcome drink service, and mingling.',
        dueDate: eventDate,
        timeSlot: '07:00 PM - 08:15 PM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-7',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Birthday Roast/Toast & Interactive Group Game',
        description: 'Funny milestone quiz or personalized trivia about the birthday VIP.',
        dueDate: eventDate,
        timeSlot: '08:15 PM - 09:00 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-8',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Cake Presentation, Candle Blowing & Sparkler Moment',
        description: 'Singing happy birthday, champagne/cider toast, and dessert spread service.',
        dueDate: eventDate,
        timeSlot: '09:00 PM - 09:30 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-9',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Open Dance Floor, Late Night Snacks & Farewell',
        description: 'High-energy dance playlist, pizza delivery / midnight snack, and gift packing.',
        dueDate: eventDate,
        timeSlot: '09:30 PM - 12:00 AM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      }
    );
  } else {
    // Community Event
    tasks.push(
      {
        id: 'task-1',
        phase: 'early-planning',
        phaseLabel: '8-12 Weeks Before',
        title: 'Submit Municipal Special Event Permit & Traffic Plan',
        description: 'Apply for city park/street use, noise ordinance waiver, and secure liability insurance certificate.',
        dueDate: subtractDays(60),
        priority: 'high',
        status: 'completed',
        category: 'Permits & City',
      },
      {
        id: 'task-2',
        phase: 'early-planning',
        phaseLabel: '6 Weeks Before',
        title: 'Recruit Community Sponsors, Food Trucks & Exhibitors',
        description: 'Send vendor application packet, secure 3-5 local food vendors, and confirm booth layouts.',
        dueDate: subtractDays(45),
        priority: 'high',
        status: 'in_progress',
        category: 'Partnerships',
      },
      {
        id: 'task-3',
        phase: 'vendor-booking',
        phaseLabel: '4 Weeks Before',
        title: 'Reserve Generators, Portable Sanitation & PA System',
        description: 'Book ADA-compliant portable restrooms, handwash sinks, stage sound, and power cables.',
        dueDate: subtractDays(28),
        priority: 'high',
        status: 'todo',
        category: 'Logistics',
      },
      {
        id: 'task-4',
        phase: 'details-coordination',
        phaseLabel: '2 Weeks Before',
        title: 'Volunteer Briefing & Emergency Action Plan',
        description: 'Assign check-in, waste management, and hydration station leads; print safety contact sheets.',
        dueDate: subtractDays(14),
        priority: 'medium',
        status: 'todo',
        category: 'Volunteers',
      },
      {
        id: 'task-5',
        phase: 'final-countdown',
        phaseLabel: '3 Days Before',
        title: 'Post Neighborhood Parking Notices & Weather Check',
        description: 'Erect temporary street parking signs, check 72-hour precipitation forecast for rain canopy plan.',
        dueDate: subtractDays(3),
        priority: 'high',
        status: 'todo',
        category: 'Public Notice',
      },
      // Day-Of
      {
        id: 'task-6',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Site Setup, Generator Start & Vendor Influx',
        description: 'Road barriers placed, stage audio check, food truck health inspection check-in.',
        dueDate: eventDate,
        timeSlot: '07:00 AM - 09:30 AM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-7',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Gates Open & Opening Ceremony',
        description: 'Community leader welcome, national anthem/cultural opening performance, exhibits open.',
        dueDate: eventDate,
        timeSlot: '10:00 AM - 10:45 AM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-8',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Main Stage Performances & Interactive Workshops',
        description: 'Local student music showcase, art tent demos, and kids eco-craft pavilion.',
        dueDate: eventDate,
        timeSlot: '11:00 AM - 02:00 PM',
        priority: 'medium',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-9',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Community Raffle, Award Presentation & Keynote',
        description: 'Announce volunteer awards, prize drawings, and civic thank-you remarks.',
        dueDate: eventDate,
        timeSlot: '02:30 PM - 03:30 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      },
      {
        id: 'task-10',
        phase: 'day-of-execution',
        phaseLabel: 'Day Of (Run of Show)',
        title: 'Event Closing, Volunteer Debrief & Waste Cleanup',
        description: 'Music ends, grounds sweep for zero-waste recycling, breakdown tents, remove barricades.',
        dueDate: eventDate,
        timeSlot: '04:00 PM - 06:00 PM',
        priority: 'high',
        status: 'todo',
        category: 'Day-Of Schedule',
      }
    );
  }

  return tasks;
}

/* -------------------------------------------------------------------------- */
/* VENDOR CHECKLIST & INTERVIEW QUESTIONS LOGIC                              */
/* -------------------------------------------------------------------------- */
export function generateVendorItems(details: EventDetails): VendorItem[] {
  const type = details.type;

  if (type === 'wedding') {
    return [
      {
        id: 'vendor-1',
        category: 'Venue',
        role: 'Ceremony & Reception Venue',
        vendorName: 'Whispering Pines Estate (Sample)',
        status: 'contract_signed',
        quotedPrice: Math.round(details.totalBudget * 0.22),
        checklistItems: [
          { text: 'Verify certificate of liability insurance requirements', done: true },
          { text: 'Confirm arrival and teardown window hours', done: true },
          { text: 'Check noise curfew cut-off and decibel limit', done: false },
          { text: 'Inspect rain contingency indoor pavilion', done: false },
        ],
        aiQuestionsToAsk: [
          'What is the exact load-in window for outside florists and rental equipment?',
          'Are open-flame candles permitted on dining tables?',
          'Is there an in-house bridal dressing suite and groom quarters available prior to ceremony?',
          'What is the corkage or outside vendor penalty fee if we supply our own wine?',
        ],
        redFlagsToWatch: [
          'Hidden cleaning or mandatory valet staffing fees not in initial quote.',
          'Strict requirement to use an exclusive high-markup vendor list without waivers.',
          'Vague weather backup plans that force guests into an unconditioned space.',
        ],
      },
      {
        id: 'vendor-2',
        category: 'Catering',
        role: 'Master Chef Catering & Bar',
        vendorName: 'Artisan Culinary Group',
        status: 'quoted',
        quotedPrice: Math.round(details.totalBudget * 0.28),
        checklistItems: [
          { text: 'Conduct complimentary menu tasting session', done: false },
          { text: 'Confirm dietary accommodations (vegan, celiac, halal/kosher)', done: true },
          { text: 'Finalize server-to-guest ratio (aim for 1 server per 10-12 guests for plated)', done: false },
          { text: 'Check if linens, flatware, and china are included or rental cost', done: false },
        ],
        aiQuestionsToAsk: [
          'Are vendor meals (for photographer, DJ, coordinator) included at a reduced rate?',
          'How do you manage dietary allergies during simultaneous plated service?',
          'What happens to leftover unserved food at the end of the reception?',
          'What is the overtime rate per staff member if speeches run late?',
        ],
        redFlagsToWatch: [
          'Automatic 25%+ administrative fee that is NOT paid as gratuity to waitstaff.',
          'Refusal to execute a written tasting guarantee prior to non-refundable deposit.',
        ],
      },
      {
        id: 'vendor-3',
        category: 'Photography',
        role: 'Principal Photographer & Second Shooter',
        vendorName: 'Golden Hour Visuals',
        status: 'contacted',
        quotedPrice: Math.round(details.totalBudget * 0.10),
        checklistItems: [
          { text: 'Review full unedited gallery of a complete wedding from start to finish', done: true },
          { text: 'Verify dual-card backup camera gear and off-site cloud storage', done: false },
          { text: 'Establish turnaround time for sneak peeks vs full gallery', done: false },
        ],
        aiQuestionsToAsk: [
          'What is your contingency backup plan if the primary photographer falls ill on the morning of?',
          'Do we get full digital personal print rights and high-resolution files without watermarks?',
          'Have you shot at our chosen venue before, and what are your favorite lighting angles there?',
        ],
        redFlagsToWatch: [
          'Overly long delivery times exceeding 12 weeks for digital photos.',
          'Contract retaining copyright restrictions preventing printing wedding albums with local printers.',
        ],
      },
      {
        id: 'vendor-4',
        category: 'Entertainment',
        role: 'Wedding DJ & Master of Ceremonies',
        vendorName: 'Rhythm & Beats Co.',
        status: 'researching',
        quotedPrice: Math.round(details.totalBudget * 0.06),
        checklistItems: [
          { text: 'Provide "Must-Play" and "Do-Not-Play" song lists', done: false },
          { text: 'Confirm wireless lapel mic for officiant during vows', done: false },
          { text: 'Verify dance floor lighting rig is included', done: false },
        ],
        aiQuestionsToAsk: [
          'How do you read the room and transition between music genres to keep older and younger guests dancing?',
          'Do you have backup sound mixers and wireless microphones on site?',
          'How will you coordinate with our photographer before announcing major milestones like the cake cutting?',
        ],
        redFlagsToWatch: [
          'DJs who treat your wedding like their own promotional club set or talk incessantly on the mic.',
          'Lack of backup equipment or requiring client to source power strips/extension cords.',
        ],
      },
    ];
  } else if (type === 'birthday') {
    return [
      {
        id: 'vendor-1',
        category: 'Venue & Decor',
        role: 'Party Space & Installation Stylist',
        vendorName: 'Skyline Terrace / DIY Studio',
        status: 'contacted',
        quotedPrice: Math.round(details.totalBudget * 0.25),
        checklistItems: [
          { text: 'Confirm sound system connection (Bluetooth / AUX compatibility)', done: true },
          { text: 'Confirm refrigerator space for birthday cake', done: false },
          { text: 'Check wall hanging restrictions for balloon installation', done: false },
        ],
        aiQuestionsToAsk: [
          'How much setup time do we get prior to the party start?',
          'Are outside food trucks or dessert tables permitted without extra surcharge?',
        ],
        redFlagsToWatch: [
          'Strict noise penalties that cut power at exactly 10:00 PM without advance warning.',
        ],
      },
      {
        id: 'vendor-2',
        category: 'Bakery',
        role: 'Custom Cake Designer',
        vendorName: 'SugarCraft Artisan Bakery',
        status: 'quoted',
        quotedPrice: Math.round(details.totalBudget * 0.07),
        checklistItems: [
          { text: 'Send reference moodboard photo of cake design', done: true },
          { text: 'Select flavor combo (e.g. Lemon Raspberry or Dark Chocolate Salted Caramel)', done: true },
          { text: 'Schedule refrigerated delivery 2 hours prior to guest arrival', done: false },
        ],
        aiQuestionsToAsk: [
          'Can you create gluten-free or dairy-free cupcakes for guests with sensitivities?',
          'Does the cake stand and acrylic topper need to be returned post-event?',
        ],
        redFlagsToWatch: [
          'Refusal to deliver on hot days or requiring client to transport delicate 3-tier cakes.',
        ],
      },
    ];
  } else {
    // Community Event
    return [
      {
        id: 'vendor-1',
        category: 'Municipal & Safety',
        role: 'City Parks Dept & Traffic Safety',
        vendorName: 'Metro Parks & Recreation',
        status: 'contacted',
        quotedPrice: Math.round(details.totalBudget * 0.18),
        checklistItems: [
          { text: 'Submit site map indicating emergency vehicle ingress/egress', done: true },
          { text: 'Submit certificate of \$1M additional insured endorsement', done: false },
          { text: 'Confirm off-duty police or volunteer crossing guards for crosswalks', done: false },
        ],
        aiQuestionsToAsk: [
          'What are the city decibel limits and cutoff times for live amplified music?',
          'Are temporary stakes permitted in the grass or must all pop-up tents use 40lb sandbags?',
        ],
        redFlagsToWatch: [
          'Permit applications delayed beyond the 30-day municipal committee approval window.',
        ],
      },
      {
        id: 'vendor-2',
        category: 'Sanitation & Logistics',
        role: 'Portable Sanitation & Clean Energy',
        vendorName: 'EcoSan Logistics',
        status: 'quoted',
        quotedPrice: Math.round(details.totalBudget * 0.14),
        checklistItems: [
          { text: 'Order 1 ADA-compliant unit per 100 estimated attendees', done: true },
          { text: 'Book dual hand-washing stations with soap and paper towels', done: false },
          { text: 'Coordinate morning delivery and same-night removal', done: false },
        ],
        aiQuestionsToAsk: [
          'Do your restrooms include solar-powered interior touch lights for evening events?',
          'What is your emergency on-call contact if a unit requires pump-out during the festival?',
        ],
        redFlagsToWatch: [
          'Vendors that do not offer ADA-accessible wheelchair ramps or hand sanitizers.',
        ],
      },
    ];
  }
}

/* -------------------------------------------------------------------------- */
/* PERSONALIZED THEME & CREATIVE IDEAS                                        */
/* -------------------------------------------------------------------------- */
export function generatePersonalizedIdeas(details: EventDetails): PersonalizedIdea[] {
  const type = details.type;
  const vibe = details.vibe;

  if (type === 'wedding') {
    return [
      {
        id: 'idea-1',
        category: 'theme',
        title: 'Enchanted Botanical & Modern Gold',
        description: 'Earthy warmth meets elevated contemporary romance. Rich forest greenery paired with soft warm candlelight and brushed brass metallics.',
        tags: ['Elegant', 'Romantic', 'Timeless'],
        colorPalette: [
          { name: 'Emerald Forest', hex: '#1b4332' },
          { name: 'Sage Mist', hex: '#95d5b2' },
          { name: 'Warm Champagne', hex: '#f3e9dc' },
          { name: 'Brushed Brass', hex: '#d4af37' },
          { name: 'Soft Cream', hex: '#fdfbf7' },
        ],
        suggestedItems: [
          'Hanging eucalyptus chandelier over head table',
          'Taper candles in vintage brass holders',
          'Acrylic welcome sign flanked by potted monstera & ferns',
        ],
      },
      {
        id: 'idea-2',
        category: 'menu',
        title: 'Bespoke "His, Hers & Ours" Signature Cocktails',
        description: 'Delight guests with custom crafted drinks telling your story, paired with a vibrant mocktail option.',
        tags: ['Interactive Bar', 'Custom Drinks'],
        suggestedItems: [
          '"The Golden Hour": Bourbon, smoked rosemary, spiced blood orange & ginger beer',
          '"Blushing Petal": Elderflower liqueur, botanical gin, prosecco & edible viola flower',
          '"Zero-Proof Spark": Sparkling lavender lemonade with crushed blackberries & mint (Mocktail)',
        ],
        estimatedCostRange: '$5 - $8 per guest',
      },
      {
        id: 'idea-3',
        category: 'activity',
        title: 'Vintage Audio Guestbook & Polaroid Wall',
        description: 'Instead of a standard written guestbook, let friends pick up a retro rotary telephone to record voice messages, and peg candid snapshots to a string wall.',
        tags: ['Sentimental', 'Keepsake', 'Fun'],
        suggestedItems: [
          'Vintage rotary telephone audio recorder',
          'Fujifilm Instax cameras with 100 extra film packs',
          'Mini wooden pegs and custom neon "Leave a Memory" sign',
        ],
      },
      {
        id: 'idea-4',
        category: 'decor',
        title: 'Late Night Fuel: Mini Artisanal Sliders & Churro Station',
        description: 'Surprise guests around 10:00 PM with savory sliders and warm cinnamon churros with dipping chocolate to keep dancing energy soaring.',
        tags: ['Late Night Food', 'Crowd Pleaser'],
        suggestedItems: [
          'Truffle parmesan french fry paper cones',
          'Crispy chicken sliders and vegan halloumi bites',
          'Churro bites with warm dulce de leche and dark chocolate pots',
        ],
      },
    ];
  } else if (type === 'birthday') {
    return [
      {
        id: 'idea-1',
        category: 'theme',
        title: 'Retro Neon Glow & Sunset Disco',
        description: 'Vibrant 80s/90s modern revival with electric pastels, neon typography, mirrored disco balls, and high-energy nostalgia.',
        tags: ['Vibrant', 'High Energy', 'Instagrammable'],
        colorPalette: [
          { name: 'Electric Magenta', hex: '#f72585' },
          { name: 'Neon Violet', hex: '#7209b7' },
          { name: 'Cyber Blue', hex: '#4cc9f0' },
          { name: 'Sunset Tangerine', hex: '#f8961e' },
          { name: 'Midnight Charcoal', hex: '#1a1a24' },
        ],
        suggestedItems: [
          'Custom LED neon sign featuring the birthday celebrant’s favorite catchphrase',
          'Cluster of multi-sized disco balls on tables reflecting ambient violet uplighting',
          'Glitter & face gem station for guests',
        ],
      },
      {
        id: 'idea-2',
        category: 'activity',
        title: 'VIP Trivia Showdown & Guess the Year Photo Wall',
        description: 'A 15-minute hilarious trivia game played on guests’ phones (Kahoot style) with questions about the guest of honor, plus a photo timeline of childhood milestones.',
        tags: ['Icebreaker', 'Laughter', 'Personalized'],
        suggestedItems: [
          'Interactive phone quiz with prizes for 1st, 2nd, and 3rd place',
          'String clothesline displaying funny baby, awkward teenage, and present day photos',
        ],
      },
      {
        id: 'idea-3',
        category: 'menu',
        title: 'Artisanal Street Taco Bar & Custom Mocktail Tap',
        description: 'Interactive self-serve gourmet taco station featuring charred carne asada, blackened fish, and spiced grilled jackfruit with fresh guacamole.',
        tags: ['Interactive Dining', 'Crowd Pleaser'],
        suggestedItems: [
          'Fresh corn & flour tortillas kept warm in insulated warmers',
          'Trio of salsas (Mild Mango Habanero, Verde Tomatillo, Roasted Chipotle)',
          'Hibiscus Agua Fresca and Spiced Pineapple Margaritas',
        ],
      },
    ];
  } else {
    // Community Event
    return [
      {
        id: 'idea-1',
        category: 'theme',
        title: 'Green Roots Community Harmony & Eco-Festival',
        description: 'Focused on sustainability, community connection, local artisans, zero waste, and inclusive family fun under the open sky.',
        tags: ['Eco-Friendly', 'Inclusive', 'Community-Building'],
        colorPalette: [
          { name: 'Living Green', hex: '#2d6a4f' },
          { name: 'Sunburst Gold', hex: '#e9c46a' },
          { name: 'Terracotta Earth', hex: '#e76f51' },
          { name: 'Sky Azure', hex: '#a8dadc' },
          { name: 'Clean White', hex: '#f8f9fa' },
        ],
        suggestedItems: [
          'Recycled kraft paper signage with bold hand-lettered wayfinding',
          'Community mosaic art board where every attendee paints one tile',
          'Bicycle parking corral with free basic tune-up station',
        ],
      },
      {
        id: 'idea-2',
        category: 'activity',
        title: 'Community Passport & Scavenger Hunt',
        description: 'Attendees receive a printed or digital passport card. Visiting 5 volunteer stalls, the educational green booth, and the art station earns a stamp for the grand prize raffle.',
        tags: ['Engagement', 'Family Friendly', 'Educational'],
        suggestedItems: [
          'Stamped passport cards distributed at entrance registration',
          'Grand raffle prize featuring gift baskets donated by local mom-and-pop shops',
        ],
      },
      {
        id: 'idea-3',
        category: 'music',
        title: 'Acoustic Porch Stage & Cultural Heritage Hour',
        description: 'Spotlighting local school bands, cultural dance troupes, and acoustic singer-songwriters throughout the afternoon with comfortable shaded seating.',
        tags: ['Cultural Arts', 'Accessible', 'All Ages'],
        suggestedItems: [
          'Burlap hay bale seating with washable colorful picnic throws',
          'Open-caption screen for song lyrics and speeches',
        ],
      },
    ];
  }
}

/* -------------------------------------------------------------------------- */
/* ACCESSIBILITY & INCLUSIVITY CHECKLIST                                      */
/* -------------------------------------------------------------------------- */
export function generateAccessibilityItems(details: EventDetails): AccessibilityCheckItem[] {
  return [
    {
      id: 'acc-1',
      category: 'physical',
      title: 'Step-Free Wheelchair Access & Ramps',
      description: 'Ensure smooth ramps exist for all ceremony, reception, stage, and restroom access points.',
      isChecked: true,
      priority: 'must-have',
    },
    {
      id: 'acc-2',
      category: 'physical',
      title: 'Reserved Accessible Parking & Drop-Off Zone',
      description: 'Clearly mark close-proximity parking spaces with direct paved pathways to the main entrance.',
      isChecked: true,
      priority: 'must-have',
    },
    {
      id: 'acc-3',
      category: 'dietary',
      title: 'Allergen, Vegan, Halal & Gluten-Free Food Labeling',
      description: 'Include clear printed ingredient cards at buffet stations indicating major allergens (nuts, dairy, gluten, soy).',
      isChecked: false,
      priority: 'must-have',
    },
    {
      id: 'acc-4',
      category: 'sensory',
      title: 'Quiet / Sensory Decompression Space',
      description: 'Designate a calm, low-lighting, low-volume area with comfortable seating for neurodivergent guests or crying infants.',
      isChecked: false,
      priority: 'recommended',
    },
    {
      id: 'acc-5',
      category: 'communication',
      title: 'High-Contrast Large-Print Signage & Audio Assist',
      description: 'Ensure directional signage uses bold, legible typography with high color contrast (WCAG AAA); test wireless microphones for hearing aids.',
      isChecked: false,
      priority: 'recommended',
    },
    {
      id: 'acc-6',
      category: 'safety',
      title: 'Hydration Station & First Aid Tent',
      description: 'Provide free, accessible cold drinking water throughout the venue and a clearly signposted emergency kit/ice pack station.',
      isChecked: true,
      priority: 'must-have',
    },
  ];
}

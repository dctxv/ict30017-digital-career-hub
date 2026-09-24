/**
 * PII audit corpus: 26 fictional resumes across careers, countries and layouts.
 *
 * Every person, number and address here is invented. Phone numbers use the
 * ranges regulators reserve for fiction where one exists (ACMA 0491 570 xxx,
 * Ofcom 07700 900xxx, NANP 555-01xx).
 *
 * Each entry carries its own ground truth:
 *   pii   every piece of personal information the document contains, tagged
 *         with a category. The audit checks each one against what would have
 *         been sent to the model provider.
 *   keep  content the review needs (employers, qualifications, skills). The
 *         audit checks these survive, so over-masking is measured as well.
 *   account  what a logged-in user's account row would hold. It deliberately
 *         differs from the CV in some entries (a nickname, missing accents,
 *         a shorter name), because real accounts do.
 *
 * Categories:
 *   name          the candidate's own name
 *   email, phone  the candidate's contact details
 *   address       street line, locality or postcode (each part listed separately)
 *   url           profile URLs, portfolio sites, social handles, Skype ids
 *   gov-id        national id, passport, tax, social insurance, driver licence
 *   registration  a professional register number (searchable back to a name)
 *   dob           date of birth
 *   family        a parent's or spouse's name
 *   referee       a referee's name or contact detail (third-party PII)
 *   sensitive     religion, marital status, blood group, body measurements
 *
 * Layouts (see build-pdfs.js): classic, sidebar, bd-traditional,
 * modern-header, table-header.
 */

export const CORPUS = [
  /* ── 1 ── Healthcare · Australia ─────────────────────────────────────── */
  {
    id: 'au-registered-nurse',
    career: 'Registered Nurse (ICU)',
    sector: 'Healthcare',
    country: 'Australia',
    layout: 'classic',
    account: { fullName: 'Priya Raghunathan', email: 'priya.raghunathan.rn@gmail.com', phone: '0491 570 156' },
    cv: {
      name: 'Priya Raghunathan',
      title: 'Registered Nurse — Intensive Care',
      contacts: [
        { label: 'Mobile', value: '0491 570 156' },
        { label: 'Email', value: 'priya.raghunathan.rn@gmail.com' },
        { label: 'LinkedIn', value: 'linkedin.com/in/priya-raghunathan-rn' },
      ],
      address: ['Unit 3/15 Glenferrie Road, Hawthorn VIC 3122'],
      sections: [
        { h: 'Professional Summary', p: 'Registered Nurse with six years of acute care experience, including four years in a 24-bed tertiary Intensive Care Unit. Confident managing ventilated patients, CRRT and post-cardiac surgery care. AHPRA registration: NMW0001234567.' },
        { h: 'Experience', jobs: [
          { role: 'Registered Nurse, Intensive Care Unit', org: 'The Alfred', place: 'Melbourne', dates: 'Feb 2021 – Present', bullets: [
            'Care for 1:1 ventilated patients, including ECMO and CRRT.',
            'Preceptor to 12 graduate nurses; ICU Link Nurse for pressure injury prevention.',
          ] },
          { role: 'Graduate Registered Nurse', org: 'Epworth HealthCare', place: 'Richmond', dates: 'Jan 2019 – Jan 2021', bullets: [
            'Rotations through cardiothoracic surgery and general medicine.',
          ] },
        ] },
        { h: 'Education', jobs: [
          { role: 'Graduate Certificate in Intensive Care Nursing', org: 'Monash University', dates: '2022' },
          { role: 'Bachelor of Nursing', org: 'Deakin University', dates: '2015 – 2018' },
        ] },
        { h: 'Certifications', list: ['Advanced Life Support (ALS2)', 'Basic Life Support', 'Current Working with Children Check'] },
        { h: 'Referees', refs: [
          { name: 'Karen Whitfield', role: 'Nurse Unit Manager, ICU', org: 'The Alfred', contact: ['0491 570 110', 'k.whitfield@alfred.org.au'] },
          { name: 'Dr Michael Tanaka', role: 'ICU Consultant', org: 'The Alfred', contact: ['(03) 9076 2000'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Priya Raghunathan' },
      { cat: 'email', value: 'priya.raghunathan.rn@gmail.com' },
      { cat: 'phone', value: '0491 570 156' },
      { cat: 'url', value: 'linkedin.com/in/priya-raghunathan-rn' },
      { cat: 'address', value: 'Unit 3/15 Glenferrie Road' },
      { cat: 'address', value: 'Hawthorn VIC 3122' },
      { cat: 'registration', value: 'NMW0001234567', note: 'AHPRA number' },
      { cat: 'referee', value: 'Karen Whitfield' },
      { cat: 'referee', value: '0491 570 110' },
      { cat: 'referee', value: 'k.whitfield@alfred.org.au' },
      { cat: 'referee', value: 'Michael Tanaka' },
      { cat: 'referee', value: '(03) 9076 2000' },
    ],
    keep: ['Registered Nurse', 'Nurse Unit Manager', 'The Alfred', 'Epworth HealthCare', 'Monash University', 'Deakin University', 'Intensive Care Unit', 'ECMO', 'CRRT', 'Advanced Life Support', 'Feb 2021'],
  },

  /* ── 2 ── Hospitality · UK ───────────────────────────────────────────── */
  {
    id: 'uk-head-chef',
    career: 'Head Chef',
    sector: 'Hospitality',
    country: 'United Kingdom',
    layout: 'sidebar',
    account: { fullName: 'Daniel Cook', email: 'dan.cook.kitchen@outlook.com', phone: '07700 900461' },
    cv: {
      name: 'Daniel Cook',
      title: 'Head Chef',
      contacts: [
        { label: 'Phone', value: '07700 900461' },
        { label: 'Email', value: 'dan.cook.kitchen@outlook.com' },
        { label: 'Instagram', value: '@chefdancook' },
      ],
      address: ['Flat 2, 14 Mare Street', 'London E8 3PN'],
      sections: [
        { h: 'Profile', p: 'Head Chef with 11 years in high-volume London kitchens. Started as a Line Cook and worked through every section. Menu costing, GP control and building calm, well-trained brigades. Portfolio of dishes at instagram.com/chefdancook.' },
        { h: 'Experience', jobs: [
          { role: 'Head Chef', org: 'Dishoom Shoreditch', place: 'London', dates: '2021 – Present', bullets: [
            'Run a brigade of 22 across 450 covers a day; cut food waste 18% in the first year.',
            'Took the site to a 5-star Food Hygiene Rating on every inspection.',
          ] },
          { role: 'Sous Chef', org: 'The Ivy Chelsea Garden', place: 'London', dates: '2017 – 2021', bullets: [
            'Led the pastry and garnish sections; trained 9 Commis Chefs.',
          ] },
          { role: 'Line Cook', org: 'Hawksmoor Spitalfields', place: 'London', dates: '2013 – 2017', bullets: [
            'Grill and sauce sections on a 300-cover service.',
          ] },
        ] },
        { h: 'Education', jobs: [
          { role: 'Professional Chef Diploma (Level 3)', org: 'Westminster Kingsway College', dates: '2011 – 2013' },
        ] },
        { h: 'Skills', list: ['Menu development', 'GP and food cost control', 'HACCP', 'Level 3 Food Hygiene', 'Allergen management'] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Daniel Cook' },
      { cat: 'email', value: 'dan.cook.kitchen@outlook.com' },
      { cat: 'phone', value: '07700 900461' },
      { cat: 'url', value: '@chefdancook', note: 'bare Instagram handle' },
      { cat: 'url', value: 'instagram.com/chefdancook' },
      { cat: 'address', value: '14 Mare Street' },
      { cat: 'address', value: 'E8 3PN', note: 'UK postcode' },
    ],
    keep: ['Dishoom Shoreditch', 'The Ivy Chelsea Garden', 'Hawksmoor Spitalfields', 'Head Chef', 'Sous Chef', 'Line Cook', 'Westminster Kingsway College', 'HACCP', 'Level 3 Food Hygiene'],
  },

  /* ── 3 ── Manufacturing · Bangladesh (traditional BD CV) ─────────────── */
  {
    id: 'bd-garment-production-supervisor',
    career: 'Production Supervisor (Garments)',
    sector: 'Manufacturing / RMG',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    account: { fullName: 'Abdul Karim', email: 'karim.sheikh.rmg@yahoo.com', phone: '01819456123' },
    cv: {
      name: 'Md. Abdul Karim Sheikh',
      title: 'Production Supervisor',
      contacts: [
        { label: 'Mobile', value: '01819-456123' },
        { label: 'Alternative Mobile', value: '017 1122 3344' },
        { label: 'E-mail', value: 'karim.sheikh.rmg@yahoo.com' },
      ],
      address: ['Present Address: House 14, Road 3, Sector 7, Uttara, Dhaka-1230'],
      sections: [
        { h: 'Career Objective', p: 'To build a career in a reputed garment manufacturing company where I can use my experience in line balancing, SMV reduction and quality control to increase efficiency.' },
        { h: 'Employment History', jobs: [
          { role: 'Production Supervisor (Sewing)', org: 'DBL Group', place: 'Gazipur', dates: 'March 2019 – Present', bullets: [
            'Supervise 4 sewing lines (160 operators) for knit tops for H&M and Primark.',
            'Raised line efficiency from 58% to 71% through line balancing and SMV study.',
          ] },
          { role: 'Line Chief', org: 'Ha-Meem Group', place: 'Ashulia', dates: 'January 2015 – February 2019', bullets: [
            'Managed daily production target, WIP and operator skill matrix.',
          ] },
        ] },
        { h: 'Academic Qualification', jobs: [
          { role: 'Diploma in Textile Engineering', org: 'Bangladesh Institute of Textile Technology (BGMEA)', dates: '2014' },
          { role: 'SSC (Science), GPA 4.50', org: 'Faridpur Zilla School', dates: '2007' },
        ] },
        { h: 'Special Skills', list: ['Lean manufacturing', 'Line balancing', 'SMV / GSD', 'Quality control (AQL 2.5)', 'MS Excel'] },
        { h: 'Personal Information', kv: [
          ["Father's Name", 'Md. Abdul Jalil Sheikh'],
          ["Mother's Name", 'Mst. Rokeya Begum'],
          ['Date of Birth', '15-03-1990'],
          ['National ID No', '19902692512345678'],
          ['Permanent Address', 'Village: Char Bhadrasan, Post: Char Bhadrasan, Upazila: Char Bhadrasan, District: Faridpur'],
          ['Religion', 'Islam'],
          ['Marital Status', 'Married'],
          ['Blood Group', 'B+'],
          ['Nationality', 'Bangladeshi'],
        ] },
        { h: 'Reference', refs: [
          { name: 'Engr. Mizanur Rahman', role: 'General Manager (Production)', org: 'DBL Group', contact: ['Mobile: 01711-908070'] },
        ] },
        { h: 'Declaration', p: 'I hereby declare that all the information given above is true to the best of my knowledge.', sign: 'Md. Abdul Karim Sheikh' },
      ],
    },
    pii: [
      { cat: 'name', value: 'Md. Abdul Karim Sheikh' },
      { cat: 'phone', value: '01819-456123' },
      { cat: 'phone', value: '017 1122 3344', note: '3-4-4 grouping' },
      { cat: 'email', value: 'karim.sheikh.rmg@yahoo.com' },
      { cat: 'address', value: 'House 14, Road 3, Sector 7' },
      { cat: 'address', value: 'Dhaka-1230' },
      { cat: 'address', value: 'Char Bhadrasan', note: 'home village' },
      { cat: 'address', value: 'District: Faridpur', note: 'home district' },
      { cat: 'family', value: 'Abdul Jalil Sheikh' },
      { cat: 'family', value: 'Rokeya Begum' },
      { cat: 'dob', value: '15-03-1990' },
      { cat: 'gov-id', value: '19902692512345678', note: 'BD NID, 17 digits' },
      { cat: 'sensitive', value: 'Religion Islam' },
      { cat: 'sensitive', value: 'Blood Group B' },
      { cat: 'sensitive', value: 'Marital Status Married' },
      { cat: 'referee', value: 'Mizanur Rahman' },
      { cat: 'referee', value: '01711-908070' },
    ],
    keep: ['DBL Group', 'Ha-Meem Group', 'Bangladesh Institute of Textile Technology', 'BGMEA', 'Line balancing', 'SMV', 'H&M', 'Primark', 'Faridpur Zilla School', '58% to 71%'],
  },

  /* ── 4 ── Education · Bangladesh (Bangla-script CV) ──────────────────── */
  {
    id: 'bd-primary-teacher-bangla',
    career: 'Assistant Teacher (Primary)',
    sector: 'Education',
    country: 'Bangladesh',
    layout: 'classic',
    lang: 'bn',
    account: { fullName: 'Farzana Yasmin', email: 'farzana.yasmin.edu@gmail.com', phone: '01715334455' },
    cv: {
      name: 'মোছাঃ ফারজানা ইয়াসমিন',
      title: 'সহকারী শিক্ষক',
      contacts: [
        { label: 'মোবাইল', value: '০১৭১৫-৩৩৪৪৫৫' },
        { label: 'ইমেইল', value: 'farzana.yasmin.edu@gmail.com' },
      ],
      address: ['বর্তমান ঠিকানা: বাসা ২৭, রোড ৪, মোহাম্মদপুর, ঢাকা-১২০৭'],
      sections: [
        { h: 'ক্যারিয়ার উদ্দেশ্য', p: 'একজন নিবেদিতপ্রাণ শিক্ষক হিসেবে শিশুদের আনন্দময় পরিবেশে শিক্ষাদান করতে চাই।' },
        { h: 'কর্ম অভিজ্ঞতা', jobs: [
          { role: 'সহকারী শিক্ষক', org: 'মোহাম্মদপুর সরকারি প্রাথমিক বিদ্যালয়', dates: 'জানুয়ারি ২০১৯ – বর্তমান', bullets: [
            'তৃতীয় থেকে পঞ্চম শ্রেণিতে বাংলা ও গণিত পাঠদান।',
            'প্রাথমিক শিক্ষা সমাপনী পরীক্ষায় শতভাগ পাসের হার অর্জন।',
          ] },
        ] },
        { h: 'শিক্ষাগত যোগ্যতা', jobs: [
          { role: 'বি.এড', org: 'ঢাকা বিশ্ববিদ্যালয়', dates: '২০১৮' },
          { role: 'স্নাতক (সম্মান), বাংলা', org: 'ইডেন মহিলা কলেজ', dates: '২০১৬' },
        ] },
        { h: 'ব্যক্তিগত তথ্য', kv: [
          ['পিতার নাম', 'মোঃ আব্দুল হাকিম'],
          ['মাতার নাম', 'রাশিদা বেগম'],
          ['জন্ম তারিখ', '১২ জানুয়ারি ১৯৯৪'],
          ['জাতীয় পরিচয়পত্র নং', '১৯৯৪২৬৯২৫১২৩৪৫৬৭৮'],
          ['ধর্ম', 'ইসলাম'],
          ['বৈবাহিক অবস্থা', 'বিবাহিত'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'মোছাঃ ফারজানা ইয়াসমিন' },
      { cat: 'phone', value: '০১৭১৫-৩৩৪৪৫৫', note: 'Bengali numerals' },
      { cat: 'email', value: 'farzana.yasmin.edu@gmail.com' },
      { cat: 'address', value: 'বাসা ২৭, রোড ৪' },
      { cat: 'address', value: 'ঢাকা-১২০৭' },
      { cat: 'family', value: 'আব্দুল হাকিম' },
      { cat: 'family', value: 'রাশিদা বেগম' },
      { cat: 'dob', value: '১২ জানুয়ারি ১৯৯৪' },
      { cat: 'gov-id', value: '১৯৯৪২৬৯২৫১২৩৪৫৬৭৮', note: 'NID in Bengali numerals' },
      { cat: 'sensitive', value: 'ইসলাম', note: 'religion' },
      { cat: 'sensitive', value: 'বিবাহিত', note: 'marital status' },
    ],
    // Only content that survives PDF text extraction intact: this file's text
    // layer has no Unicode mapping for some conjuncts (বিশ্ববিদ্যালয়,
    // মোহাম্মদপুর), so those cannot measure the mask either way. See F8.
    keep: ['ইডেন মহিলা কলেজ', 'বি.এড', 'সহকারী শিক্ষক', 'গণিত', 'বাংলা', 'শতভাগ পাসের হার'],
  },

  /* ── 5 ── Trades · Australia ──────────────────────────────────────────── */
  {
    id: 'au-licensed-electrician',
    career: 'Licensed Electrician',
    sector: 'Trades',
    country: 'Australia',
    layout: 'modern-header',
    account: { fullName: "Liam O'Connor", email: 'liam.oconnor.sparky@gmail.com', phone: '0491570006' },
    cv: {
      name: 'Liam O’Connor',
      title: 'A-Grade Licensed Electrician',
      contacts: [
        { icon: '☎', value: '0491 570 006' },
        { icon: '✉', value: 'liam.oconnor.sparky@gmail.com' },
        { icon: '⌂', value: '22 Wattle Street, Penrith NSW 2750' },
      ],
      sections: [
        { h: 'About Me', p: 'Licensed electrician with 9 years across domestic, commercial and network work. Safety-first, tidy, and comfortable running jobs on my own.' },
        { h: 'Licences & Tickets', list: ['NSW Electrical Licence No. 312456C', 'White Card (WC-1234567)', 'NSW Driver Licence 12345678 (C, MR)', 'Test and tag', 'Working at Heights'] },
        { h: 'Experience', jobs: [
          { role: 'Electrician', org: 'Ausgrid', place: 'Sydney', dates: '2019 – Present', bullets: [
            'Service connections, metering and fault finding on the low-voltage network.',
            'Zero lost-time injuries across five years.',
          ] },
          { role: 'Apprentice → Electrician', org: 'Penrith Electrical Services', place: 'Penrith', dates: '2015 – 2019', bullets: [
            'Domestic rewires, switchboard upgrades and solar installs to AS/NZS 3000.',
          ] },
        ] },
        { h: 'Training', jobs: [
          { role: 'Certificate III in Electrotechnology Electrician (UEE30820)', org: 'TAFE NSW', dates: '2015 – 2019' },
        ] },
        { h: 'Referees', refs: [
          { name: 'Steve Kowalski', role: 'Field Supervisor', org: 'Ausgrid', contact: ['0491 570 159'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Liam O’Connor', note: 'curly apostrophe on the CV, straight one on the account' },
      { cat: 'phone', value: '0491 570 006' },
      { cat: 'email', value: 'liam.oconnor.sparky@gmail.com' },
      { cat: 'address', value: '22 Wattle Street' },
      { cat: 'address', value: 'Penrith NSW 2750' },
      { cat: 'registration', value: '312456C', note: 'electrical licence' },
      { cat: 'gov-id', value: 'WC-1234567', note: 'White Card' },
      { cat: 'gov-id', value: '12345678', note: 'driver licence number' },
      { cat: 'referee', value: 'Steve Kowalski' },
      { cat: 'referee', value: '0491 570 159' },
    ],
    keep: ['Ausgrid', 'Penrith Electrical Services', 'TAFE NSW', 'AS/NZS 3000', 'Certificate III in Electrotechnology', 'Test and tag', 'Working at Heights'],
  },

  /* ── 6 ── Law · United States ─────────────────────────────────────────── */
  {
    id: 'us-associate-attorney',
    career: 'Associate Attorney',
    sector: 'Law',
    country: 'United States',
    layout: 'classic',
    account: { fullName: 'Rebecca Chen-Adler', email: 'rchenadler@protonmail.com', phone: '(212) 555-0147' },
    cv: {
      name: 'Rebecca Chen-Adler',
      title: '',
      contacts: [
        { value: '350 West 57th Street, Apt 12C, New York, NY 10019' },
        { value: '(212) 555-0147' },
        { value: 'rchenadler@protonmail.com' },
        { value: 'linkedin.com/in/rchenadler' },
      ],
      sections: [
        { h: 'Bar Admissions', p: 'New York State Bar (Registration No. 5123456); U.S. District Court, Southern District of New York.' },
        { h: 'Experience', jobs: [
          { role: 'Litigation Associate', org: 'Skadden, Arps, Slate, Meagher & Flom LLP', place: 'New York, NY', dates: 'Sept 2020 – Present', bullets: [
            'Securities litigation and SEC enforcement defense for Fortune 500 clients.',
            'Drafted the winning motion to dismiss in a $400M shareholder class action.',
          ] },
          { role: 'Judicial Law Clerk', org: 'Hon. Maria Delgado, S.D.N.Y.', place: 'New York, NY', dates: '2019 – 2020', bullets: [
            'Drafted bench memoranda and opinions on civil and criminal matters.',
          ] },
        ] },
        { h: 'Education', jobs: [
          { role: 'J.D., magna cum laude', org: 'Columbia Law School', dates: '2019', bullets: ['Articles Editor, Columbia Law Review'] },
          { role: 'B.A., Political Science', org: 'University of Michigan', dates: '2016' },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Rebecca Chen-Adler' },
      { cat: 'address', value: '350 West 57th Street' },
      { cat: 'address', value: 'Apt 12C' },
      { cat: 'address', value: 'NY 10019', note: 'ZIP code' },
      { cat: 'phone', value: '(212) 555-0147' },
      { cat: 'email', value: 'rchenadler@protonmail.com' },
      { cat: 'url', value: 'linkedin.com/in/rchenadler' },
      { cat: 'registration', value: '5123456', note: 'bar registration number' },
    ],
    keep: ['Skadden, Arps, Slate, Meagher & Flom LLP', 'Columbia Law School', 'Columbia Law Review', 'University of Michigan', 'Southern District of New York', 'Securities litigation', '$400M'],
  },

  /* ── 7 ── Finance · India ─────────────────────────────────────────────── */
  {
    id: 'in-chartered-accountant',
    career: 'Chartered Accountant',
    sector: 'Finance',
    country: 'India',
    layout: 'table-header',
    account: { fullName: 'Rohan Mehta', email: 'rohan.mehta.ca@gmail.com', phone: '+91 98200 12345' },
    cv: {
      name: 'CA Rohan Mehta',
      title: 'Chartered Accountant | ICAI Membership No. 154321',
      contacts: [
        { label: 'Mobile', value: '+91 98200 12345' },
        { label: 'Residence', value: '022 2634 5678' },
        { label: 'Email', value: 'rohan.mehta.ca@gmail.com' },
      ],
      address: ['Flat 302, Sai Krupa CHS, Andheri (West), Mumbai – 400058'],
      sections: [
        { h: 'Profile', p: 'Chartered Accountant with 5 years in statutory audit and Ind AS reporting for listed manufacturing clients.' },
        { h: 'Work Experience', jobs: [
          { role: 'Assistant Manager, Audit & Assurance', org: 'Deloitte Haskins & Sells LLP', place: 'Mumbai', dates: 'Aug 2021 – Present', bullets: [
            'Lead statutory audits for 6 listed clients with turnover up to ₹4,000 crore.',
            'Ind AS 115 and Ind AS 116 transition reviews.',
          ] },
          { role: 'Article Assistant', org: 'Kalyaniwalla & Mistry LLP', place: 'Mumbai', dates: '2018 – 2021', bullets: ['GST reconciliations and tax audits under Section 44AB.'] },
        ] },
        { h: 'Qualifications', jobs: [
          { role: 'Chartered Accountant (All India Rank 38)', org: 'ICAI', dates: 'Nov 2021' },
          { role: 'B.Com', org: 'University of Mumbai', dates: '2018' },
        ] },
        { h: 'Skills', list: ['Ind AS', 'GST', 'Tally ERP 9', 'SAP FICO', 'Advanced Excel'] },
        { h: 'Personal Details', kv: [
          ["Father's Name", 'Suresh Mehta'],
          ['Date of Birth', '07/11/1993'],
          ['PAN', 'ABCPM1234K'],
          ['Aadhaar', '4521 8876 3310'],
          ['Marital Status', 'Single'],
          ['Languages', 'English, Hindi, Gujarati, Marathi'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Rohan Mehta' },
      { cat: 'phone', value: '+91 98200 12345' },
      { cat: 'phone', value: '022 2634 5678', note: 'Mumbai landline' },
      { cat: 'email', value: 'rohan.mehta.ca@gmail.com' },
      { cat: 'address', value: 'Flat 302, Sai Krupa CHS' },
      { cat: 'address', value: '400058', note: 'PIN code' },
      { cat: 'registration', value: '154321', note: 'ICAI membership number' },
      { cat: 'family', value: 'Suresh Mehta' },
      { cat: 'dob', value: '07/11/1993' },
      { cat: 'gov-id', value: 'ABCPM1234K', note: 'PAN' },
      { cat: 'gov-id', value: '4521 8876 3310', note: 'Aadhaar' },
      { cat: 'sensitive', value: 'Marital Status Single' },
    ],
    keep: ['Deloitte Haskins & Sells LLP', 'Kalyaniwalla & Mistry LLP', 'ICAI', 'University of Mumbai', 'Ind AS 115', 'GST', 'SAP FICO', 'Tally ERP 9', 'All India Rank 38'],
  },

  /* ── 8 ── Transport · Canada ──────────────────────────────────────────── */
  {
    id: 'ca-long-haul-truck-driver',
    career: 'Long-Haul Truck Driver (AZ)',
    sector: 'Transport & Logistics',
    country: 'Canada',
    layout: 'sidebar',
    account: { fullName: 'Gurpreet Dhillon', email: 'gsdhillon.trucking@gmail.com', phone: '416-555-0199' },
    cv: {
      name: 'Gurpreet Singh Dhillon',
      title: 'Class AZ Professional Driver',
      contacts: [
        { label: 'Cell', value: '416-555-0199' },
        { label: 'Home', value: '+1 905 555 0142' },
        { label: 'Email', value: 'gsdhillon.trucking@gmail.com' },
      ],
      address: ['88 Maple Grove Crescent', 'Brampton, ON L6X 2K4'],
      sections: [
        { h: 'Summary', p: 'AZ driver with 8 years and 1.2 million accident-free kilometres on cross-border and long-haul routes. FAST card holder, clean abstract, experienced with B-trains and reefers.' },
        { h: 'Licences', list: ['Ontario Class AZ — DL D4123-56789-01234', 'FAST card', 'TDG certified', 'Air brake (Z) endorsement'] },
        { h: 'Experience', jobs: [
          { role: 'Long-Haul AZ Driver', org: 'Bison Transport', place: 'Mississauga, ON', dates: '2019 – Present', bullets: [
            'Ontario–Texas lanes, 5,000 km weekly, 99.6% on-time delivery.',
            'Full compliance with Hours of Service and ELD logs; zero CVOR violations.',
          ] },
          { role: 'AZ Driver', org: 'Challenger Motor Freight', place: 'Cambridge, ON', dates: '2016 – 2019', bullets: ['Regional reefer runs; trained 4 new drivers.'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Gurpreet Singh Dhillon' },
      { cat: 'phone', value: '416-555-0199' },
      { cat: 'phone', value: '+1 905 555 0142' },
      { cat: 'email', value: 'gsdhillon.trucking@gmail.com' },
      { cat: 'address', value: '88 Maple Grove Crescent' },
      { cat: 'address', value: 'L6X 2K4', note: 'Canadian postal code' },
      { cat: 'gov-id', value: 'D4123-56789-01234', note: 'Ontario driver licence' },
    ],
    keep: ['Bison Transport', 'Challenger Motor Freight', 'Class AZ', 'FAST card', 'TDG', 'Hours of Service', 'CVOR', 'B-trains', '1.2 million'],
  },

  /* ── 9 ── Retail · New Zealand ────────────────────────────────────────── */
  {
    id: 'nz-retail-store-manager',
    career: 'Retail Store Manager',
    sector: 'Retail',
    country: 'New Zealand',
    layout: 'classic',
    account: { fullName: 'Rose Walker', email: 'rose.walker.nz@xtra.co.nz', phone: '021 555 0123' },
    cv: {
      name: 'Rose Walker',
      title: 'Store Manager',
      contacts: [
        { label: 'Mobile', value: '021 555 0123' },
        { label: 'Home', value: '(09) 555 0876' },
        { label: 'Email', value: 'rose.walker.nz@xtra.co.nz' },
      ],
      address: ['42 Ponsonby Road, Ponsonby, Auckland 1011'],
      sections: [
        { h: 'Summary', p: 'Retail leader who joined The Warehouse as a casual and rose to Store Manager within six years. I will bring strong rostering, shrinkage control and a coaching style to a larger format store.' },
        { h: 'Experience', jobs: [
          { role: 'Store Manager', org: 'The Warehouse', place: 'Auckland', dates: '2020 – Present', bullets: [
            'Lead 45 staff; store ranked top 5 of 86 for NPS in 2023.',
            'Cut shrinkage from 2.1% to 1.3% of sales.',
          ] },
          { role: 'Department Manager', org: 'Farmers', place: 'Auckland', dates: '2017 – 2020', bullets: ['Homewares and seasonal; stock ordering and rostering.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'New Zealand Certificate in Retail (Level 4)', org: 'ServiceIQ', dates: '2018' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Rose Walker' },
      { cat: 'phone', value: '021 555 0123' },
      { cat: 'phone', value: '(09) 555 0876', note: 'NZ landline' },
      { cat: 'email', value: 'rose.walker.nz@xtra.co.nz' },
      { cat: 'address', value: '42 Ponsonby Road' },
      { cat: 'address', value: 'Auckland 1011' },
    ],
    keep: ['The Warehouse', 'Farmers', 'ServiceIQ', 'Store Manager', 'rose to Store Manager', 'shrinkage', 'I will bring', 'NPS'],
  },

  /* ── 10 ── Creative · Philippines ─────────────────────────────────────── */
  {
    id: 'ph-graphic-designer',
    career: 'Graphic Designer',
    sector: 'Creative / Design',
    country: 'Philippines',
    layout: 'modern-header',
    account: { fullName: 'Isabel Santos', email: 'hello@isabelsantos.design', phone: '+63 917 123 4567' },
    cv: {
      name: 'Maria Isabel Santos',
      title: 'Graphic Designer · Brand & Social',
      contacts: [
        { icon: '✉', value: 'hello@isabelsantos.design' },
        { icon: '☎', value: '+63 917 123 4567 / 0917 123 4567' },
        { icon: '⌂', value: 'Unit 1504, Greenbelt Residences, Makati City 1224' },
        { icon: '◆', value: 'behance.net/isabelsantos' },
        { icon: '◆', value: 'isabelsantos.myportfolio.com' },
        { icon: '◆', value: 'IG @isa.designs' },
      ],
      sections: [
        { h: 'Profile', p: 'Designer with 5 years in agency brand work and social content for FMCG and QSR clients. Comfortable owning a campaign from moodboard to final artwork.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Graphic Designer', org: 'Ogilvy Philippines', place: 'Makati', dates: '2021 – Present', bullets: [
            'Lead designer on the Jollibee Chickenjoy summer campaign (38M impressions).',
            'Built the social design system used across 4 client accounts.',
          ] },
          { role: 'Graphic Designer', org: 'Freelance (Upwork Top Rated)', dates: '2019 – 2021', bullets: ['Logos, packaging and pitch decks for 60+ clients in 9 countries.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'BFA Advertising Arts', org: 'University of Santo Tomas', dates: '2019' }] },
        { h: 'Tools', list: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma', 'After Effects', 'Canva'] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Maria Isabel Santos' },
      { cat: 'email', value: 'hello@isabelsantos.design' },
      { cat: 'phone', value: '+63 917 123 4567' },
      { cat: 'phone', value: '0917 123 4567', note: 'local 4-3-4 form' },
      { cat: 'address', value: 'Unit 1504, Greenbelt Residences' },
      { cat: 'address', value: 'Makati City 1224' },
      { cat: 'url', value: 'behance.net/isabelsantos' },
      { cat: 'url', value: 'isabelsantos.myportfolio.com' },
      { cat: 'url', value: '@isa.designs', note: 'bare Instagram handle' },
    ],
    keep: ['Ogilvy Philippines', 'Jollibee Chickenjoy', 'University of Santo Tomas', 'Upwork', 'Adobe Illustrator', 'Figma', '38M impressions'],
  },

  /* ── 11 ── Social work · UK ───────────────────────────────────────────── */
  {
    id: 'uk-social-worker',
    career: 'Social Worker (Children & Families)',
    sector: 'Community & Social Services',
    country: 'United Kingdom',
    layout: 'classic',
    account: { fullName: 'Aisha Bello', email: 'aisha.bello.sw@gmail.com', phone: '07700 900372' },
    cv: {
      name: 'Aisha Bello',
      title: 'Registered Social Worker',
      contacts: [
        { label: 'Tel', value: '+44 (0)161 496 0123' },
        { label: 'Mobile', value: '07700 900 372' },
        { label: 'Email', value: 'aisha.bello.sw@gmail.com' },
      ],
      address: ['27 Wilmslow Road, Rusholme, Manchester M14 5TQ'],
      sections: [
        { h: 'Registration', p: 'Social Work England registration SW112233. Enhanced DBS on the Update Service (certificate 001234567890). National Insurance number QQ 12 34 56 C.' },
        { h: 'Experience', jobs: [
          { role: 'Social Worker, Children in Need Team', org: 'Manchester City Council', place: 'Manchester', dates: '2020 – Present', bullets: [
            'Caseload of 18 families; lead on Section 47 enquiries and child protection plans.',
            'Trained the team in the Signs of Safety model.',
          ] },
          { role: 'Family Support Worker', org: 'Barnardo’s', place: 'Salford', dates: '2016 – 2018', bullets: ['Early help work with families at risk.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'MA Social Work', org: 'University of Salford', dates: '2018 – 2020' }] },
        { h: 'References', refs: [
          { name: 'Joanne Pritchard', role: 'Team Manager', org: 'Manchester City Council', contact: ['0161 234 5000', 'joanne.pritchard@manchester.gov.uk'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Aisha Bello' },
      { cat: 'phone', value: '+44 (0)161 496 0123' },
      { cat: 'phone', value: '07700 900 372' },
      { cat: 'email', value: 'aisha.bello.sw@gmail.com' },
      { cat: 'address', value: '27 Wilmslow Road' },
      { cat: 'address', value: 'M14 5TQ', note: 'UK postcode' },
      { cat: 'registration', value: 'SW112233', note: 'Social Work England' },
      { cat: 'gov-id', value: '001234567890', note: 'DBS certificate number' },
      { cat: 'gov-id', value: 'QQ 12 34 56 C', note: 'National Insurance number' },
      { cat: 'referee', value: 'Joanne Pritchard' },
      { cat: 'referee', value: '0161 234 5000' },
      { cat: 'referee', value: 'joanne.pritchard@manchester.gov.uk' },
    ],
    keep: ['Manchester City Council', 'University of Salford', 'Section 47', 'Signs of Safety', 'MA Social Work', 'Children in Need'],
  },

  /* ── 12 ── Engineering · Nigeria ──────────────────────────────────────── */
  {
    id: 'ng-civil-engineer',
    career: 'Civil / Structural Engineer',
    sector: 'Engineering & Construction',
    country: 'Nigeria',
    layout: 'table-header',
    account: { fullName: 'Emeka Obi', email: 'emeka.obi.eng@yahoo.com', phone: '+2348031234567' },
    cv: {
      name: 'Engr. Chukwuemeka Obi',
      title: 'Civil / Structural Engineer, COREN Registered (R.23456)',
      contacts: [
        { label: 'Phone', value: '+234 803 123 4567, 0803 123 4567' },
        { label: 'Email', value: 'emeka.obi.eng@yahoo.com' },
      ],
      address: ['Plot 15, Admiralty Way, Lekki Phase 1, Lagos State'],
      sections: [
        { h: 'Career Objective', p: 'To apply 9 years of structural design and site supervision experience on large infrastructure projects.' },
        { h: 'Work Experience', jobs: [
          { role: 'Senior Site Engineer', org: 'Julius Berger Nigeria Plc', place: 'Lagos', dates: '2018 – Present', bullets: [
            'Supervised the 4.2 km Lekki–Ikoyi link road; delivered 3 weeks ahead of schedule.',
            'Structural checks in SAP2000 and ETABS for 12 bridge decks.',
          ] },
          { role: 'Site Engineer', org: 'Dangote Cement Plc', place: 'Obajana', dates: '2015 – 2018', bullets: ['Silo foundations and plant civil works.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'B.Eng Civil Engineering (Second Class Upper)', org: 'University of Nigeria, Nsukka', dates: '2014' }] },
        { h: 'Personal Data', kv: [
          ['Date of Birth', '14th February 1988'],
          ['State of Origin', 'Anambra'],
          ['LGA', 'Onitsha North'],
          ['Sex', 'Male'],
          ['Marital Status', 'Married'],
          ['Religion', 'Christianity'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Chukwuemeka Obi' },
      { cat: 'phone', value: '+234 803 123 4567' },
      { cat: 'phone', value: '0803 123 4567', note: 'local 4-3-4 form' },
      { cat: 'email', value: 'emeka.obi.eng@yahoo.com' },
      { cat: 'address', value: 'Plot 15, Admiralty Way' },
      { cat: 'registration', value: 'R.23456', note: 'COREN registration' },
      { cat: 'dob', value: '14th February 1988' },
      { cat: 'sensitive', value: 'Religion Christianity' },
      { cat: 'sensitive', value: 'Marital Status Married' },
      { cat: 'sensitive', value: 'State of Origin Anambra' },
      { cat: 'sensitive', value: 'LGA Onitsha North' },
      { cat: 'sensitive', value: 'Sex Male' },
    ],
    keep: ['Julius Berger Nigeria Plc', 'Dangote Cement Plc', 'University of Nigeria, Nsukka', 'SAP2000', 'ETABS', 'Lekki–Ikoyi link road', 'COREN'],
  },

  /* ── 13 ── Healthcare · Bangladesh ────────────────────────────────────── */
  {
    id: 'bd-pharmacist',
    career: 'Pharmacist (QA)',
    sector: 'Healthcare / Pharma',
    country: 'Bangladesh',
    layout: 'sidebar',
    account: { fullName: 'Tasnim Rahman Mithila', email: 'tasnim.mithila@gmail.com', phone: '+8801712345678' },
    cv: {
      name: 'Tasnim Rahman Mithila',
      title: 'Pharmacist — Quality Assurance',
      contacts: [
        { label: 'Mobile', value: '+8801712345678' },
        { label: 'Alt', value: '0171-2345678' },
        { label: 'Email', value: 'tasnim.mithila@gmail.com' },
        { label: 'Skype', value: 'tasnim.mithila' },
      ],
      address: ['House 12, Road 7, Dhanmondi, Dhaka-1205'],
      sections: [
        { h: 'Career Summary', p: 'Registered Pharmacist (Pharmacy Council of Bangladesh Reg. No. A-12345) with 4 years in QA for oral solid dosage manufacturing.' },
        { h: 'Experience', jobs: [
          { role: 'Executive, Quality Assurance', org: 'Square Pharmaceuticals PLC', place: 'Gazipur', dates: '2021 – Present', bullets: [
            'Own deviation and CAPA management; closed 94% of CAPAs on time in 2023.',
            'Prepared the site for the MHRA UK and WHO-GMP audits.',
          ] },
          { role: 'Officer, QA', org: 'Beximco Pharmaceuticals', place: 'Tongi', dates: '2020 – 2021', bullets: ['Batch record review and line clearance.'] },
        ] },
        { h: 'Education', jobs: [
          { role: 'M.Pharm (Pharmaceutical Technology)', org: 'University of Dhaka', dates: '2020' },
          { role: 'B.Pharm (Hons), CGPA 3.72/4.00', org: 'University of Dhaka', dates: '2019' },
        ] },
        { h: 'References', refs: [
          { name: 'Prof. Dr. Sitesh C. Bachar', role: 'Professor, Department of Pharmacy', org: 'University of Dhaka', contact: ['01711-556677'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Tasnim Rahman Mithila' },
      { cat: 'phone', value: '+8801712345678' },
      { cat: 'phone', value: '0171-2345678', note: '4-7 grouping' },
      { cat: 'email', value: 'tasnim.mithila@gmail.com' },
      { cat: 'url', value: 'Skype tasnim.mithila', note: 'Skype id' },
      { cat: 'address', value: 'House 12, Road 7' },
      { cat: 'address', value: 'Dhaka-1205' },
      { cat: 'registration', value: 'A-12345', note: 'Pharmacy Council registration' },
      { cat: 'referee', value: 'Sitesh C. Bachar' },
      { cat: 'referee', value: '01711-556677' },
    ],
    keep: ['Square Pharmaceuticals PLC', 'Beximco Pharmaceuticals', 'University of Dhaka', 'WHO-GMP', 'MHRA', 'CAPA', 'CGPA 3.72/4.00', 'M.Pharm'],
  },

  /* ── 14 ── Security · Bangladesh → Gulf ───────────────────────────────── */
  {
    id: 'bd-security-guard-overseas',
    career: 'Security Guard (overseas employment)',
    sector: 'Security Services',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    account: { fullName: 'Jahangir Alam', email: 'jahangir.alam.bd88@gmail.com', phone: '01912-345678' },
    cv: {
      name: 'Md. Jahangir Alam',
      title: 'Security Guard',
      contacts: [
        { label: 'Mobile', value: '01912-345678' },
        { label: 'WhatsApp', value: '+966 55 123 4567' },
        { label: 'Email', value: 'jahangir.alam.bd88@gmail.com' },
      ],
      address: ['Permanent Address: Village: Kalir Bazar, P.O: Kalir Bazar, P.S: Fatullah, Dist: Narayanganj'],
      sections: [
        { h: 'Objective', p: 'Seeking a security guard position in Saudi Arabia or Qatar. Disciplined, physically fit, and trained in access control and fire safety.' },
        { h: 'Work Experience', jobs: [
          { role: 'Security Guard', org: 'G4S Secure Solutions Bangladesh', place: 'Dhaka', dates: '2016 – 2023', bullets: [
            'Access control and CCTV monitoring at a 12-storey bank headquarters.',
            'First responder for fire drills; Best Guard award 2021.',
          ] },
          { role: 'Security Guard', org: 'Elite Security Services Ltd', place: 'Narayanganj', dates: '2012 – 2016', bullets: ['Night patrol at a garment factory compound.'] },
        ] },
        { h: 'Training', list: ['Bangladesh Ansar & VDP basic training (2011)', 'Fire safety and first aid — Fire Service & Civil Defence', 'BMET pre-departure orientation'] },
        { h: 'Passport Details', kv: [
          ['Passport No', 'A01234567'],
          ['Date of Issue', '10-01-2022'],
          ['Date of Expiry', '09-01-2032'],
        ] },
        { h: 'Personal Details', kv: [
          ["Father's Name", 'Md. Nurul Islam'],
          ['Date of Birth', '01-01-1988'],
          ['NID No', '5102938475'],
          ['Height', "5'8\""],
          ['Weight', '70 kg'],
          ['Religion', 'Islam'],
          ['Marital Status', 'Married'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Md. Jahangir Alam' },
      { cat: 'phone', value: '01912-345678' },
      { cat: 'phone', value: '+966 55 123 4567' },
      { cat: 'email', value: 'jahangir.alam.bd88@gmail.com' },
      { cat: 'address', value: 'Kalir Bazar', note: 'home village' },
      { cat: 'address', value: 'P.S: Fatullah', note: 'police station' },
      { cat: 'address', value: 'Dist: Narayanganj', note: 'home district' },
      { cat: 'gov-id', value: 'A01234567', note: 'passport number' },
      { cat: 'sensitive', value: 'Date of Issue 10-01-2022', note: 'passport issue date' },
      { cat: 'sensitive', value: 'Date of Expiry 09-01-2032', note: 'passport expiry date' },
      { cat: 'gov-id', value: '5102938475', note: 'BD smart NID, 10 digits' },
      { cat: 'family', value: 'Nurul Islam' },
      { cat: 'dob', value: '01-01-1988' },
      { cat: 'sensitive', value: 'Height 5\'8"' },
      { cat: 'sensitive', value: 'Weight 70 kg' },
      { cat: 'sensitive', value: 'Marital Status Married' },
      { cat: 'sensitive', value: 'Religion Islam' },
    ],
    keep: ['G4S Secure Solutions Bangladesh', 'Elite Security Services Ltd', 'CCTV', 'Bangladesh Ansar', 'BMET', 'Best Guard award 2021', 'Fire Service & Civil Defence'],
  },

  /* ── 15 ── Personal services · Australia ──────────────────────────────── */
  {
    id: 'au-senior-hairdresser',
    career: 'Senior Hairdresser & Colourist',
    sector: 'Beauty / Personal Services',
    country: 'Australia',
    layout: 'modern-header',
    account: { fullName: 'Jess Tran', email: 'bookings@hairbyjess.com.au', phone: '0491 570 313' },
    cv: {
      name: 'Jessica Tran',
      title: 'Senior Stylist · Colour Specialist',
      contacts: [
        { icon: '☎', value: '0491 570 313' },
        { icon: '✉', value: 'bookings@hairbyjess.com.au' },
        { icon: '◆', value: 'hairbyjess.com.au' },
        { icon: '◆', value: 'Instagram: @hairbyjess_bne' },
        { icon: '⌂', value: '8/22 Brunswick St, Fortitude Valley QLD 4006' },
      ],
      sections: [
        { h: 'About', p: 'Colour specialist with 8 years behind the chair. Clients know me as Jess — most of my book is rebookings and referrals. Before-and-after work at instagram.com/hairbyjess_bne.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Stylist', org: 'Toni&Guy James Street', place: 'Brisbane', dates: '2019 – Present', bullets: [
            '92% client retention; highest colour revenue in the salon two years running.',
            'Educator for Wella balayage and toning workshops.',
          ] },
          { role: 'Stylist', org: 'Rokk Ebony', place: 'Brisbane', dates: '2016 – 2019', bullets: ['Cuts, foils and bridal styling.'] },
        ] },
        { h: 'Qualifications', jobs: [{ role: 'Certificate III in Hairdressing (SHB30416)', org: 'TAFE Queensland', dates: '2016' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Jessica Tran' },
      { cat: 'phone', value: '0491 570 313' },
      { cat: 'email', value: 'bookings@hairbyjess.com.au' },
      { cat: 'url', value: 'hairbyjess.com.au' },
      { cat: 'url', value: '@hairbyjess_bne', note: 'bare Instagram handle' },
      { cat: 'url', value: 'instagram.com/hairbyjess_bne' },
      { cat: 'address', value: '8/22 Brunswick St' },
      { cat: 'address', value: 'Fortitude Valley QLD 4006' },
    ],
    keep: ['Toni&Guy James Street', 'Rokk Ebony', 'TAFE Queensland', 'Wella', 'balayage', 'SHB30416', '92% client retention'],
  },

  /* ── 16 ── Media · Bangladesh ─────────────────────────────────────────── */
  {
    id: 'bd-senior-reporter',
    career: 'Senior Reporter',
    sector: 'Media & Journalism',
    country: 'Bangladesh',
    layout: 'classic',
    account: { fullName: 'Rafsan Haque', email: 'rafsanhaque.bd@gmail.com', phone: '01552-667788' },
    cv: {
      name: 'Rafsan Haque',
      title: 'Senior Reporter — Investigations',
      contacts: [
        { value: '01552-667788' },
        { value: 'rafsanhaque.bd@gmail.com' },
        { value: 'x.com/rafsan_reports' },
        { value: 'muckrack.com/rafsan-haque' },
      ],
      address: ['Flat 5C, Green Valley Apartments, 45/1 Indira Road, Farmgate, Dhaka-1215'],
      sections: [
        { h: 'Profile', p: 'Investigative reporter covering labour rights and public procurement. Follow my reporting at @rafsan_reports. PID accreditation card no. 4417.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Reporter', org: 'The Daily Star', place: 'Dhaka', dates: '2020 – Present', bullets: [
            'Series on RMG wage theft cited in parliament; 2022 TIB Investigative Journalism Award.',
            'Built a procurement database from 3,000 RTI responses.',
          ] },
          { role: 'Staff Reporter', org: 'Prothom Alo', place: 'Dhaka', dates: '2016 – 2020', bullets: ['City desk; local government and transport.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'BSS & MSS, Mass Communication and Journalism', org: 'University of Dhaka', dates: '2015' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Rafsan Haque' },
      { cat: 'phone', value: '01552-667788' },
      { cat: 'email', value: 'rafsanhaque.bd@gmail.com' },
      { cat: 'url', value: 'x.com/rafsan_reports' },
      { cat: 'url', value: 'muckrack.com/rafsan-haque' },
      { cat: 'url', value: '@rafsan_reports', note: 'bare X handle' },
      { cat: 'address', value: 'Flat 5C, Green Valley Apartments' },
      { cat: 'address', value: '45/1 Indira Road' },
      { cat: 'address', value: 'Dhaka-1215' },
      { cat: 'registration', value: 'PID accreditation card no. 4417' },
    ],
    keep: ['Senior Reporter', 'Staff Reporter', 'The Daily Star', 'Prothom Alo', 'University of Dhaka', 'Mass Communication and Journalism', 'TIB Investigative Journalism Award', 'RTI', '3,000'],
  },

  /* ── 17 ── Aviation · Singapore ───────────────────────────────────────── */
  {
    id: 'sg-airline-first-officer',
    career: 'Airline First Officer (A320)',
    sector: 'Aviation',
    country: 'Singapore',
    layout: 'table-header',
    account: { fullName: 'Nicholas Ang', email: 'nick.ang.flying@gmail.com', phone: '+65 9123 4567' },
    cv: {
      name: 'Nicholas Ang Wei Jie',
      title: 'First Officer — Airbus A320',
      contacts: [
        { label: 'Mobile', value: '+65 9123 4567' },
        { label: 'Local', value: '9123 4567' },
        { label: 'Email', value: 'nick.ang.flying@gmail.com' },
      ],
      address: ['Blk 123 Tampines Street 11, #05-67, Singapore 521123'],
      sections: [
        { h: 'Licences & Ratings', list: ['CAAS ATPL(A) No. 12345', 'A320 type rating', 'Class 1 Medical (valid to 03/2027)', 'ICAO English Level 6'] },
        { h: 'Flying Experience', kv: [['Total time', '4,850 hrs'], ['A320 time', '4,100 hrs'], ['PIC', '350 hrs']] },
        { h: 'Employment', jobs: [
          { role: 'First Officer, A320', org: 'Jetstar Asia', place: 'Singapore', dates: '2018 – Present', bullets: [
            'Line operations across 17 destinations; Line Training First Officer since 2022.',
          ] },
          { role: 'Cadet Pilot', org: 'Singapore Flying College', dates: '2016 – 2018' },
        ] },
        { h: 'Personal Particulars', kv: [
          ['NRIC', 'S8912345D'],
          ['Date of Birth', '03 Aug 1989'],
          ['Nationality', 'Singaporean'],
          ['Passport', 'K1234567A'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Nicholas Ang Wei Jie' },
      { cat: 'phone', value: '+65 9123 4567' },
      { cat: 'phone', value: '9123 4567', note: 'local 4-4 form' },
      { cat: 'email', value: 'nick.ang.flying@gmail.com' },
      { cat: 'address', value: '123 Tampines Street 11' },
      { cat: 'address', value: '#05-67' },
      { cat: 'address', value: 'Singapore 521123' },
      { cat: 'registration', value: 'ATPL(A) No. 12345', note: 'pilot licence' },
      { cat: 'gov-id', value: 'S8912345D', note: 'NRIC' },
      { cat: 'gov-id', value: 'K1234567A', note: 'passport number' },
      { cat: 'dob', value: '03 Aug 1989' },
    ],
    keep: ['Jetstar Asia', 'Singapore Flying College', 'A320 type rating', 'ICAO English Level 6', '4,850 hrs', 'Line Training First Officer'],
  },

  /* ── 18 ── Aged care · Australia ──────────────────────────────────────── */
  {
    id: 'au-aged-care-worker',
    career: 'Personal Care Worker (Aged Care)',
    sector: 'Aged & Disability Care',
    country: 'Australia',
    layout: 'classic',
    account: { fullName: 'Sunita Gurung', email: 'sunita.gurung92@gmail.com', phone: '0401 234 567' },
    cv: {
      name: 'Sunita Gurung',
      title: 'Personal Care Worker',
      contacts: [
        { label: 'Mobile', value: '0401 234 567' },
        { label: 'Email', value: 'sunita.gurung92@gmail.com' },
      ],
      address: ['5 Rosella Close, Mawson Lakes SA 5095'],
      sections: [
        { h: 'Summary', p: 'Compassionate carer with 4 years in residential aged care and dementia support. NDIS Worker Screening Check 1234567 (valid to 2028). Visa: subclass 485, full work rights.' },
        { h: 'Experience', jobs: [
          { role: 'Personal Care Worker', org: 'Resthaven Marion', place: 'Adelaide', dates: '2021 – Present', bullets: [
            'Personal care, mobility and medication prompting for 14 residents per shift.',
            'Dementia Champion for the memory support unit.',
          ] },
        ] },
        { h: 'Education', jobs: [{ role: 'Certificate III in Individual Support (CHC33015)', org: 'TAFE SA', dates: '2020' }] },
        { h: 'Languages', list: ['English', 'Nepali', 'Hindi'] },
        { h: 'Referees', refs: [
          { name: 'Margaret Evans', role: 'Care Manager (RN)', org: 'Resthaven Marion', contact: ['08 8123 4567'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Sunita Gurung' },
      { cat: 'phone', value: '0401 234 567' },
      { cat: 'email', value: 'sunita.gurung92@gmail.com' },
      { cat: 'address', value: '5 Rosella Close' },
      { cat: 'address', value: 'Mawson Lakes SA 5095' },
      { cat: 'registration', value: '1234567', note: 'NDIS worker screening number' },
      { cat: 'referee', value: 'Margaret Evans' },
      { cat: 'referee', value: '08 8123 4567' },
    ],
    keep: ['Resthaven Marion', 'TAFE SA', 'CHC33015', 'Certificate III in Individual Support', 'Dementia Champion', 'Nepali'],
  },

  /* ── 19 ── Agriculture · Bangladesh ───────────────────────────────────── */
  {
    id: 'bd-agriculture-extension-officer',
    career: 'Agriculture Extension Officer',
    sector: 'Agriculture',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    account: { fullName: 'Shafiqul Islam', email: 'shafiq.agri@gmail.com', phone: '01740-112233' },
    cv: {
      name: 'Md. Shafiqul Islam Sarkar',
      title: 'Sub-Assistant Agriculture Officer',
      contacts: [
        { label: 'Mobile', value: '01740-112233' },
        { label: 'E-mail', value: 'shafiq.agri@gmail.com' },
      ],
      address: ['Village: Char Kalibari, Post Office: Godagari, Upazila: Godagari, District: Rajshahi-6290'],
      sections: [
        { h: 'Career Objective', p: 'To support smallholder farmers with modern, climate-resilient practices through government or NGO extension programmes.' },
        { h: 'Job Experience', jobs: [
          { role: 'Sub-Assistant Agriculture Officer', org: 'Department of Agricultural Extension (DAE)', place: 'Godagari, Rajshahi', dates: '2017 – Present', bullets: [
            'Run farmer field schools for 25 IPM groups (600 farmers).',
            'Introduced BRRI dhan89; average yield up 0.8 t/ha in my block.',
          ] },
        ] },
        { h: 'Educational Qualification', jobs: [
          { role: 'Diploma in Agriculture', org: 'Agricultural Training Institute, Ishurdi', dates: '2016' },
          { role: 'B.Sc. Ag (Hons), running', org: 'Bangladesh Agricultural University', dates: '' },
        ] },
        { h: 'Personal Information', kv: [
          ["Father's Name", 'Late Abdus Sattar Sarkar'],
          ["Mother's Name", 'Mst. Hosne Ara Begum'],
          ['Date of Birth', '20 June 1995'],
          ['NID', '8234567890123'],
          ['Religion', 'Islam'],
          ['Nationality', 'Bangladeshi (by birth)'],
        ] },
        { h: 'Declaration', p: 'I do hereby declare that the above information is true and correct.', sign: 'Md. Shafiqul Islam Sarkar' },
      ],
    },
    pii: [
      { cat: 'name', value: 'Md. Shafiqul Islam Sarkar' },
      { cat: 'phone', value: '01740-112233' },
      { cat: 'email', value: 'shafiq.agri@gmail.com' },
      { cat: 'address', value: 'Char Kalibari', note: 'home village' },
      { cat: 'address', value: 'Post Office: Godagari' },
      { cat: 'address', value: 'Upazila: Godagari' },
      { cat: 'address', value: 'Rajshahi-6290' },
      { cat: 'family', value: 'Abdus Sattar Sarkar' },
      { cat: 'family', value: 'Hosne Ara Begum' },
      { cat: 'dob', value: '20 June 1995' },
      { cat: 'gov-id', value: '8234567890123', note: 'BD NID, 13 digits' },
      { cat: 'sensitive', value: 'Religion Islam' },
    ],
    keep: ['Department of Agricultural Extension', 'DAE', 'Bangladesh Agricultural University', 'Agricultural Training Institute, Ishurdi', 'IPM', 'BRRI dhan89', 'farmer field schools'],
  },

  /* ── 20 ── Medicine · Bangladesh ──────────────────────────────────────── */
  {
    id: 'bd-medical-officer',
    career: 'Medical Officer',
    sector: 'Healthcare / Medicine',
    country: 'Bangladesh',
    layout: 'sidebar',
    account: { fullName: 'Nusrat Jahan', email: 'dr.nusrat.jahan@gmail.com', phone: '+880 1811-223344' },
    cv: {
      name: 'Dr. Nusrat Jahan Chowdhury',
      title: 'MBBS, FCPS Part-I (Medicine)',
      contacts: [
        { label: 'Cell', value: '+880 1811-223344' },
        { label: 'Email', value: 'dr.nusrat.jahan@gmail.com' },
        { label: 'BMDC Reg.', value: 'A-65432' },
      ],
      address: ['House 5, Road 2, Khulshi, Chattogram-4225'],
      sections: [
        { h: 'Profile', p: 'Medical Officer with 5 years of emergency and internal medicine experience, including 2 years at an Upazila Health Complex through BCS (Health).' },
        { h: 'Experience', jobs: [
          { role: 'Medical Officer, Emergency', org: 'Chattogram Medical College Hospital', place: 'Chattogram', dates: '2022 – Present', bullets: [
            'Triage and resuscitation in a 120-bed emergency department.',
          ] },
          { role: 'Medical Officer', org: 'Hathazari Upazila Health Complex', place: 'Hathazari', dates: '2020 – 2022', bullets: ['Outpatient, maternal health and dengue outbreak response.'] },
        ] },
        { h: 'Education', jobs: [
          { role: 'FCPS Part-I (Medicine)', org: 'Bangladesh College of Physicians and Surgeons', dates: '2021' },
          { role: 'MBBS', org: 'Chattogram Medical College', dates: '2018' },
        ] },
        { h: 'Personal', kv: [['Date of Birth', '22/09/1993'], ['Blood Group', 'O+'], ['Marital Status', 'Married']] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Nusrat Jahan Chowdhury' },
      { cat: 'phone', value: '+880 1811-223344' },
      { cat: 'email', value: 'dr.nusrat.jahan@gmail.com' },
      { cat: 'registration', value: 'A-65432', note: 'BMDC registration' },
      { cat: 'address', value: 'House 5, Road 2' },
      { cat: 'address', value: 'Chattogram-4225' },
      { cat: 'dob', value: '22/09/1993' },
      { cat: 'sensitive', value: 'Blood Group O' },
      { cat: 'sensitive', value: 'Marital Status Married' },
    ],
    keep: ['Chattogram Medical College Hospital', 'Hathazari Upazila Health Complex', 'Bangladesh College of Physicians and Surgeons', 'BCS (Health)', 'MBBS', 'FCPS Part-I'],
  },

  /* ── 21 ── Early childhood · Australia ────────────────────────────────── */
  {
    id: 'au-early-childhood-educator',
    career: 'Early Childhood Educator',
    sector: 'Education & Childcare',
    country: 'Australia',
    layout: 'modern-header',
    account: { fullName: 'Grace Hill', email: 'gracehill.ece@outlook.com', phone: '+61 8 9123 4567' },
    cv: {
      name: 'Grace Hill',
      title: 'Diploma-Qualified Early Childhood Educator',
      contacts: [
        { icon: '☎', value: '+61 8 9123 4567' },
        { icon: '✉', value: 'gracehill.ece@outlook.com' },
        { icon: '⌂', value: '14 Banksia Way, Joondalup WA 6027' },
      ],
      sections: [
        { h: 'About Me', p: 'Room Leader with 6 years in long day care. Play-based programming under the EYLF, and a strong record in the NQS rating process. WWC Card 1234567.' },
        { h: 'Experience', jobs: [
          { role: 'Room Leader (Pre-Kindy)', org: 'Goodstart Early Learning Joondalup', place: 'Perth', dates: '2021 – Present', bullets: [
            'Lead a room of 22 children and 3 educators; centre rated Exceeding NQS in 2023.',
          ] },
          { role: 'Educator', org: 'Only About Children Box Hill', place: 'Melbourne', dates: '2018 – 2021', bullets: ['Toddler room; family communication through Storypark.'] },
        ] },
        { h: 'Qualifications', jobs: [
          { role: 'Diploma of Early Childhood Education and Care (CHC50121)', org: 'Box Hill Institute', dates: '2018' },
          { role: 'Provide First Aid in an education and care setting (HLTAID012)', org: 'St John Ambulance', dates: '2024' },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Grace Hill' },
      { cat: 'phone', value: '+61 8 9123 4567' },
      { cat: 'email', value: 'gracehill.ece@outlook.com' },
      { cat: 'address', value: '14 Banksia Way' },
      { cat: 'address', value: 'Joondalup WA 6027' },
      { cat: 'registration', value: 'WWC Card 1234567', note: 'Working with Children Check' },
    ],
    keep: ['Goodstart Early Learning Joondalup', 'Only About Children Box Hill', 'Box Hill Institute', 'St John Ambulance', 'EYLF', 'NQS', 'CHC50121', 'HLTAID012', 'Storypark'],
  },

  /* ── 22 ── Real estate · United States ────────────────────────────────── */
  {
    id: 'us-real-estate-agent',
    career: 'Real Estate Agent',
    sector: 'Sales / Real Estate',
    country: 'United States',
    layout: 'sidebar',
    account: { fullName: 'Sarah Mitchell', email: 'sarah@sarahmitchellhomes.com', phone: '512.555.0198' },
    cv: {
      name: 'Sarah Mitchell',
      title: 'REALTOR® · TREC License #0654321',
      contacts: [
        { label: 'Phone', value: '512.555.0198' },
        { label: 'Email', value: 'sarah@sarahmitchellhomes.com' },
        { label: 'Web', value: 'www.sarahmitchellhomes.com' },
        { label: 'Facebook', value: 'facebook.com/sarahmitchellrealtor' },
        { label: 'Instagram', value: '@sarahsellsaustin' },
      ],
      address: ['1204 Barton Springs Rd', 'Austin, TX 78704'],
      sections: [
        { h: 'Summary', p: 'Top-producing agent with $12M in closed sales volume in 2023 and a 4.9-star Zillow Premier Agent rating across 140 reviews.' },
        { h: 'Experience', jobs: [
          { role: 'Real Estate Agent', org: 'Keller Williams Realty Austin Southwest', place: 'Austin, TX', dates: '2018 – Present', bullets: [
            'Closed 38 transactions in 2023; 62% from repeat and referral clients.',
            'Average days on market 11 vs 34 across the MLS.',
          ] },
          { role: 'Leasing Consultant', org: 'Greystar', place: 'Austin, TX', dates: '2015 – 2018', bullets: ['Leased 300+ units per year at a 96% occupancy community.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'BBA, Marketing', org: 'The University of Texas at Austin', dates: '2015' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Sarah Mitchell' },
      { cat: 'registration', value: '0654321', note: 'TREC licence number' },
      { cat: 'phone', value: '512.555.0198' },
      { cat: 'email', value: 'sarah@sarahmitchellhomes.com' },
      { cat: 'url', value: 'www.sarahmitchellhomes.com' },
      { cat: 'url', value: 'facebook.com/sarahmitchellrealtor' },
      { cat: 'url', value: '@sarahsellsaustin', note: 'bare Instagram handle' },
      { cat: 'address', value: '1204 Barton Springs Rd' },
      { cat: 'address', value: 'TX 78704', note: 'ZIP code' },
    ],
    keep: ['Keller Williams Realty Austin Southwest', 'Greystar', 'The University of Texas at Austin', 'Zillow Premier Agent', '$12M', 'MLS', '38 transactions'],
  },

  /* ── 23 ── Music · Ireland ────────────────────────────────────────────── */
  {
    id: 'ie-musician-music-teacher',
    career: 'Musician & Music Teacher',
    sector: 'Arts & Music',
    country: 'Ireland',
    layout: 'classic',
    account: { fullName: "Siobhan O'Sullivan", email: 'siobhan.osullivan.music@gmail.com', phone: '+353 87 123 4567' },
    cv: {
      name: 'Siobhán O’Sullivan',
      title: 'Pianist · Piano & Theory Teacher',
      contacts: [
        { value: '+353 87 123 4567' },
        { value: 'siobhan.osullivan.music@gmail.com' },
        { value: 'soundcloud.com/siobhanosullivanmusic' },
        { value: 'youtube.com/@siobhanplays' },
      ],
      address: ['Apartment 7, 21 Harcourt Terrace, Dublin 2, D02 X285'],
      sections: [
        { h: 'Profile', p: 'Concert pianist and teacher with 10 years preparing students for RIAM and ABRSM exams through Grade 8 and diploma. Garda vetted.' },
        { h: 'Teaching', jobs: [
          { role: 'Piano Teacher', org: 'Royal Irish Academy of Music', place: 'Dublin', dates: '2017 – Present', bullets: [
            '28 students per week; 11 first-place finishes at Feis Ceoil since 2019.',
          ] },
          { role: 'Leaving Certificate Music Teacher', org: 'Loreto College St Stephen’s Green', place: 'Dublin', dates: '2015 – 2017' },
        ] },
        { h: 'Performance', list: ['Guest soloist, RTÉ Concert Orchestra (2022)', 'Lunchtime recital series, National Concert Hall'] },
        { h: 'Education', jobs: [{ role: 'MA Music Performance', org: 'TU Dublin Conservatory of Music and Drama', dates: '2015' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Siobhán O’Sullivan', note: 'fada and curly apostrophe on the CV, neither on the account' },
      { cat: 'phone', value: '+353 87 123 4567' },
      { cat: 'email', value: 'siobhan.osullivan.music@gmail.com' },
      { cat: 'url', value: 'soundcloud.com/siobhanosullivanmusic' },
      { cat: 'url', value: 'youtube.com/@siobhanplays' },
      { cat: 'address', value: '21 Harcourt Terrace' },
      { cat: 'address', value: 'D02 X285', note: 'Eircode' },
    ],
    keep: ['Royal Irish Academy of Music', 'ABRSM', 'Feis Ceoil', 'RTÉ Concert Orchestra', 'National Concert Hall', 'TU Dublin Conservatory of Music and Drama', 'Grade 8'],
  },

  /* ── 24 ── Trades · South Africa ──────────────────────────────────────── */
  {
    id: 'za-diesel-mechanic',
    career: 'Diesel Mechanic',
    sector: 'Automotive / Heavy Equipment',
    country: 'South Africa',
    layout: 'table-header',
    account: { fullName: 'Thabo Mokoena', email: 'thabo.mokoena.diesel@gmail.com', phone: '082 123 4567' },
    cv: {
      name: 'Thabo Mokoena',
      title: 'Qualified Diesel Mechanic (Red Seal)',
      contacts: [
        { label: 'Cell', value: '082 123 4567' },
        { label: 'Tel', value: '+27 11 555 0123' },
        { label: 'Email', value: 'thabo.mokoena.diesel@gmail.com' },
      ],
      address: ['23 Jan Smuts Avenue, Parktown, Johannesburg, 2193'],
      sections: [
        { h: 'Personal Details', kv: [
          ['ID Number', '9001015009087'],
          ["Driver's Licence", 'Code EC (C1)'],
          ['Languages', 'English, isiZulu, Sesotho'],
        ] },
        { h: 'Experience', jobs: [
          { role: 'Diesel Mechanic', org: 'Barloworld Equipment', place: 'Isando', dates: '2017 – Present', bullets: [
            'Service and overhaul of Caterpillar 777 haul trucks and D10 dozers for mining clients.',
            'Cut average breakdown turnaround from 36 to 20 hours.',
          ] },
          { role: 'Apprentice Diesel Mechanic', org: 'Sasol Mining', place: 'Secunda', dates: '2013 – 2017' },
        ] },
        { h: 'Qualifications', list: ['Red Seal Trade Test — Diesel Mechanic (2017)', 'N3 Motor Diesel, Ekurhuleni East TVET College', 'Caterpillar Service Technician Level II'] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Thabo Mokoena' },
      { cat: 'phone', value: '082 123 4567' },
      { cat: 'phone', value: '+27 11 555 0123' },
      { cat: 'email', value: 'thabo.mokoena.diesel@gmail.com' },
      { cat: 'address', value: '23 Jan Smuts Avenue' },
      { cat: 'address', value: 'Johannesburg, 2193' },
      { cat: 'gov-id', value: '9001015009087', note: 'SA ID number (encodes date of birth)' },
    ],
    keep: ['Barloworld Equipment', 'Sasol Mining', 'Caterpillar 777', 'Red Seal Trade Test', 'Ekurhuleni East TVET College', 'N3 Motor Diesel', '36 to 20 hours'],
  },

  /* ── 25 ── Allied health · Australia ──────────────────────────────────── */
  {
    id: 'au-physiotherapist',
    career: 'Physiotherapist',
    sector: 'Allied Health',
    country: 'Australia',
    layout: 'classic',
    account: { fullName: 'David Zhang', email: 'david.zhang.physio@gmail.com', phone: '+61 491 570 157' },
    cv: {
      name: 'ZHANG Wei (David)',
      title: 'Musculoskeletal Physiotherapist',
      contacts: [
        { label: 'Mobile', value: '+61 491 570 157' },
        { label: 'Email', value: 'david.zhang.physio@gmail.com' },
        { label: 'AHPRA', value: 'PHY0001987654' },
      ],
      address: ['Level 2, 88 George Street, Parramatta NSW 2150'],
      sections: [
        { h: 'Summary', p: 'Physiotherapist with 5 years in hospital and private musculoskeletal practice. Fluent in Mandarin; dry needling and clinical Pilates certified.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Physiotherapist', org: 'Westmead Hospital', place: 'Sydney', dates: '2021 – Present', bullets: ['Orthopaedic ward and outpatient fracture clinic.'] },
          { role: 'Physiotherapist', org: 'Back In Motion Parramatta', place: 'Parramatta', dates: '2019 – 2021', bullets: ['35 consults per week; sports and workplace injuries.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'Doctor of Physiotherapy', org: 'Macquarie University', dates: '2018' }] },
      ],
    },
    pii: [
      { cat: 'name', value: 'ZHANG Wei', note: 'surname-first with English name in brackets' },
      { cat: 'name', value: 'David', note: 'English name' },
      { cat: 'phone', value: '+61 491 570 157' },
      { cat: 'email', value: 'david.zhang.physio@gmail.com' },
      { cat: 'registration', value: 'PHY0001987654', note: 'AHPRA number' },
      { cat: 'address', value: '88 George Street' },
      { cat: 'address', value: 'Parramatta NSW 2150' },
    ],
    keep: ['Westmead Hospital', 'Back In Motion Parramatta', 'Macquarie University', 'Doctor of Physiotherapy', 'Mandarin', 'dry needling'],
  },

  /* ── 26 ── Hospitality · Australia (international student) ────────────── */
  {
    id: 'au-barista-cafe-supervisor',
    career: 'Barista / Café Supervisor',
    sector: 'Hospitality',
    country: 'Australia (from Colombia)',
    layout: 'modern-header',
    account: { fullName: 'Valentina Gomez', email: 'vale.gomez.r@gmail.com', phone: '0468 123 456' },
    cv: {
      name: 'Valentina Gómez Ramírez',
      title: 'Barista & Café Supervisor',
      contacts: [
        { icon: '☎', value: '0468 123 456' },
        { icon: '✉', value: 'vale.gomez.r@gmail.com' },
        { icon: '⌂', value: 'Apt 1203/555 Swanston Street, Carlton VIC 3053' },
      ],
      sections: [
        { h: 'About', p: 'Specialty coffee barista with 5 years across Bogotá and Melbourne. Student visa (subclass 500) — available 48 hours per fortnight and full-time in semester breaks.' },
        { h: 'Experience', jobs: [
          { role: 'Café Supervisor', org: 'Market Lane Coffee', place: 'Melbourne', dates: '2023 – Present', bullets: [
            'Run the floor on 600-cup mornings; trained 7 new baristas on La Marzocco and EK43.',
          ] },
          { role: 'Barista', org: 'Juan Valdez Café', place: 'Bogotá', dates: '2019 – 2022', bullets: ['Latte art competitions; Colombian single-origin tastings.'] },
        ] },
        { h: 'Education', jobs: [{ role: 'Master of Marketing (current)', org: 'RMIT University', dates: '2023 – 2025' }] },
        { h: 'Skills', list: ['Latte art', 'Square POS', 'RSA (Victoria)', 'Food Handler certificate', 'Spanish (native)'] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Valentina Gómez Ramírez', note: 'accents on the CV, none on the account' },
      { cat: 'phone', value: '0468 123 456' },
      { cat: 'email', value: 'vale.gomez.r@gmail.com' },
      { cat: 'address', value: '1203/555 Swanston Street' },
      { cat: 'address', value: 'Carlton VIC 3053' },
    ],
    keep: ['Market Lane Coffee', 'Juan Valdez Café', 'RMIT University', 'La Marzocco', 'Square POS', 'Latte art', 'Bogotá'],
  },
];

export const CATEGORY_LABELS = {
  name: 'Candidate name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  url: 'Profile URL / handle',
  'gov-id': 'Government ID',
  registration: 'Registration / licence no.',
  dob: 'Date of birth',
  family: "Parent's name",
  referee: 'Referee details',
  sensitive: 'Sensitive attributes',
};

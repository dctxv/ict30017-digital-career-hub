/**
 * Holdout set for the PII audit: 12 more fictional resumes, written AFTER the
 * mask was fixed against corpus.js, to measure whether the fixes generalise to
 * resumes the rules were never tuned on.
 *
 * Same shape and same rules as corpus.js — see its header. Every person,
 * number and address here is invented.
 */

export const HOLDOUT = [
  /* ── H1 ── Banking · Bangladesh ───────────────────────────────────────── */
  {
    id: 'bd-bank-officer',
    career: 'Senior Officer (Retail Banking)',
    sector: 'Banking',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    account: { fullName: 'Shuvo Kumar Saha', email: 'shuvo.saha.bank@gmail.com', phone: '01712000111' },
    cv: {
      name: 'Shuvo Kumar Saha',
      title: 'Senior Officer, Retail Banking',
      contacts: [
        { label: 'Cell', value: '+880-1712-000111' },
        { label: 'Alternate', value: '01712 000 222' },
        { label: 'E-mail', value: 'shuvo.saha.bank@gmail.com' },
      ],
      address: ['Mailing Address: Holding No. 12/A, Road No. 5, Block-B, Banani, Dhaka 1213'],
      sections: [
        { h: 'Career Objective', p: 'Seeking a challenging role in retail banking operations where I can grow deposits and serve customers with integrity.' },
        { h: 'Employment History', jobs: [
          { role: 'Senior Officer', org: 'BRAC Bank PLC', place: 'Gulshan Branch', dates: 'July 2019 – Present', bullets: [
            'Grew the branch SME deposit book by BDT 18 crore in 2023.',
            'KYC and AML reviews for 400+ accounts a year; zero audit exceptions.',
          ] },
          { role: 'Management Trainee Officer', org: 'Dutch-Bangla Bank Limited', place: 'Dhaka', dates: '2017 – 2019', bullets: ['Rotations through general banking, remittance and cards.'] },
        ] },
        { h: 'Educational Qualification', jobs: [
          { role: 'MBA (Finance), CGPA 3.65', org: 'University of Dhaka (IBA)', dates: '2017' },
          { role: 'BBA (Accounting)', org: 'Jagannath University', dates: '2015' },
        ] },
        { h: 'Personal Details', kv: [
          ["Father's Name", 'Late Haripada Saha'],
          ["Mother's Name", 'Anjali Rani Saha'],
          ["Spouse's Name", 'Mitu Rani Saha'],
          ['Date of Birth', '12th July 1992'],
          ['Smart Card No', '1234567890'],
          ['TIN', '123456789012'],
          ['Religion', 'Hinduism'],
          ['Blood Group', 'AB-'],
          ['Nationality', 'Bangladeshi'],
        ] },
        { h: 'References', refs: [
          { name: 'Mr. Tanvir Ahmed', role: 'Branch Manager', org: 'BRAC Bank PLC, Gulshan', contact: ['Phone: +880 1713-445566', 'tanvir.ahmed@bracbank.com'] },
          { name: 'Dr. Farhana Islam', role: 'Associate Professor, IBA', org: 'University of Dhaka', contact: ['Mobile: 01819-778899'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Shuvo Kumar Saha' },
      { cat: 'phone', value: '+880-1712-000111' },
      { cat: 'phone', value: '01712 000 222', note: '5-3-3 grouping' },
      { cat: 'email', value: 'shuvo.saha.bank@gmail.com' },
      { cat: 'address', value: 'Holding No. 12/A, Road No. 5, Block-B' },
      { cat: 'address', value: 'Dhaka 1213', note: 'postcode without a dash' },
      { cat: 'family', value: 'Haripada Saha' },
      { cat: 'family', value: 'Anjali Rani Saha' },
      { cat: 'family', value: 'Mitu Rani Saha', note: 'spouse' },
      { cat: 'dob', value: '12th July 1992' },
      { cat: 'gov-id', value: '1234567890', note: 'smart NID' },
      { cat: 'gov-id', value: '123456789012', note: 'TIN' },
      { cat: 'sensitive', value: 'Religion Hinduism' },
      { cat: 'sensitive', value: 'Blood Group AB' },
      { cat: 'referee', value: 'Tanvir Ahmed' },
      { cat: 'referee', value: '+880 1713-445566' },
      { cat: 'referee', value: 'tanvir.ahmed@bracbank.com' },
      { cat: 'referee', value: 'Farhana Islam' },
      { cat: 'referee', value: '01819-778899' },
    ],
    keep: ['BRAC Bank PLC', 'Dutch-Bangla Bank Limited', 'University of Dhaka (IBA)', 'Jagannath University', 'BDT 18 crore', 'KYC and AML', 'Gulshan Branch', 'Management Trainee Officer'],
  },

  /* ── H2 ── Trades · Pakistan ──────────────────────────────────────────── */
  {
    id: 'pk-electrical-technician',
    career: 'Electrical Technician',
    sector: 'Trades',
    country: 'Pakistan',
    layout: 'table-header',
    account: { fullName: 'Muhammad Usman Tariq', email: 'usman.tariq.elec@gmail.com', phone: '+923001234567' },
    cv: {
      name: 'Muhammad Usman Tariq',
      title: 'Electrical Technician (DAE Electrical)',
      contacts: [
        { label: 'Mobile', value: '0300-1234567' },
        { label: 'WhatsApp', value: '+92 321 7654321' },
        { label: 'Email', value: 'usman.tariq.elec@gmail.com' },
      ],
      address: ['House No. 45, Street 12, G-9/2, Islamabad'],
      sections: [
        { h: 'Objective', p: 'Electrical technician with 6 years of industrial maintenance, seeking a position in Saudi Arabia or the UAE.' },
        { h: 'Experience', jobs: [
          { role: 'Maintenance Technician', org: 'Fauji Fertilizer Company', place: 'Goth Machhi', dates: '2020 – Present', bullets: [
            'Preventive maintenance of 11 kV switchgear, MCCs and VFDs.',
            'Cut unplanned motor downtime 30% with a thermography programme.',
          ] },
          { role: 'Electrician', org: 'K-Electric', place: 'Karachi', dates: '2017 – 2020' },
        ] },
        { h: 'Education', jobs: [{ role: 'DAE Electrical Technology', org: 'Government College of Technology, Rawalpindi', dates: '2017' }] },
        { h: 'Personal Information', kv: [
          ['Father Name', 'Tariq Mehmood'],
          ['CNIC', '35202-1234567-1'],
          ['Date of Birth', '05/04/1995'],
          ['Domicile', 'Punjab'],
          ['Passport No', 'AB1234567'],
          ['Marital Status', 'Single'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Muhammad Usman Tariq' },
      { cat: 'phone', value: '0300-1234567' },
      { cat: 'phone', value: '+92 321 7654321' },
      { cat: 'email', value: 'usman.tariq.elec@gmail.com' },
      { cat: 'address', value: 'House No. 45, Street 12' },
      { cat: 'address', value: 'G-9/2', note: 'Islamabad sector' },
      { cat: 'family', value: 'Tariq Mehmood' },
      { cat: 'gov-id', value: '35202-1234567-1', note: 'CNIC' },
      { cat: 'dob', value: '05/04/1995' },
      { cat: 'gov-id', value: 'AB1234567', note: 'passport number' },
      { cat: 'sensitive', value: 'Marital Status Single' },
      { cat: 'sensitive', value: 'Domicile Punjab' },
    ],
    keep: ['Fauji Fertilizer Company', 'K-Electric', 'Government College of Technology, Rawalpindi', '11 kV switchgear', 'VFDs', 'DAE Electrical Technology', 'thermography'],
  },

  /* ── H3 ── Community health · Kenya ───────────────────────────────────── */
  {
    id: 'ke-community-health-worker',
    career: 'Community Health Promoter',
    sector: 'Public Health',
    country: 'Kenya',
    layout: 'classic',
    account: { fullName: 'Wanjiku Kamau', email: 'wanjiku.kamau.chp@gmail.com', phone: '0712345678' },
    cv: {
      name: 'Grace Wanjiku Kamau',
      title: 'Community Health Promoter',
      contacts: [
        { value: '+254 712 345 678' },
        { value: 'wanjiku.kamau.chp@gmail.com' },
        { value: 'P.O. Box 1234-00100, Nairobi' },
      ],
      sections: [
        { h: 'Profile', p: 'Community health promoter with 5 years of household visits, maternal health follow-up and TB contact tracing in Kibera.' },
        { h: 'Experience', jobs: [
          { role: 'Community Health Promoter', org: 'Amref Health Africa', place: 'Nairobi', dates: '2020 – Present', bullets: [
            'Follow up 120 households a month; raised facility deliveries in my unit from 61% to 84%.',
            'Trained 15 new promoters on the eCHIS mobile app.',
          ] },
          { role: 'Volunteer', org: 'Kenya Red Cross Society', dates: '2018 – 2020' },
        ] },
        { h: 'Education', jobs: [{ role: 'Certificate in Community Health', org: 'Kenya Medical Training College', dates: '2019' }] },
        { h: 'Personal Details', kv: [
          ['ID No.', '23456789'],
          ['KRA PIN', 'A012345678Z'],
          ['Date of Birth', '3 March 1996'],
          ['Languages', 'English, Kiswahili, Kikuyu'],
        ] },
        { h: 'Referees', refs: [
          { name: 'Dr. Peter Otieno', role: 'Programme Manager', org: 'Amref Health Africa', contact: ['0722 111 222', 'p.otieno@amref.org'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Grace Wanjiku Kamau' },
      { cat: 'phone', value: '+254 712 345 678' },
      { cat: 'email', value: 'wanjiku.kamau.chp@gmail.com' },
      { cat: 'address', value: 'P.O. Box 1234-00100', note: 'postal box' },
      { cat: 'gov-id', value: '23456789', note: 'national ID' },
      { cat: 'gov-id', value: 'A012345678Z', note: 'KRA PIN' },
      { cat: 'dob', value: '3 March 1996' },
      { cat: 'referee', value: 'Peter Otieno' },
      { cat: 'referee', value: '0722 111 222' },
      { cat: 'referee', value: 'p.otieno@amref.org' },
    ],
    keep: ['Amref Health Africa', 'Kenya Red Cross Society', 'Kenya Medical Training College', 'eCHIS', 'Kibera', '61% to 84%', 'Kiswahili'],
  },

  /* ── H4 ── Early education · Malaysia ─────────────────────────────────── */
  {
    id: 'my-kindergarten-teacher',
    career: 'Kindergarten Teacher',
    sector: 'Education',
    country: 'Malaysia',
    layout: 'sidebar',
    account: { fullName: 'Nur Aisyah Binti Rahman', email: 'aisyah.rahman.edu@gmail.com', phone: '012-345 6789' },
    cv: {
      name: 'Nur Aisyah Binti Rahman',
      title: 'Kindergarten Teacher',
      contacts: [
        { label: 'Phone', value: '012-345 6789' },
        { label: 'Email', value: 'aisyah.rahman.edu@gmail.com' },
      ],
      address: ['No. 12, Jalan Bukit Bintang 3/4', 'Taman Maluri, 55100 Kuala Lumpur'],
      sections: [
        { h: 'Summary', p: 'Early childhood teacher with 7 years in play-based preschool programmes and parent engagement.' },
        { h: 'Experience', jobs: [
          { role: 'Lead Teacher', org: 'Tadika Kristal Ceria', place: 'Kuala Lumpur', dates: '2019 – Present', bullets: [
            'Designed the bilingual literacy programme now used across 3 branches.',
          ] },
          { role: 'Assistant Teacher', org: 'Q-dees Global Pte Ltd', place: 'Petaling Jaya', dates: '2016 – 2019' },
        ] },
        { h: 'Education', jobs: [{ role: 'Diploma in Early Childhood Education', org: 'SEGi University', dates: '2016' }] },
        { h: 'Personal', kv: [
          ['IC No', '900101-14-5678'],
          ['Date of Birth', '1 January 1990'],
          ['Race', 'Malay'],
          ['Religion', 'Islam'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Nur Aisyah Binti Rahman' },
      { cat: 'phone', value: '012-345 6789' },
      { cat: 'email', value: 'aisyah.rahman.edu@gmail.com' },
      { cat: 'address', value: 'No. 12, Jalan Bukit Bintang 3/4' },
      { cat: 'address', value: '55100 Kuala Lumpur' },
      { cat: 'gov-id', value: '900101-14-5678', note: 'MyKad (encodes date of birth)' },
      { cat: 'dob', value: '1 January 1990' },
      { cat: 'sensitive', value: 'Race Malay' },
      { cat: 'sensitive', value: 'Religion Islam' },
    ],
    keep: ['Tadika Kristal Ceria', 'Q-dees Global Pte Ltd', 'SEGi University', 'Diploma in Early Childhood Education', 'bilingual literacy programme', 'Petaling Jaya'],
  },

  /* ── H5 ── Nursing · Germany ──────────────────────────────────────────── */
  {
    id: 'de-geriatric-nurse',
    career: 'Geriatric Nurse (Altenpflegerin)',
    sector: 'Healthcare',
    country: 'Germany',
    layout: 'classic',
    account: { fullName: 'Katarina Müller', email: 'k.mueller.pflege@web.de', phone: '+49 151 23456789' },
    cv: {
      name: 'Katarina Müller',
      title: 'Examined Geriatric Nurse',
      contacts: [
        { value: 'Musterstraße 12, 10115 Berlin' },
        { value: '+49 151 23456789' },
        { value: 'k.mueller.pflege@web.de' },
      ],
      sections: [
        { h: 'Profile', p: 'Registered geriatric nurse with 8 years in residential and palliative care. Applying for roles in the UK and Ireland (NMC application in progress).' },
        { h: 'Experience', jobs: [
          { role: 'Shift Lead, Geriatric Nursing', org: 'Vivantes Hauptstadtpflege', place: 'Berlin', dates: '2018 – Present', bullets: [
            'Lead a team of 9 on a 36-bed dementia unit; wound care champion.',
          ] },
          { role: 'Geriatric Nurse', org: 'Caritas Seniorenzentrum', place: 'Potsdam', dates: '2015 – 2018' },
        ] },
        { h: 'Education', jobs: [{ role: 'State Examination, Geriatric Nursing', org: 'Evangelische Pflegeakademie Berlin', dates: '2015' }] },
        { h: 'Personal Details', kv: [
          ['Date of birth', '12.03.1990'],
          ['Place of birth', 'Leipzig'],
          ['Nationality', 'German'],
          ['Marital status', 'Married, 2 children'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Katarina Müller' },
      { cat: 'address', value: 'Musterstraße 12' },
      { cat: 'address', value: '10115 Berlin' },
      { cat: 'phone', value: '+49 151 23456789' },
      { cat: 'email', value: 'k.mueller.pflege@web.de' },
      { cat: 'dob', value: '12.03.1990' },
      { cat: 'sensitive', value: 'Place of birth Leipzig' },
      { cat: 'sensitive', value: 'Married, 2 children' },
    ],
    keep: ['Vivantes Hauptstadtpflege', 'Caritas Seniorenzentrum', 'Evangelische Pflegeakademie Berlin', 'NMC application', '36-bed dementia unit', 'Potsdam'],
  },

  /* ── H6 ── Logistics · United States ──────────────────────────────────── */
  {
    id: 'us-warehouse-supervisor',
    career: 'Warehouse Shift Supervisor',
    sector: 'Logistics',
    country: 'United States',
    layout: 'modern-header',
    account: { fullName: 'Marcus Johnson', email: 'marcus.j.logistics@gmail.com', phone: '(773) 555-0123' },
    cv: {
      name: 'Marcus Johnson',
      title: 'Warehouse Shift Supervisor',
      contacts: [
        { icon: '☎', value: '(773) 555-0123' },
        { icon: '✉', value: 'marcus.j.logistics@gmail.com' },
        { icon: '⌂', value: '4417 N Broadway Ave Apt 3, Chicago, IL 60640' },
        { icon: '◆', value: 'linkedin.com/in/marcusjohnsonops' },
      ],
      sections: [
        { h: 'Summary', p: 'Night-shift supervisor with 9 years in high-volume fulfilment. OSHA 30 card #12345678. Certified forklift trainer.' },
        { h: 'Experience', jobs: [
          { role: 'Shift Supervisor', org: 'Amazon Fulfillment Center MDW2', place: 'Joliet, IL', dates: '2019 – Present', bullets: [
            'Lead 85 associates; raised units per hour 14% while cutting recordable injuries to zero in 2023.',
          ] },
          { role: 'Forklift Operator → Lead', org: 'Target Distribution Center', place: 'Chicago, IL', dates: '2015 – 2019' },
        ] },
        { h: 'Education', jobs: [{ role: 'A.A.S. Supply Chain Management', org: 'Harold Washington College', dates: '2015' }] },
        { h: 'References', p: 'Available on request.' },
      ],
    },
    pii: [
      { cat: 'name', value: 'Marcus Johnson' },
      { cat: 'phone', value: '(773) 555-0123' },
      { cat: 'email', value: 'marcus.j.logistics@gmail.com' },
      { cat: 'address', value: '4417 N Broadway Ave' },
      { cat: 'address', value: 'Apt 3' },
      { cat: 'address', value: 'IL 60640' },
      { cat: 'url', value: 'linkedin.com/in/marcusjohnsonops' },
      { cat: 'registration', value: '12345678', note: 'OSHA card number' },
    ],
    keep: ['Amazon Fulfillment Center MDW2', 'Target Distribution Center', 'Harold Washington College', 'OSHA 30', 'units per hour 14%', 'Joliet, IL', 'Available on request'],
  },

  /* ── H7 ── Aviation · UAE ─────────────────────────────────────────────── */
  {
    id: 'ae-flight-attendant',
    career: 'Cabin Crew (Flight Attendant)',
    sector: 'Aviation / Hospitality',
    country: 'United Arab Emirates',
    layout: 'table-header',
    account: { fullName: 'Angelica Reyes', email: 'angelica.reyes.crew@gmail.com', phone: '+971501234567' },
    cv: {
      name: 'Angelica Mae Reyes',
      title: 'Senior Cabin Crew',
      contacts: [
        { label: 'Mobile', value: '+971 50 123 4567' },
        { label: 'Alt', value: '050 765 4321' },
        { label: 'Email', value: 'angelica.reyes.crew@gmail.com' },
      ],
      address: ['Flat 1204, Al Nahda Tower 2, Al Nahda, Dubai'],
      sections: [
        { h: 'Profile', p: 'Senior cabin crew with 6 years on A380 and B777 long-haul, fluent in English, Filipino and conversational Arabic.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Flight Attendant', org: 'Emirates', place: 'Dubai', dates: '2019 – Present', bullets: [
            'Purser-in-charge on 120+ long-haul sectors; commended for inflight medical response.',
          ] },
          { role: 'Flight Attendant', org: 'Cebu Pacific', place: 'Manila', dates: '2017 – 2019' },
        ] },
        { h: 'Personal Particulars', kv: [
          ['Nationality', 'Filipino'],
          ['Emirates ID', '784-1990-1234567-1'],
          ['Passport', 'P1234567A'],
          ['Date of Birth', '14 Feb 1994'],
          ['Height', '165 cm'],
          ['Arm reach', '212 cm'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Angelica Mae Reyes' },
      { cat: 'phone', value: '+971 50 123 4567' },
      { cat: 'phone', value: '050 765 4321' },
      { cat: 'email', value: 'angelica.reyes.crew@gmail.com' },
      { cat: 'address', value: 'Flat 1204, Al Nahda Tower 2' },
      { cat: 'gov-id', value: '784-1990-1234567-1', note: 'Emirates ID' },
      { cat: 'gov-id', value: 'P1234567A', note: 'passport number' },
      { cat: 'dob', value: '14 Feb 1994' },
      { cat: 'sensitive', value: 'Height 165 cm' },
      { cat: 'sensitive', value: 'Arm reach 212 cm', note: 'body measurement' },
    ],
    keep: ['Emirates', 'Cebu Pacific', 'A380 and B777', 'Purser-in-charge', 'conversational Arabic', '120+ long-haul sectors'],
  },

  /* ── H8 ── Hospitality · Sri Lanka ────────────────────────────────────── */
  {
    id: 'lk-hotel-chef',
    career: 'Chef de Partie',
    sector: 'Hospitality',
    country: 'Sri Lanka',
    layout: 'bd-traditional',
    account: { fullName: 'Kasun Perera', email: 'kasun.perera.chef@gmail.com', phone: '0771234567' },
    cv: {
      name: 'W. A. Kasun Perera',
      title: 'Chef de Partie',
      contacts: [
        { label: 'Mobile', value: '+94 77 123 4567' },
        { label: 'Home', value: '011 234 5678' },
        { label: 'Email', value: 'kasun.perera.chef@gmail.com' },
      ],
      address: ['Address: No. 45/2, Galle Road, Colombo 03'],
      sections: [
        { h: 'Objective', p: 'Chef de partie with 7 years in five-star hotel kitchens, seeking a sous chef role in the Maldives or the Gulf.' },
        { h: 'Experience', jobs: [
          { role: 'Chef de Partie (Pastry)', org: 'Shangri-La Colombo', place: 'Colombo', dates: '2019 – Present', bullets: [
            'Run the pastry section for 3 outlets and 900 banquet covers.',
          ] },
          { role: 'Commis Chef', org: 'Cinnamon Grand', place: 'Colombo', dates: '2016 – 2019' },
        ] },
        { h: 'Education', jobs: [{ role: 'NVQ Level 4, Professional Cookery', org: 'Sri Lanka Institute of Tourism and Hotel Management', dates: '2016' }] },
        { h: 'Personal Details', kv: [
          ['NIC No', '901234567V'],
          ['Date of Birth', '1990-05-02'],
          ['Gender', 'Male'],
          ['Civil Status', 'Married'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Kasun Perera' },
      { cat: 'phone', value: '+94 77 123 4567' },
      { cat: 'phone', value: '011 234 5678' },
      { cat: 'email', value: 'kasun.perera.chef@gmail.com' },
      { cat: 'address', value: 'No. 45/2, Galle Road' },
      { cat: 'gov-id', value: '901234567V', note: 'old-format NIC' },
      { cat: 'dob', value: '1990-05-02' },
      { cat: 'sensitive', value: 'Civil Status Married' },
      { cat: 'sensitive', value: 'Gender Male' },
    ],
    keep: ['Shangri-La Colombo', 'Cinnamon Grand', 'Sri Lanka Institute of Tourism and Hotel Management', 'NVQ Level 4', '900 banquet covers', 'Chef de Partie (Pastry)'],
  },

  /* ── H9 ── Manufacturing · Vietnam ────────────────────────────────────── */
  {
    id: 'vn-garment-qc-inspector',
    career: 'Quality Control Inspector (Garments)',
    sector: 'Manufacturing',
    country: 'Vietnam',
    layout: 'sidebar',
    account: { fullName: 'Nguyen Thi Lan', email: 'lan.nguyen.qc@gmail.com', phone: '0912345678' },
    cv: {
      name: 'Nguyễn Thị Lan',
      title: 'QC Inspector',
      contacts: [
        { label: 'Phone', value: '+84 912 345 678' },
        { label: 'Email', value: 'lan.nguyen.qc@gmail.com' },
      ],
      address: ['Số 12, đường Nguyễn Trãi', 'Quận 1, TP. Hồ Chí Minh'],
      sections: [
        { h: 'Summary', p: 'QC inspector with 6 years of inline and final inspection for EU and US sportswear buyers.' },
        { h: 'Experience', jobs: [
          { role: 'Final QC Inspector', org: 'Việt Tiến Garment Corporation', place: 'Ho Chi Minh City', dates: '2019 – Present', bullets: [
            'AQL 2.5 final audits for Decathlon and Nike; cut returned lots from 4% to 0.8%.',
          ] },
          { role: 'Inline QC', org: 'Nhà Bè Garment', dates: '2017 – 2019' },
        ] },
        { h: 'Personal Information', kv: [
          ['CCCD', '079123456789'],
          ['Date of Birth', '20/10/1995'],
          ['Gender', 'Female'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Nguyễn Thị Lan', note: 'account stored without diacritics' },
      { cat: 'phone', value: '+84 912 345 678' },
      { cat: 'email', value: 'lan.nguyen.qc@gmail.com' },
      { cat: 'address', value: 'Số 12, đường Nguyễn Trãi', note: 'Vietnamese street address' },
      { cat: 'address', value: 'Quận 1' },
      { cat: 'gov-id', value: '079123456789', note: 'citizen ID' },
      { cat: 'dob', value: '20/10/1995' },
      { cat: 'sensitive', value: 'Gender Female' },
    ],
    keep: ['Việt Tiến Garment Corporation', 'Nhà Bè Garment', 'Decathlon and Nike', 'AQL 2.5', '4% to 0.8%', 'Ho Chi Minh City'],
  },

  /* ── H10 ── Trades · Australia ────────────────────────────────────────── */
  {
    id: 'au-plumber',
    career: 'Licensed Plumber & Gasfitter',
    sector: 'Trades',
    country: 'Australia',
    layout: 'table-header',
    account: { fullName: 'Jack Thompson', email: 'jack@thompsonplumbing.com.au', phone: '0412 345 678' },
    cv: {
      name: 'Jack Thompson',
      title: 'Licensed Plumber & Gasfitter',
      contacts: [
        { label: 'Mobile', value: '0412 345 678' },
        { label: 'Email', value: 'jack@thompsonplumbing.com.au' },
        { label: 'ABN', value: '12 345 678 901' },
      ],
      address: ['Unit 5, 17-19 Smith Street, Collingwood VIC 3066'],
      sections: [
        { h: 'Summary', p: 'Plumber and gasfitter with 12 years across residential, commercial fit-outs and emergency call-outs. VBA Licence No. L12345.' },
        { h: 'Experience', jobs: [
          { role: 'Owner / Plumber', org: 'Thompson Plumbing (sole trader)', place: 'Melbourne', dates: '2017 – Present', bullets: [
            '600+ jobs a year; 4.9 stars across 210 Google reviews.',
          ] },
          { role: 'Plumber', org: 'Metropolitan Plumbing Services', place: 'Melbourne', dates: '2012 – 2017' },
        ] },
        { h: 'Training', jobs: [{ role: 'Certificate III in Plumbing (CPC32420)', org: 'Holmesglen Institute', dates: '2012' }] },
        { h: 'Referees', refs: [
          { name: 'Paul Nguyen', role: 'Site Manager', org: 'Hansen Yuncken', contact: ['0423 987 654'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Jack Thompson' },
      { cat: 'phone', value: '0412 345 678' },
      { cat: 'email', value: 'jack@thompsonplumbing.com.au' },
      { cat: 'gov-id', value: '12 345 678 901', note: 'ABN of a sole trader' },
      { cat: 'address', value: '17-19 Smith Street' },
      { cat: 'address', value: 'Collingwood VIC 3066' },
      { cat: 'registration', value: 'L12345', note: 'VBA licence' },
      { cat: 'referee', value: 'Paul Nguyen' },
      { cat: 'referee', value: '0423 987 654' },
    ],
    keep: ['Metropolitan Plumbing Services', 'Hansen Yuncken', 'Holmesglen Institute', 'CPC32420', 'Certificate III in Plumbing', '210 Google reviews'],
  },

  /* ── H11 ── Tourism · Nepal ───────────────────────────────────────────── */
  {
    id: 'np-trekking-guide',
    career: 'Trekking Guide',
    sector: 'Tourism',
    country: 'Nepal',
    layout: 'modern-header',
    account: { fullName: 'Pemba Sherpa', email: 'pemba.sherpa.treks@gmail.com', phone: '+977 9841234567' },
    cv: {
      name: 'Pemba Tenzing Sherpa',
      title: 'Licensed Trekking Guide',
      contacts: [
        { icon: '☎', value: '+977 9841234567' },
        { icon: '✉', value: 'pemba.sherpa.treks@gmail.com' },
        { icon: '⌂', value: 'Ward No. 7, Thamel, Kathmandu' },
      ],
      sections: [
        { h: 'Profile', p: 'Government-licensed trekking guide (Licence TGL-1234) with 10 years on the Everest, Annapurna and Manaslu circuits. Wilderness First Responder.' },
        { h: 'Experience', jobs: [
          { role: 'Lead Guide', org: 'Himalayan Glacier Trekking', place: 'Kathmandu', dates: '2016 – Present', bullets: [
            'Led 140 groups; zero serious incidents; 5-star rating on TripAdvisor.',
          ] },
        ] },
        { h: 'Documents', kv: [
          ['Citizenship No', '12-01-73-01234'],
          ['Date of Birth', '2045-06-15 BS'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Pemba Tenzing Sherpa' },
      { cat: 'phone', value: '+977 9841234567' },
      { cat: 'email', value: 'pemba.sherpa.treks@gmail.com' },
      { cat: 'address', value: 'Ward No. 7, Thamel' },
      { cat: 'registration', value: 'TGL-1234', note: 'guide licence' },
      { cat: 'gov-id', value: '12-01-73-01234', note: 'citizenship certificate' },
      { cat: 'dob', value: '2045-06-15 BS', note: 'Bikram Sambat date' },
    ],
    keep: ['Himalayan Glacier Trekking', 'Everest, Annapurna and Manaslu', 'Wilderness First Responder', 'TripAdvisor', '140 groups'],
  },

  /* ── H12 ── Tailoring · Bangladesh (Bangla-script) ────────────────────── */
  {
    id: 'bd-tailor-bangla',
    career: 'Tailor / Sewing Machine Operator',
    sector: 'Manufacturing / RMG',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    lang: 'bn',
    account: { fullName: 'Rina Akter', email: '', phone: '01912345678' },
    cv: {
      name: 'রিনা আক্তার',
      title: 'সেলাই মেশিন অপারেটর',
      contacts: [
        { label: 'মোবাইল নং', value: '০১৯১২-৩৪৫৬৭৮' },
      ],
      address: ['স্থায়ী ঠিকানা: গ্রাম: চরপাড়া, ডাকঘর: কালিহাতী, উপজেলা: কালিহাতী, জেলা: টাঙ্গাইল'],
      sections: [
        { h: 'অভিজ্ঞতা', jobs: [
          { role: 'সিনিয়র অপারেটর', org: 'স্কয়ার ফ্যাশনস লিমিটেড', dates: '২০১৮ – বর্তমান', bullets: ['দৈনিক লক্ষ্যমাত্রার ১১০% উৎপাদন।'] },
        ] },
        { h: 'ব্যক্তিগত তথ্য', kv: [
          ['পিতার নাম', 'আব্দুর রশিদ'],
          ['স্বামীর নাম', 'জাহিদ হাসান'],
          ['জন্ম তারিখ', '০৫/০৮/১৯৯৬'],
          ['জাতীয় পরিচয়পত্র নম্বর', '৫১০২৯৩৮৪৭৫'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'রিনা আক্তার' },
      { cat: 'name', value: 'রিনা', note: 'first name; the surname\'s conjunct is not in the PDF text layer' },
      { cat: 'phone', value: '০১৯১২-৩৪৫৬৭৮' },
      { cat: 'address', value: 'চরপাড়া', note: 'village' },
      { cat: 'address', value: 'ডাকঘর: কালিহাতী', note: 'post office' },
      { cat: 'address', value: 'উপজেলা: কালিহাতী', note: 'upazila' },
      { cat: 'address', value: 'টাাইল', note: 'Tangail (district), as the PDF text layer holds it' },
      { cat: 'address', value: 'টাঙ্গাইল', note: 'Tangail (district), as the DOCX holds it' },
      { cat: 'family', value: 'আব্দুর রশিদ' },
      { cat: 'family', value: 'জাহিদ হাসান', note: 'husband' },
      { cat: 'dob', value: '০৫/০৮/১৯৯৬' },
      { cat: 'gov-id', value: '৫১০২৯৩৮৪৭৫' },
    ],
    // Only what this file's text layer holds intact (see F8): the conjunct in
    // 'স্কয়ার ফ্যাশনস' has no Unicode mapping in the PDF.
    keep: ['লিমিটেড', 'সিনিয়র অপারেটর', 'উৎপাদন', '১১০%'],
  },
];

/**
 * Second holdout, Bangladesh only (the product's market): six more resumes in
 * the formats Bangladeshi candidates actually send, written after the mask had
 * reached 100% on everything above.
 */
export const HOLDOUT_BD = [
  /* ── B1 ── BDJobs export format ───────────────────────────────────────── */
  {
    id: 'bd-bdjobs-merchandiser',
    career: 'Merchandiser (Garments), BDJobs format',
    sector: 'Manufacturing / RMG',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    account: { fullName: 'Nazmul Hasan', email: 'nazmul.hasan.merch@gmail.com', phone: '01911223344' },
    cv: {
      name: 'Md. Nazmul Hasan Rony',
      title: '',
      contacts: [
        { label: 'Address', value: 'Road-4, House-21, Sector-11, Uttara, Dhaka' },
        { label: 'Home Phone', value: '02-8950123' },
        { label: 'Mobile No 1', value: '01911-223344' },
        { label: 'Mobile No 2', value: '01674-556677' },
        { label: 'e-mail', value: 'nazmul.hasan.merch@gmail.com' },
      ],
      sections: [
        { h: 'Career Objective:', p: 'To work as a merchandiser in a reputed export-oriented garment company and grow with it.' },
        { h: 'Employment History:', jobs: [
          { role: 'Assistant Merchandiser', org: 'Standard Group', place: 'Gazipur', dates: 'January 1, 2020 - Continuing', bullets: [
            'Handle 6 buyers including Zara and C&A; T&A follow-up from sampling to shipment.',
          ] },
        ] },
        { h: 'Academic Qualification:', kv: [
          ['B.Sc in Textile Engineering', 'Southeast University, CGPA 3.21 out of 4, 2019'],
          ['HSC (Science)', 'Dhaka City College, GPA 4.60 out of 5, 2014'],
        ] },
        { h: 'Personal Details :', kv: [
          ["Father's Name", 'Md. Abdur Razzak'],
          ["Mother's Name", 'Most. Nasima Begum'],
          ['Date of Birth', 'March 12, 1996'],
          ['Gender', 'Male'],
          ['Marital Status', 'Unmarried'],
          ['Nationality', 'Bangladeshi'],
          ['National Id No.', '6452138790'],
          ['Religion', 'Islam'],
          ['Permanent Address', 'Vill: Boro Bari, P.O: Mirzapur, P.S: Mirzapur, Dist: Tangail'],
          ['Current Location', 'Dhaka'],
          ['Blood Group', 'A+'],
        ] },
        { h: 'Reference (s):', kv: [
          ['Name', 'Md. Shafiul Alam'],
          ['Organization', 'Standard Group'],
          ['Designation', 'Senior Merchandising Manager'],
          ['Mobile', '01713-000555'],
          ['E-Mail', 'shafiul.alam@standardgroup.com.bd'],
          ['Relation', 'Professional'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Md. Nazmul Hasan Rony' },
      { cat: 'address', value: 'Road-4, House-21, Sector-11', note: 'BDJobs dash style' },
      { cat: 'phone', value: '02-8950123', note: 'Dhaka landline' },
      { cat: 'phone', value: '01911-223344' },
      { cat: 'phone', value: '01674-556677' },
      { cat: 'email', value: 'nazmul.hasan.merch@gmail.com' },
      { cat: 'family', value: 'Abdur Razzak' },
      { cat: 'family', value: 'Nasima Begum' },
      { cat: 'dob', value: 'March 12, 1996' },
      { cat: 'sensitive', value: 'Gender Male' },
      { cat: 'sensitive', value: 'Marital Status Unmarried' },
      { cat: 'gov-id', value: '6452138790' },
      { cat: 'sensitive', value: 'Religion Islam' },
      { cat: 'address', value: 'Boro Bari' },
      { cat: 'address', value: 'P.O: Mirzapur' },
      { cat: 'address', value: 'Dist: Tangail' },
      { cat: 'sensitive', value: 'Blood Group A' },
      { cat: 'referee', value: 'Shafiul Alam' },
      { cat: 'referee', value: '01713-000555' },
      { cat: 'referee', value: 'shafiul.alam@standardgroup.com.bd' },
    ],
    keep: ['Standard Group', 'Southeast University', 'Dhaka City College', 'Zara and C&A', 'T&A follow-up', 'Assistant Merchandiser', 'CGPA 3.21 out of 4', 'Senior Merchandising Manager'],
  },

  /* ── B2 ── NGO field officer ──────────────────────────────────────────── */
  {
    id: 'bd-ngo-field-officer',
    career: 'Field Officer (Microfinance NGO)',
    sector: 'Development / NGO',
    country: 'Bangladesh',
    layout: 'table-header',
    account: { fullName: 'Rafiqul Islam', email: 'rafiq.brac.fo@gmail.com', phone: '+8801556112233' },
    cv: {
      name: 'Mohammad Rafiqul Islam',
      title: 'Field Officer, Microfinance',
      contacts: [
        { label: 'Cell', value: '+880 1556 112233' },
        { label: 'Email', value: 'rafiq.brac.fo@gmail.com' },
      ],
      address: ['Present Address: C/O Abdul Majid, Vill: Kashipur, Post: Kashipur Bazar, Thana: Kotwali, Zilla: Barishal'],
      sections: [
        { h: 'Experience', jobs: [
          { role: 'Field Officer', org: 'BRAC Microfinance', place: 'Barishal Sadar', dates: '2018 – Present', bullets: [
            'Manage 420 borrowers across 14 village organisations with a 98.6% on-time repayment rate.',
          ] },
          { role: 'Credit Officer', org: 'ASA', place: 'Jhalokati', dates: '2015 – 2018' },
        ] },
        { h: 'Education', jobs: [{ role: 'MSS in Economics', org: 'University of Barishal', dates: '2014' }] },
        { h: 'Personal Details', kv: [
          ['Birth Registration No', '19941026512345678'],
          ['Date of Birth', '02 February 1994'],
          ['Religion', 'Islam'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Mohammad Rafiqul Islam' },
      { cat: 'phone', value: '+880 1556 112233' },
      { cat: 'email', value: 'rafiq.brac.fo@gmail.com' },
      { cat: 'family', value: 'Abdul Majid', note: 'care-of name in the address' },
      { cat: 'address', value: 'Vill: Kashipur' },
      { cat: 'address', value: 'Post: Kashipur Bazar' },
      { cat: 'address', value: 'Thana: Kotwali' },
      { cat: 'address', value: 'Zilla: Barishal' },
      { cat: 'gov-id', value: '19941026512345678', note: 'birth registration number' },
      { cat: 'dob', value: '02 February 1994' },
      { cat: 'sensitive', value: 'Religion Islam' },
    ],
    keep: ['BRAC Microfinance', 'ASA', 'University of Barishal', 'MSS in Economics', '98.6% on-time repayment', 'Barishal Sadar', 'Jhalokati'],
  },

  /* ── B3 ── Nurse, English CV with Bangla name ─────────────────────────── */
  {
    id: 'bd-senior-staff-nurse',
    career: 'Senior Staff Nurse',
    sector: 'Healthcare',
    country: 'Bangladesh',
    layout: 'sidebar',
    account: { fullName: 'Salma Khatun', email: 'salma.khatun.rn@gmail.com', phone: '01818123456' },
    cv: {
      name: 'Salma Khatun (সালমা খাতুন)',
      title: 'Senior Staff Nurse, BSc in Nursing',
      contacts: [
        { label: 'Mobile', value: '01818-123456' },
        { label: 'Email', value: 'salma.khatun.rn@gmail.com' },
        { label: 'BNMC Reg. No', value: '54321' },
      ],
      address: ['House 7, Road 12, Mohammadpur, Dhaka-1207'],
      sections: [
        { h: 'Profile', p: 'Senior staff nurse with 7 years in cardiac critical care at a tertiary government hospital.' },
        { h: 'Experience', jobs: [
          { role: 'Senior Staff Nurse, CCU', org: 'National Institute of Cardiovascular Diseases', place: 'Dhaka', dates: '2017 – Present', bullets: [
            'In charge of a 20-bed CCU shift; trained 30 junior nurses in ECG interpretation.',
          ] },
        ] },
        { h: 'Education', jobs: [{ role: 'BSc in Nursing', org: 'College of Nursing, Mohakhali', dates: '2016' }] },
        { h: 'Personal', kv: [
          ['Height', '5 ft 2 in'],
          ['Weight', '50 kg'],
          ['Blood Group', 'O-'],
          ["Husband's Name", 'Md. Kamrul Hasan'],
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Salma Khatun' },
      { cat: 'name', value: 'সালমা খাতুন', note: 'name in Bangla, in brackets' },
      { cat: 'phone', value: '01818-123456' },
      { cat: 'email', value: 'salma.khatun.rn@gmail.com' },
      { cat: 'registration', value: '54321', note: 'BNMC registration' },
      { cat: 'address', value: 'House 7, Road 12' },
      { cat: 'address', value: 'Dhaka-1207' },
      { cat: 'sensitive', value: 'Height 5 ft 2 in' },
      { cat: 'sensitive', value: 'Weight 50 kg' },
      { cat: 'sensitive', value: 'Blood Group O' },
      { cat: 'family', value: 'Kamrul Hasan' },
    ],
    keep: ['National Institute of Cardiovascular Diseases', 'College of Nursing, Mohakhali', 'BSc in Nursing', '20-bed CCU', 'ECG interpretation', 'Senior Staff Nurse, CCU'],
  },

  /* ── B4 ── Government job application form (Bangla) ───────────────────── */
  {
    id: 'bd-govt-application-bangla',
    career: 'Office Assistant (government application form)',
    sector: 'Public Sector',
    country: 'Bangladesh',
    layout: 'bd-traditional',
    lang: 'bn',
    account: { fullName: 'Sumon Mia', email: '', phone: '01722334455' },
    cv: {
      name: 'সুমন মিয়া',
      title: 'অফিস সহায়ক পদের জন্য আবেদন',
      contacts: [
        { label: 'Name (in English)', value: 'SUMON MIA' },
        { label: 'মোবাইল', value: '০১৭২২-৩৩৪৪৫৫' },
      ],
      sections: [
        { h: 'ব্যক্তিগত তথ্য', kv: [
          ['পিতার নাম', 'মোঃ আলী হোসেন'],
          ['মাতার নাম', 'মোছাঃ জমিলা খাতুন'],
          ['জন্ম তারিখ', '১০/০২/১৯৯৮'],
          ['জাতীয় পরিচয়পত্র নম্বর', '৭৮৯৪৫৬১২৩০'],
          ['ধর্ম', 'ইসলাম'],
          ['গ্রাম', 'দক্ষিণপাড়া'],
          ['ডাকঘর', 'সোনাতলা'],
          ['উপজেলা', 'সোনাতলা'],
          ['জেলা', 'বগুড়া'],
        ] },
        { h: 'শিক্ষাগত যোগ্যতা', jobs: [
          { role: 'এইচএসসি (মানবিক), জিপিএ ৪.২৫', org: 'সোনাতলা সরকারি কলেজ', dates: '২০১৬' },
        ] },
        { h: 'অভিজ্ঞতা', p: 'কম্পিউটার টাইপিং (বাংলা ও ইংরেজি), মাইক্রোসফট অফিস।' },
      ],
    },
    pii: [
      { cat: 'name', value: 'সুমন মিয়া' },
      { cat: 'name', value: 'SUMON MIA', note: 'English name field' },
      { cat: 'phone', value: '০১৭২২-৩৩৪৪৫৫' },
      { cat: 'family', value: 'আলী হোসেন' },
      { cat: 'family', value: 'জমিলা খাতুন' },
      { cat: 'dob', value: '১০/০২/১৯৯৮' },
      { cat: 'gov-id', value: '৭৮৯৪৫৬১২৩০' },
      { cat: 'sensitive', value: 'ইসলাম', note: 'religion' },
      { cat: 'address', value: 'দক্ষিণপাড়া', note: 'village' },
      { cat: 'address', value: 'দিণপাড়া', note: 'the village, as the PDF text layer holds it' },
      { cat: 'address', value: 'ডাকঘর : সোনাতলা', note: 'post office (also a college name, which must survive)' },
      { cat: 'address', value: 'উপজেলা : সোনাতলা' },
      { cat: 'address', value: 'বগুড়া', note: 'district' },
    ],
    // Only what this PDF's text layer holds intact (see F8): 'মাইক্রোসফট' and
    // 'কম্পিউটার' lose a conjunct in extraction.
    keep: ['সোনাতলা সরকারি কলেজ', 'টাইপিং', 'অফিস', 'মানবিক', 'জিপিএ ৪.২৫'],
  },

  /* ── B5 ── Driver (overseas employment) ───────────────────────────────── */
  {
    id: 'bd-heavy-vehicle-driver',
    career: 'Heavy Vehicle Driver (overseas employment)',
    sector: 'Transport',
    country: 'Bangladesh',
    layout: 'classic',
    account: { fullName: 'Abul Kalam', email: 'abulkalam.driver@gmail.com', phone: '01799887766' },
    cv: {
      name: 'Md. Abul Kalam Azad',
      title: 'Heavy Vehicle Driver',
      contacts: [
        { label: 'Mobile', value: '01799-887766' },
        { label: "Guardian's Mobile", value: '01799-112200' },
        { label: 'Email', value: 'abulkalam.driver@gmail.com' },
      ],
      address: ['Present Address: C/O Md. Harun, House 34, Road 2, Section 6, Mirpur, Dhaka-1216'],
      sections: [
        { h: 'Objective', p: 'Experienced heavy vehicle driver seeking employment in Saudi Arabia, Qatar or the UAE.' },
        { h: 'Licence', p: 'BRTA Driving Licence No: DK0012345L00001 (Professional, Heavy). Valid to 2029.' },
        { h: 'Experience', jobs: [
          { role: 'Covered Van Driver', org: 'Pran-RFL Group', place: 'Dhaka', dates: '2016 – 2024', bullets: [
            'Dhaka–Chattogram highway runs; 400,000 km without an accident.',
          ] },
        ] },
        { h: 'Emergency Contact', p: 'Brother: Md. Abul Hashem, 01799-334455' },
        { h: 'Passport Details', kv: [['Passport No', 'EC7654321'], ['Date of Birth', '15-08-1990']] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Md. Abul Kalam Azad' },
      { cat: 'phone', value: '01799-887766' },
      { cat: 'referee', value: '01799-112200', note: "guardian's phone" },
      { cat: 'email', value: 'abulkalam.driver@gmail.com' },
      { cat: 'family', value: 'Md. Harun', note: 'care-of name' },
      { cat: 'address', value: 'House 34, Road 2, Section 6' },
      { cat: 'address', value: 'Dhaka-1216' },
      { cat: 'gov-id', value: 'DK0012345L00001', note: 'driving licence' },
      { cat: 'family', value: 'Abul Hashem', note: 'emergency contact (brother)' },
      { cat: 'referee', value: '01799-334455', note: 'emergency contact phone' },
      { cat: 'gov-id', value: 'EC7654321', note: 'passport' },
      { cat: 'dob', value: '15-08-1990' },
    ],
    keep: ['Pran-RFL Group', 'BRTA', 'Professional, Heavy', '400,000 km', 'Saudi Arabia, Qatar or the UAE', 'Covered Van Driver'],
  },

  /* ── B6 ── University lecturer ────────────────────────────────────────── */
  {
    id: 'bd-university-lecturer',
    career: 'Lecturer (Environmental Science)',
    sector: 'Higher Education',
    country: 'Bangladesh',
    layout: 'classic',
    account: { fullName: 'Tahmina Rahman', email: 'tahmina.rahman@juniv.edu', phone: '+8801711998877' },
    cv: {
      name: 'Dr. Tahmina Rahman',
      title: 'Lecturer, Department of Environmental Sciences',
      contacts: [
        { value: '+880 1711-998877' },
        { value: 'tahmina.rahman@juniv.edu' },
        { value: 'orcid.org/0000-0002-1234-5678' },
        { value: 'scholar.google.com/citations?user=AbCdEf12345' },
      ],
      sections: [
        { h: 'Appointments', jobs: [
          { role: 'Lecturer', org: 'Jahangirnagar University', place: 'Savar', dates: '2021 – Present' },
        ] },
        { h: 'Education', jobs: [
          { role: 'PhD, Environmental Science', org: 'University of Queensland', dates: '2020' },
          { role: 'MS, Environmental Sciences', org: 'Jahangirnagar University', dates: '2015' },
        ] },
        { h: 'Selected Publications', list: [
          'Rahman, T., Hossain, M. A. (2023). Arsenic in shallow tubewells of the Ganges delta. Environmental Pollution, 318, 120901.',
          'Rahman, T. et al. (2021). River plastic loads in Dhaka. Science of the Total Environment, 790, 148012.',
        ] },
        { h: 'References', refs: [
          { name: 'Prof. Dr. Md. Shahidul Islam', role: 'Chairman, Department of Environmental Sciences', org: 'Jahangirnagar University', contact: ['shahid.islam@juniv.edu'] },
        ] },
      ],
    },
    pii: [
      { cat: 'name', value: 'Tahmina Rahman' },
      { cat: 'name', value: 'Rahman, T.', note: 'own name in citation form' },
      { cat: 'phone', value: '+880 1711-998877' },
      { cat: 'email', value: 'tahmina.rahman@juniv.edu' },
      { cat: 'url', value: 'orcid.org/0000-0002-1234-5678' },
      { cat: 'url', value: 'scholar.google.com/citations?user=AbCdEf12345' },
      { cat: 'referee', value: 'Md. Shahidul Islam' },
      { cat: 'referee', value: 'shahid.islam@juniv.edu' },
    ],
    keep: ['Jahangirnagar University', 'University of Queensland', 'Environmental Pollution, 318, 120901', 'Science of the Total Environment', 'Arsenic in shallow tubewells', 'Hossain, M. A.'],
  },
];

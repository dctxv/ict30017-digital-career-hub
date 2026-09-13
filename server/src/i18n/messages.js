/**
 * Bangla renderings of the messages the API sends back to the browser.
 *
 * Keyed by the exact English string the route already produces. That choice is
 * deliberate: the alternative was replacing 111 literal `error:` sites across
 * seven route files with error codes, which is a large, risky diff through
 * every request path for no behavioural gain. Here the routes are untouched,
 * English remains the canonical wording, and anything missing from this table
 * simply goes out in English — the same per-row fallback the bilingual
 * resources table already uses.
 *
 * Technical vocabulary stays in English (PDF, DOCX, MB, Premium) because that
 * is how a Bangladeshi user reads it, and because some of these strings name
 * things the user must recognise in a file dialog.
 */

/** Exact-match table: English message → Bangla. */
export const BANGLA_MESSAGES = {
  /* ── Generic ─────────────────────────────────────────────── */
  'Internal server error.': 'সার্ভারে সমস্যা হয়েছে।',
  'Service temporarily unavailable.': 'সেবাটি সাময়িকভাবে বন্ধ আছে।',

  /* ── Authorisation ───────────────────────────────────────── */
  'Access denied.': 'প্রবেশাধিকার নেই।',
  'Forbidden.': 'অনুমতি নেই।',
  'Authentication required.': 'লগ ইন করা আবশ্যক।',
  'Could not confirm session.': 'সেশন নিশ্চিত করা যায়নি।',
  'Session expired. Please log in again.': 'সেশনের মেয়াদ শেষ হয়ে গেছে। আবার লগ ইন করুন।',
  'Session is no longer valid.': 'সেশনটি আর বৈধ নয়।',
  'Invalid token.': 'টোকেনটি সঠিক নয়।',

  /* ── Registration and login ──────────────────────────────── */
  'Email and password are required.': 'ইমেইল ও পাসওয়ার্ড দুটোই দিতে হবে।',
  'Full name, email, and password are required.': 'পূর্ণ নাম, ইমেইল ও পাসওয়ার্ড দিতে হবে।',
  'Full name must be between 2 and 100 characters.': 'পূর্ণ নাম ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।',
  'Invalid email address.': 'ইমেইল ঠিকানাটি সঠিক নয়।',
  'Invalid email or password.': 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
  'Password is too long.': 'পাসওয়ার্ডটি অনেক লম্বা।',
  'An account with this email already exists. Try logging in instead.':
    'এই ইমেইলে একটি অ্যাকাউন্ট আগে থেকেই আছে। বরং লগ ইন করে দেখুন।',
  'Account temporarily locked due to too many failed attempts. Try again later.':
    'বারবার ভুল চেষ্টার কারণে অ্যাকাউন্টটি সাময়িকভাবে বন্ধ রাখা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
  'Login failed.': 'লগ ইন করা যায়নি।',
  'Registration failed.': 'রেজিস্ট্রেশন করা যায়নি।',
  'User registered successfully': 'ব্যবহারকারী সফলভাবে নিবন্ধিত হয়েছে',
  'Logged out successfully.': 'সফলভাবে লগ আউট হয়েছে।',

  /* ── Password reset ──────────────────────────────────────── */
  'Email, token, and new password are required.': 'ইমেইল, টোকেন ও নতুন পাসওয়ার্ড দিতে হবে।',
  'Reset link is invalid or has expired.': 'রিসেট লিংকটি সঠিক নয় অথবা এর মেয়াদ শেষ হয়ে গেছে।',
  'Password reset failed.': 'পাসওয়ার্ড রিসেট করা যায়নি।',
  'Password updated successfully. You can now log in.':
    'পাসওয়ার্ড সফলভাবে হালনাগাদ হয়েছে। এখন লগ ইন করতে পারেন।',
  'If that email is registered you will receive a reset link shortly.':
    'ইমেইলটি নিবন্ধিত থাকলে কিছুক্ষণের মধ্যে একটি রিসেট লিংক পাবেন।',

  /* ── Rate limits ─────────────────────────────────────────── */
  'Too many login attempts. Please try again in 15 minutes.':
    'অনেক বেশি লগ ইন চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।',
  'Too many registration attempts. Please try again in an hour.':
    'অনেক বেশি রেজিস্ট্রেশন চেষ্টা হয়েছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।',
  'Too many password reset requests. Please try again in an hour.':
    'অনেক বেশি পাসওয়ার্ড রিসেট অনুরোধ এসেছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।',
  'Too many resume analysis requests. Please try again in an hour.':
    'অনেক বেশি রিজিউমে বিশ্লেষণের অনুরোধ এসেছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।',
  'Too many chatbot requests. Please try again later.':
    'অনেক বেশি চ্যাটবট অনুরোধ এসেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',

  /* ── Resume upload and analysis ──────────────────────────── */
  'File too large. Maximum size is 3 MB.': 'ফাইলটি অনেক বড়। সর্বোচ্চ আকার ৩ MB।',
  'Invalid file type. Only PDF and DOCX files are accepted.':
    'এই ধরনের ফাইল সমর্থিত নয়। শুধু PDF ও DOCX ফাইল গ্রহণ করা হয়।',
  'No file uploaded. Please attach a PDF or DOCX resume.':
    'কোনো ফাইল আপলোড হয়নি। একটি PDF বা DOCX রিজিউমে যুক্ত করুন।',
  'An error occurred during resume analysis.': 'রিজিউমে বিশ্লেষণের সময় একটি সমস্যা হয়েছে।',
  'Analysis failed.': 'বিশ্লেষণ সম্পন্ন করা যায়নি।',
  'The AI service is busy right now. Please try again in a minute.':
    'AI সেবাটি এই মুহূর্তে ব্যস্ত। এক মিনিট পরে আবার চেষ্টা করুন।',
  // The rest of the provider-failure vocabulary (ai-service/src/utils/aiErrors.js).
  'The AI service rejected this server\'s API key. The site administrator needs to check the configuration.':
    'AI সেবাটি এই সার্ভারের API key গ্রহণ করেনি। সাইট অ্যাডমিনিস্ট্রেটরকে কনফিগারেশন যাচাই করতে হবে।',
  'The AI model this server is configured to use is not available. The site administrator needs to check the configuration.':
    'এই সার্ভারের জন্য নির্ধারিত AI মডেলটি পাওয়া যাচ্ছে না। সাইট অ্যাডমিনিস্ট্রেটরকে কনফিগারেশন যাচাই করতে হবে।',
  'The AI service\'s daily allowance for this server has been used up. Please try again tomorrow.':
    'এই সার্ভারের জন্য AI সেবার দৈনিক বরাদ্দ শেষ হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।',
  'The AI service is temporarily unavailable. Please try again in a few minutes.':
    'AI সেবাটি সাময়িকভাবে বন্ধ আছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।',
  'The AI service could not be reached. Please check the connection and try again.':
    'AI সেবার সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।',
  'The AI service refused the request. The site administrator needs to check the server log.':
    'AI সেবাটি অনুরোধটি প্রত্যাখ্যান করেছে। সাইট অ্যাডমিনিস্ট্রেটরকে সার্ভার লগ দেখতে হবে।',
  'The AI service returned an unexpected error. Please try again.':
    'AI সেবা থেকে একটি অপ্রত্যাশিত ত্রুটি এসেছে। আবার চেষ্টা করুন।',
  'AI returned an unreadable response. Please try again.':
    'AI থেকে পাঠযোগ্য উত্তর আসেনি। আবার চেষ্টা করুন।',
  'The AI returned an unexpected response format. Please try again.':
    'AI অপ্রত্যাশিত ফরম্যাটে উত্তর দিয়েছে। আবার চেষ্টা করুন।',
  'Could not read your review allowance.': 'আপনার রিভিউ কোটা পড়া যায়নি।',
  'Could not verify your review allowance.': 'আপনার রিভিউ কোটা যাচাই করা যায়নি।',

  /* ── Chatbot ─────────────────────────────────────────────── */
  'Message is required.': 'একটি বার্তা লিখতে হবে।',
  'conversationHistory must be an array.': 'conversationHistory একটি অ্যারে হতে হবে।',
  'Could not process chatbot request.': 'চ্যাটবটের অনুরোধটি প্রক্রিয়া করা যায়নি।',
  "You've reached your daily chat limit. Upgrade to Premium for unlimited access.":
    'আপনি আজকের চ্যাটের সীমা শেষ করে ফেলেছেন। আনলিমিটেড ব্যবহারের জন্য প্রিমিয়ামে আপগ্রেড করুন।',

  /* ── Content: disciplines ────────────────────────────────── */
  'Invalid discipline id.': 'বিষয়ের আইডিটি সঠিক নয়।',
  'Discipline not found.': 'বিষয়টি পাওয়া যায়নি।',
  'Discipline is required.': 'বিষয় উল্লেখ করা আবশ্যক।',
  'A discipline with that name already exists.': 'এই নামে একটি বিষয় আগে থেকেই আছে।',
  'Discipline deleted.': 'বিষয়টি মুছে ফেলা হয়েছে।',

  /* ── Content: career paths ───────────────────────────────── */
  'Invalid career path id.': 'ক্যারিয়ার পথের আইডিটি সঠিক নয়।',
  'Career path not found.': 'ক্যারিয়ার পথটি পাওয়া যায়নি।',
  'Career path deleted.': 'ক্যারিয়ার পথটি মুছে ফেলা হয়েছে।',

  /* ── Content: resources ──────────────────────────────────── */
  'Invalid resource id.': 'রিসোর্সের আইডিটি সঠিক নয়।',
  'Resource not found.': 'রিসোর্সটি পাওয়া যায়নি।',
  'Resource deleted.': 'রিসোর্সটি মুছে ফেলা হয়েছে।',

  /* ── Content: alumni ─────────────────────────────────────── */
  'Invalid alumni id.': 'অ্যালামনাই আইডিটি সঠিক নয়।',
  'Alumni profile not found.': 'অ্যালামনাই প্রোফাইলটি পাওয়া যায়নি।',
  'Alumni profile deleted.': 'অ্যালামনাই প্রোফাইলটি মুছে ফেলা হয়েছে।',

  /* ── Mock interview and preparation ──────────────────────── */
  'Too many preparation requests. Please try again in an hour.':
    'অনেক বেশি অনুরোধ এসেছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।',
  'Could not read your interview allowance.': 'আপনার ইন্টারভিউ কোটা পড়া যায়নি।',
  'Could not verify your interview allowance.': 'আপনার ইন্টারভিউ কোটা যাচাই করা যায়নি।',
  'Could not load your preparation plan.': 'আপনার প্রস্তুতি পরিকল্পনা লোড করা যায়নি।',
  'Could not load your progress.': 'আপনার অগ্রগতি লোড করা যায়নি।',
  'Invalid gap id.': 'গ্যাপের আইডিটি সঠিক নয়।',
  'Gap not found.': 'গ্যাপটি পাওয়া যায়নি।',
  'A gap can only be dismissed or restored.':
    'একটি গ্যাপ কেবল বাতিল করা বা ফিরিয়ে আনা যায়।',
  'Could not update that gap.': 'গ্যাপটি হালনাগাদ করা যায়নি।',
  'Invalid interview id.': 'ইন্টারভিউয়ের আইডিটি সঠিক নয়।',
  'Interview not found.': 'ইন্টারভিউটি পাওয়া যায়নি।',
  'Could not start the interview.': 'ইন্টারভিউ শুরু করা যায়নি।',
  'Answers are required.': 'উত্তর দিতে হবে।',
  'Answer at least one question before submitting.':
    'জমা দেওয়ার আগে অন্তত একটি প্রশ্নের উত্তর দিন।',
  'This interview has already been assessed.':
    'এই ইন্টারভিউটির মূল্যায়ন আগেই হয়ে গেছে।',
  'Could not assess this interview.': 'এই ইন্টারভিউটির মূল্যায়ন করা যায়নি।',
  'Could not load your interview history.': 'আপনার ইন্টারভিউয়ের ইতিহাস লোড করা যায়নি।',
  'Could not load that interview.': 'ইন্টারভিউটি লোড করা যায়নি।',
};

/**
 * Messages that carry a value interpolated at the call site, so no exact key
 * can match them. Each entry captures the value and rebuilds the sentence in
 * Bangla around it. Kept small on purpose: a pattern is only worth adding when
 * the alternative is leaving a whole sentence in English.
 */
export const BANGLA_PATTERNS = [
  {
    match: /^Password must be at least (\d+) characters\.$/,
    build: ([, count]) => `পাসওয়ার্ড অন্তত ${toBengaliDigits(count)} অক্ষরের হতে হবে।`,
  },
  {
    // The plan names are the values the API accepts, so they stay verbatim.
    match: /^Plan must be one of: (.+)\.$/,
    build: ([, plans]) => `প্ল্যান অবশ্যই এগুলোর একটি হতে হবে: ${plans}।`,
  },
  {
    match: /^You have used all (\d+) of your free resume reviews for today\. Your allowance resets tomorrow\.$/,
    build: ([, count]) =>
      `আপনি আজকের ${toBengaliDigits(count)}টি ফ্রি রিজিউমে রিভিউই ব্যবহার করে ফেলেছেন। আগামীকাল আপনার কোটা আবার শুরু হবে।`,
  },
  {
    // Worded to match the review rejection above, so the two limits read the
    // same way to a user who hits both.
    match: /^You have used all (\d+) of your free mock interviews for today\. Your allowance resets tomorrow\.$/,
    build: ([, count]) =>
      `আপনি আজকের ${toBengaliDigits(count)}টি ফ্রি মক ইন্টারভিউই ব্যবহার করে ফেলেছেন। আগামীকাল আপনার কোটা আবার শুরু হবে।`,
  },
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(value) {
  return String(value).replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

/**
 * GreenSky financing — single source of truth for Mile High Gutter.
 * Gutter Group. Do not invent, infer, or modify official plan terms.
 */

export const FINANCING_COMPANY = 'Mile High Gutter'
export const FINANCING_GROUP = 'gutter'
export const GREENSKY_MERCHANT_ID = '81138938'
export const FINANCING_PAGE_URL = '/financing/'
export const FINANCING_TERMS_HASH = '#financing-terms'
export const FINANCING_TERMS_ID = 'financing-terms'

/** Available Gutter Group plans. Primary banner advertises 2613 and 2717. */
export const AVAILABLE_PLAN_NUMBERS = ['2613', '2717', '2602']
export const PRIMARY_PLAN_NUMBERS = ['2613', '2717']
export const ADDITIONAL_PLAN_NUMBERS = ['2602']

export const BANNER_COPY = {
  eyebrow: 'FINANCING AVAILABLE',
  supportingLine: 'Fix Now, Pay Over Time',
  ctaHeading: 'READY TO GET STARTED?',
  ctaText: 'Call Now to Learn About Financing Options',
  ctaFinePrintPrefix: 'Financing subject to credit approval. See ',
  ctaFinePrintLink: 'Important Financing Terms',
  viewAllLabel: 'View All Financing Options',
  termsLinkLabel: 'Important Financing Terms',
}

export const PAGE_COPY = {
  heroEyebrow: 'FINANCING OPTIONS',
  heroHeadline: 'Fix Now, Pay Over Time',
  heroLead:
    "Don't let the upfront cost of your project keep you from getting the work you need. Ask about our available financing options and learn more about financing solutions available for your project.",
  ctaText: 'Call Now to Learn About Financing Options',
  metaTitle: 'Financing Options | Mile High Gutter',
  metaDescription:
    'Ask about GreenSky financing options for qualifying Mile High Gutter projects. Subject to credit approval. See Important Financing Terms.',
}

export const BANNER_OFFERS = [
  {
    planNumber: '2613',
    headline: 'NO INTEREST IF PAID IN FULL',
    subhead: 'WITHIN 12 MONTHS¹',
    supporting: 'Available on qualifying projects of $2,500 or more.',
    nearby:
      'Interest is billed during promo period but will be waived if the amount financed is paid in full before promo period expires.',
    small: '',
  },
  {
    planNumber: '2717',
    headline: '5 YEAR',
    subhead: 'FIXED MONTHLY PAYMENTS²',
    supporting: '7.99% Fixed Interest Rate',
    nearby: '',
    small: '60-month loan term. See Important Financing Terms for APR and payment details.',
  },
]

export const PAGE_OFFERS = [
  {
    planNumber: '2613',
    kicker: 'PROMOTIONAL FINANCING',
    optionLabel: 'OPTION 1',
    headline: 'NO INTEREST IF PAID IN FULL',
    subhead: 'WITHIN 12 MONTHS¹',
    details: [
      'Available on qualifying projects of $2,500 or more.',
      'Interest is billed during promo period but will be waived if the amount financed is paid in full before promo period expires.',
      'Monthly payments are required during the promotional period. Making only the required monthly payments will not pay off the amount financed by the promotional period expiration date.',
    ],
  },
  {
    planNumber: '2717',
    kicker: 'FIXED-RATE FINANCING',
    optionLabel: 'OPTION 2',
    headline: '5 YEAR',
    subhead: 'FIXED MONTHLY PAYMENTS²',
    details: [
      '7.99% Fixed Interest Rate',
      '60-month loan term.',
      'See Important Financing Terms for APR, payment example, origination fee information, and complete terms.',
    ],
  },
]

export const ADDITIONAL_OPTION = {
  planNumber: '2602',
  heading: 'Additional Financing Options',
  title: '6-Month Promotional Financing Available³',
  details: [
    'Plan 2602 provides a 6-month promotional period during which interest is billed but will be waived if the amount financed is paid in full before the promotional period expires.',
    'Monthly payments are required.',
  ],
}

export const PLAN_DISCLOSURES = [
  {
    planNumber: '2613',
    marker: '¹',
    heading: 'PLAN 2613',
    text: 'Plan 2613. Subject to credit approval. APR Rates range from 17.99%-29.99% (fixed periodic interest rates range from 17.99%-29.99%). Only well-qualified applicants will receive an APR of 17.99%; some applicants may not qualify. Loan amount and rate will vary based on your income and creditworthiness. 12 month promotional period (Promo Period) during which interest is billed but will be waived if the amount financed is paid in full before Promo Period expires. Monthly payments are required during the Promo Period, but making only the required monthly payments will not pay off the amount financed by Promo Period expiration date. Any unpaid balance and amounts owed after Promo Period will be paid over 72 monthly payments. Example for $10,000 loan: 29.99% APR, 84 monthly payments of $285.87. Actual payments based on amounts and timing of purchases. Call 866-936-0602 for details.',
  },
  {
    planNumber: '2717',
    marker: '²',
    heading: 'PLAN 2717',
    text: 'Plan 2717. Subject to credit approval. Loan term is 60 months. Fixed 8.37% APR (fixed periodic interest rate of 7.99%). APR assumes an origination fee of $89 for a $10,000 loan; origination fee is added to the minimum payment due on the first payment. Not all loans include an origination fee. Example for $10,000 loan with $89 origination fee: 8.37% APR, fixed periodic interest rate of 7.99%, 1 payment of $291.72 followed by 59 monthly payments of $202.72. Actual payment amounts and APR may vary. Call 866-936-0602 for details.',
  },
  {
    planNumber: '2602',
    marker: '³',
    heading: 'PLAN 2602',
    text: 'Plan 2602. Subject to credit approval. APR Rates range from 17.99%-29.99% (fixed periodic interest rates range from 17.99%-29.99%). Only well-qualified applicants will receive an APR of 17.99%; some applicants may not qualify. Loan amount and rate will vary based on your income and creditworthiness. 6 month promotional period (Promo Period) during which interest is billed but will be waived if the amount financed is paid in full before Promo Period expires. Monthly payments are required during the Promo Period, but making only the required monthly payments will not pay off the amount financed by Promo Period expiration date. Any unpaid balance and amounts owed after Promo Period will be paid over 78 monthly payments. Example for $10,000 loan: 29.99% APR, 84 monthly payments of $285.87. Actual payments based on amounts and timing of purchases. Call 866-936-0602 for details.',
  },
]

export const GREENSKY_MAIN_DISCLOSURE_PARTS = [
  'Loans for the GreenSky® consumer loan program are offered and made by federally insured, federal or state chartered financial institutions providing credit without regard to age, race, color, religion, national origin, gender, disability, or familial status. A list of financial institutions currently providing loans through the GreenSky® Program is available at ',
  {
    href: 'https://www.greensky.com/bank-partners',
    label: 'www.greensky.com/bank-partners',
  },
  '. GreenSky Servicing, LLC services the loans on behalf of your lender, NMLS #1416362. ',
  {
    href: 'https://www.nmlsconsumeraccess.org/',
    label: 'www.nmlsconsumeraccess.org/',
  },
  '. GreenSky® is a registered trademark of GreenSky, LLC and is licensed to banks and other financial institutions for their use in connection with that consumer loan program. GreenSky Servicing, LLC is a financial technology company that manages the GreenSky® consumer loan program by providing origination and servicing support to banks and other financial institutions that make or hold program loans. GreenSky, LLC and GreenSky Servicing, LLC are not lenders. All credit decisions and loan terms are determined by program lenders.',
]

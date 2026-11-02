// Public demonstration code: lets anyone open the form with a sample course to see how it works.
// It is not an admin code and never gives access to the research-team page. Demonstration answers are
// kept apart from the study: in demo mode they stay in the visitor's browser, and the storage server
// never writes them to the data files.
export const DEMO_CODE = 'DEM-TRY'

export function demoIntake(year = new Date().getFullYear()) {
  return {
    A01: 'US', A02: 'NY', A03: 'Demo University School of Dental Medicine', A04: '3', A05: 'New York',
    A06: 'Department of Oral Radiology', A07: 'RAD-301 Oral Radiology II (demonstration)', A08: '1', A09: '2',
    A10: 'Demonstration user', A12: 'ICARB-D survey team', A13: 'en', A14: '1', A15: String(year),
  }
}

export const isDemo = (code) => code === DEMO_CODE

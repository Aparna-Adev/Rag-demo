import type { MockResponse, NotificationItem, PolicyDocument, ResponseMetadata, User } from '../types'

export const currentUser: User = { id: 'usr-001', name: 'John Doe', role: 'Employee', initials: 'JD' }

export const initialDocuments: PolicyDocument[] = [
  { id:'hr-policy', name:'HR Policy.pdf', type:'PDF', size:'3.2 MB', pages:48, category:'All Policies', updatedAt:'2 days ago' },
  { id:'leave-policy', name:'Leave Policy.pdf', type:'PDF', size:'1.8 MB', pages:32, category:'Leave', updatedAt:'3 days ago' },
  { id:'attendance-policy', name:'Attendance Policy.pdf', type:'PDF', size:'1.2 MB', pages:18, category:'Attendance', updatedAt:'5 days ago' },
  { id:'travel-policy', name:'Travel Policy.pdf', type:'PDF', size:'2.1 MB', pages:27, category:'Travel', updatedAt:'1 week ago' },
  { id:'conduct', name:'Code of Conduct.pdf', type:'PDF', size:'2.8 MB', pages:41, category:'All Policies', updatedAt:'1 week ago' },
  { id:'isms', name:'ISMS Policy.pdf', type:'PDF', size:'1.6 MB', pages:24, category:'Security', updatedAt:'2 weeks ago' },
  { id:'benefits', name:'Employee Benefits.pdf', type:'PDF', size:'1.4 MB', pages:22, category:'Benefits', updatedAt:'4 days ago' },
  { id:'exit', name:'Separation Policy.pdf', type:'PDF', size:'980 KB', pages:16, category:'Exit Process', updatedAt:'6 days ago' },
]

const docs = {
  leave: { id:'leave-policy', name:'Leave Policy.pdf', page:14, section:'Section 3.2', score:96, category:'Leave' },
  attendance: { id:'attendance-policy', name:'Attendance Policy.pdf', page:8, section:'Section 2.1', score:91, category:'Attendance' },
  payroll: { id:'hr-policy', name:'HR Policy.pdf', page:31, section:'Section 6.4', score:88, category:'Payroll' },
  travel: { id:'travel-policy', name:'Travel Policy.pdf', page:11, section:'Section 4.3', score:94, category:'Travel' },
  security: { id:'isms', name:'ISMS Policy.pdf', page:9, section:'Section 3.1', score:97, category:'Security' },
  benefits: { id:'benefits', name:'Employee Benefits.pdf', page:7, section:'Section 2.4', score:90, category:'Benefits' },
  exit: { id:'exit', name:'Separation Policy.pdf', page:6, section:'Section 2.2', score:93, category:'Exit Process' },
}

export const mockResponses: MockResponse[] = [
  { id:'casual-leave', keywords:['casual','cl','annual leave','sick leave','maternity','paternity','leave'], category:'Leave', answer:'Employees are eligible for 12 Casual Leaves every calendar year.', detail:'Casual leave cannot be encashed. Up to 2 unused days may be carried forward to the next calendar year, subject to manager approval.', confidence:96, documents:[docs.leave,{...docs.attendance,id:'handbook',name:'Employee Handbook.pdf',page:22,score:89}], suggestions:['Can CL be carried forward?','How many Sick Leaves?','How to apply for leave?','Leave during probation?'] },
  { id:'attendance', keywords:['attendance','overtime','working hours','late'], category:'Attendance', answer:'The standard workday is 8.5 hours, including a 30-minute meal break.', detail:'Employees should record attendance through the HR portal. Three late arrivals in a month may trigger a manager review.', confidence:91, documents:[docs.attendance,docs.leave], suggestions:['What are core working hours?','How is overtime approved?','Can attendance be corrected?'] },
  { id:'payroll', keywords:['pf','provident','payroll','salary','gratuity'], category:'Payroll', answer:'Provident Fund is calculated at 12% of eligible basic pay, with a matching employer contribution.', detail:'Gratuity eligibility begins after five years of continuous service and is calculated according to applicable statutory rules.', confidence:88, documents:[docs.payroll,docs.benefits], suggestions:['When is salary credited?','How is gratuity calculated?','Where can I download payslips?'] },
  { id:'travel', keywords:['travel','reimbursement','hotel','flight'], category:'Travel', answer:'Business travel must be approved by the reporting manager before any booking is made.', detail:'Use the corporate travel portal for flights and hotels. Expense claims should be submitted within 10 working days of return.', confidence:94, documents:[docs.travel], suggestions:['What is the hotel limit?','How do I claim travel expenses?','Is local transport covered?'] },
  { id:'security', keywords:['security','password','isms','data','device'], category:'Security', answer:'Company information must only be accessed from approved devices using multi-factor authentication.', detail:'Suspected data loss, phishing, or unauthorized access must be reported to the Security Operations team immediately.', confidence:97, documents:[docs.security], suggestions:['How do I report phishing?','Can I use a personal device?','What is the password policy?'] },
  { id:'benefits', keywords:['benefit','insurance','medical','wellness'], category:'Benefits', answer:'Employees and eligible dependants are covered under the company group medical insurance plan.', detail:'Coverage details, e-cards, and claims are available through the benefits portal. Optional top-up coverage opens annually.', confidence:90, documents:[docs.benefits], suggestions:['Who can be a dependant?','How do I submit a claim?','Is dental treatment covered?'] },
  { id:'exit', keywords:['notice','exit','resign','separation','probation'], category:'Exit Process', answer:'The standard notice period is 60 days for confirmed employees and 30 days during probation.', detail:'A shorter release may be approved based on business continuity, knowledge transfer, and applicable notice pay.', confidence:93, documents:[docs.exit], suggestions:['Can notice period be bought out?','How does final settlement work?','When will I get my experience letter?'] },
  { id:'wfh', keywords:['work from home','wfh','remote','hybrid'], category:'Attendance', answer:'Eligible employees may work remotely up to two days per week with manager approval.', detail:'Remote work days should be planned in advance and employees must remain available during core collaboration hours.', confidence:86, documents:[docs.attendance], suggestions:['Which roles are eligible for WFH?','Can I change my remote days?','What are core hours?'] },
]

export const fallbackResponse: MockResponse = { id:'general', keywords:[], category:'All Policies', answer:'I found guidance related to your question in the employee policy library.', detail:'This demo uses a local knowledge base. Try asking about leave, attendance, payroll, benefits, travel, security, notice period, or work from home.', confidence:78, documents:[{...docs.payroll,score:78}], suggestions:['What is the leave policy?','How is PF calculated?','What is the notice period?'] }

export const initialNotifications: NotificationItem[] = [
  { id:'n1', title:'Document uploaded', description:'Employee Benefits.pdf is ready', time:'8 min ago', read:false, tone:'green' },
  { id:'n2', title:'New policy added', description:'FY26 Travel Policy published', time:'2 hours ago', read:false, tone:'blue' },
  { id:'n3', title:'AI assistant updated', description:'Improved source matching is live', time:'Yesterday', read:false, tone:'purple' },
]

export const defaultMetadata: ResponseMetadata = { embeddingModel:'all-MiniLM-L6-v2', llmModel:'GPT-4o-mini', chunksRetrieved:5, latency:'1.24 sec', timestamp:'Jul 15, 2026 · 10:30 AM' }

export const suggestionsByCategory: Record<string,string[]> = {
  'All Policies':['How many casual leaves are allowed?','What is the work from home policy?','How is PF calculated?'],
  Attendance:['What are core working hours?','How is overtime approved?','Can attendance be corrected?'],
  Leave:['Can CL be carried forward?','How many Sick Leaves?','Leave during probation?'],
  Payroll:['How is PF calculated?','When is salary credited?','How is gratuity calculated?'],
  Benefits:['Who can be a dependant?','Is dental treatment covered?','How do I submit a claim?'],
  Travel:['What is the hotel limit?','How do I claim travel expenses?','Is local transport covered?'],
  Recruitment:['How long is probation?','What checks are required?','How are referrals rewarded?'],
  Security:['How do I report phishing?','Can I use a personal device?','What is the password policy?'],
  'Exit Process':['Can notice period be bought out?','How does final settlement work?','When is the experience letter issued?'],
}

// scripts/insertJobRole.js
const { client } = require('../db/index.js');
const { createJobRolesTable,saveJobRole} = require('../models/jobRole.js');

const predefinedTitles = [
    '.NET Developer',
    '3D Animator',
    '3D Modeller',
    '3D Printing Technician',
    '3D Software Engineer',
    'Abrasive Blasting Operator',
    'Absorbent Pad Machine Operator',
    'Academic Advisor',
    'Academic Editor',
    'Academic Support Officer',
    'Accommodation Manager',
    'Account Director',
    'Account Executive',
    'Account Manager',
    'Accountant',
    'Accounting Analyst',
    'Accounting Assistant',
    'Accounting Clerk',
    'Accounting Manager',
    'Accounts Payable Clerk',
    'Accounts Receivable Clerk',
    'Acoustical Engineer',
    'Activism Officer',
    'Activity Leader',
    'Actor/Actress',
    'Actuarial Assistant',
    'Actuarial Consultant',
    'Actuarial Director',
    'Actuary',
    'Acupuncturist',
    'Administration Manager',
    'Administrative Assistant',
    'Admissions Coordinator',
    'Ads Specialist',
    'Adult Community Care Worker',
    'Adult Literacy Teacher',
    'Advanced Analytics Engineer',
    'Advanced Nurse Practitioner',
    'Advanced Physiotherapist',
    'Advertising & Promotions Manager',
    'Advertising Assistant',
    'Advertising Copywriter',
    'Advertising Installer',
    'Advertising Manager',
    'Advertising Media Buyer',
    'Advertising Media Planner',
    'Advertising Sales Agent',
    'Advertising Specialist',
    'Aerodynamics Engineer',
    'Aeronautical Information Service Officer',
    'Aeronautical Information Specialist',
    'Aerospace Engineer',
    'Aerospace Engineering Drafter',
    'Aerospace Engineering Technician',
    'Aesthetician',
    'After-Sales Service Technician',
    'Agile Architect',
    'Agricultural Engineer',
    'Agricultural Equipment Design Engineer',
    'Agricultural Inspector',
    'Agricultural Machinery And Equipment Distribution Manager',
    'Agricultural Machinery Technician',
    'Agricultural Policy Officer',
    'Agricultural Raw Materials, Seeds And Animal Feeds Distribution Manager',
    'Agricultural Scientist',
    'Agricultural Technician',
    'Agriculture, Forestry And Fishery Vocational Teacher',
    'Agronomic Crop Production Team Leader',
    'Agronomist',
    'AI Engineer',
    'Air Force Officer',
    'Air Force Pilot',
    'Air Pollution Analyst',
    'Air Separation Plant Operator',
    'Air Traffic Controller',
    'Air Traffic Instructor',
    'Air Traffic Manager',
    'Air Traffic Safety Technician',
    'Aircraft Assembler',
    'Aircraft Assembly Inspector',
    'Aircraft Assembly Supervisor',
    'Aircraft Cargo Operations Coordinator',
    'Aircraft De-Icer Installer',
    'Aircraft Dispatcher',
    'Aircraft Engine Assembler',
    'Aircraft Engine Inspector',
    'Aircraft Engine Specialist',
    'Aircraft Engine Tester',
    'Aircraft Fuel System Operator',
    'Aircraft Gas Turbine Engine Overhaul Technician',
    'Aircraft Groomer',
    'Aircraft Interior Technician',
    'Aircraft Maintenance Coordinator',
    'Aircraft Maintenance Engineer',
    'Aircraft Maintenance Technician',
    'Aircraft Marshaller',
    'Aircraft Pilot',
    'Airline Food Service Worker',
    'Airline Transport Pilot',
    'Airport Baggage Handler',
    'Airport Chief Executive',
    'Airport Director',
    'Airport Environment Officer',
    'Airport Maintenance Technician',
    'Airport Operations Officer',
    'Airport Planning Engineer',
    'Airport Security Officer',
    'Airside Safety Manager',
    'Airspace Manager',
    'Alternative Animal Therapist',
    'Ambassador',
    'Ammunition Assembler',
    'Ammunition Shop Manager',
    'Ammunition Specialised Seller',
    'Amusement And Recreation Attendant',
    'Amusement Park Cleaner',
    'Anaesthetic Technician',
    'Analyst Programmer',
    'Analytical Chemist',
    'Anatomical Pathology Technician',
    'Android Developer',
    'Angular Developer',
    'Animal Artificial Insemination Technician',
    'Animal Assisted Therapist',
    'Animal Behaviourist',
    'Animal Care Attendant',
    'Animal Chiropractor',
    'Animal Embryo Transfer Technician',
    'Animal Facility Manager',
    'Animal Feed Nutritionist',
    'Animal Feed Operator',
    'Animal Feed Supervisor',
    'Animal Groomer',
    'Animal Handler',
    'Animal Hydrotherapist',
    'Animal Massage Therapist',
    'Animal Osteopath',
    'Animal Physiotherapist',
    'Animal Shelter Worker',
    'Animal Therapist',
    'Animal Trainer',
    'Animal Welfare Inspector',
    'Animation Director',
    'Animation Layout Artist',
    'Animator',
    'Anodising Machine Operator',
    'Anthropologist',
    'Anthropology Lecturer',
    'Antique Furniture Reproducer',
    'Antique Shop Manager',
    'App Developer',
    'Application Developer',
    'Application Engineer',
    'Application Security Engineer',
    'Application Support Specialist',
    'Appointment Setting Agent',
    'Aquaculture Biologist',
    'Backend Developer',
    'B2B Inside Sales',
    'Bookkeeper',
    'Business Analyst',
    'Business Consultant',
    'Business Development Associate',
    'Business Development Manager',
    'Business Intelligence Specialist',
    'Call Center Supervisor',
    'Chief Executive Officer',
    'Chief Financial Officer',
    'Chief Marketing Officer',
    'Chief Operating Officer',
    'Chief Technology Officer',
    'Client Service Representative',
    'Client Support Specialist',
    'Client Success Manager',
    'Cloud Engineer',
    'Community Manager',
    'Compliance Officer',
    'Computer & Information Analyst',
    'Computer & Information Systems Manager',
    'Computer Support Specialist',
    'Content & Digital Marketing Associate',
    'Content Marketing Copywriter',
    'Content Writer',
    'Customer Care Agent',
    'Customer Care Specialist',
    'Customer Experience Specialist',
    'Customer Operations Associate',
    'Customer Relations & Operations Manager',
    'Customer Service Representative',
    'Customer Service Team Lead',
    'Customer Success Manager',
    'Customer Success Representative',
    'Customer Support Agent',
    'Customer Support Representative',
    'Cyber Security Analyst',
    'Data Engineer',
    'Data Entry Specialist',
    'Data Scientist',
    'Database Developer',
    'Database & Network Administrator',
    'Designer',
    'DevOps Engineer',
    'Digital Marketing Analyst',
    'Digital Marketing Manager',
    'Digital Project Manager',
    'Executive Assistant',
    'Field Sales Associate',
    'Flutter Developer',
    'Fontrollesurvers',
    'Frontend Developer',
    'Full Stack Developer',
    'Graphic Designer',
    'Head of Marketing',
    'Head of People',
    'Helpdesk Representative',
    'HRIS Analyst',
    'Human Resources Assistant',
    'Human Resources Consultant',
    'Human Resources Generalist',
    'Human Resources Manager',
    'Human Resources Specialist',
    'Inside Sales Representative',
    'Inside Salesperson',
    'Insurance Sales Agent',
    'Internet Marketer',
    'IT Operations Specialist',
    'Java Developer',
    'JavaScript Developer',
    'Laravel Developer',
    'Legal Assistant',
    'Machine Learning Engineer',
    'Magento 2 Developer',
    'Market Research Analyst',
    'Marketing & Sales Manager',
    'Marketing Associate',
    'Marketing Manager',
    'Mechanical Engineer',
    'Mobile Developer',
    'Node.js Developer',
    'Office Administrator',
    'Office Clerk',
    'Office Manager',
    'Operations Manager',
    'Paralegal',
    'Payroll Specialist',
    'Personal Assistant',
    'PHP Developer',
    'PPC Account Manager',
    'Product Analyst',
    'Product Designer',
    'Product Manager',
    'Product Owner',
    'Production Supervisor',
    'Procurement Manager',
    'Project Manager',
    'Python Developer',
    'QA Analyst',
    'QA Automation Engineer',
    'QA Engineer',
    'QA Testing Manager',
    'React Developer',
    'React Native Developer',
    'Receptionist',
    'Recruiter',
    'Ruby on Rails Developer',
    'Sales Associate',
    'Sales Development Representative',
    'Sales Executive',
    'Sales Manager',
    'Sales Representative',
    'Sales Support Specialist',
    'Scrum Master',
    'Secretary',
    'SEO & Content Marketing Specialist',
    'SEO Specialist',
    'Social Media Coordinator',
    'Social Media Manager',
    'Social Media Marketing Specialist',
    'Social Media Specialist',
    'Solutions Architect',
    'Software Architect',
    'Software Developer',
    'Software Engineer',
    'SQL Developer',
    'Supply Chain Manager',
    'System Administrator',
    'Talent Acquisition Specialist',
    'Tax Advisor',
    'Teach',
    'Technical Project Manager',
    'Technical Recruiter',
    'Technical Support Agent',
    'Technical Support Engineer',
    'Technical Support Specialist',
    'Telesales Agent',
    'Test Engineer',
    'UX Designer',
    'UX/UI designer',
    'Virtual Assistant',
    'Web Developer',
    'Website Developer',
    'WooCommerce Developer',
    'Wood And Construction Materials Distribution Manager',
    'Wood Assembly Supervisor',
    'Wood Boring Machine Operator',
    'Wood Caulker',
    'Wood Drying Kiln Operator',
    'Wood Factory Manager',
    'Wood Fuel Pelletiser',
    'Wood Painter',
    'Wood Pallet Maker',
    'Wood Production Supervisor',
    'Wood Products Assembler',
    'Wood Router Operator',
    'Wood Sander',
    'Wood Technology Engineer',
    'Wood Treater',
    'Woodcarver',
    'Wooden Furniture Machine Operator',
    'Woodturner',
    'WordPress Developer',
    'Writer',
    'Xamarin Developer',
    'Yarn Spinner',
    'Yeast Distiller',
    'Youth Centre Manager',
    'Youth Offending Team Worker',
    'Youth Programme Director',
    'Youth Worker',
    'Zoo Curator',
    'Zoo Educator',
    'Zoo Registrar',
    'Zoo Section Leader',
    'Zookeeper',
    'Zoology Technician'
];

const insertPredefinedJobRoles = async () => {
  try {
    await createJobRolesTable();

    for (const title of predefinedTitles) {
      await saveJobRole(title);
    }
    
    console.log("Predefined job titles inserted successfully");
  } catch (error) {
    console.error("Error inserting predefined job titles:", error);
  } finally {
    client.end(); // Close the database connection
  }
};

insertPredefinedJobRoles();
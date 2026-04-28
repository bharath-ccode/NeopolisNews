// ─── Shared project data for NeopolisNews real-estate pages ─────────────────

export interface LegalApproval {
  documentNumber: string;
  approvedOn: string;
  authority: string;
}

export interface ReraRegistration {
  registrationNumber: string;
  registeredOn: string;
  validUntil: string;
  website: string;
}

export interface LegalStatus {
  developmentPlanApproval?: LegalApproval;
  reraRegistration?: ReraRegistration;
}

export interface ConstructionMilestone {
  id: string;
  date: string;
  milestone: string;
  floorsCompleted?: number;
  totalFloors?: number;
  details?: string;
  media?: string;
  postedBy?: string;
}

export interface OccupationCertificate {
  certificateNumber: string;
  issuedOn: string;
  issuedBy: string;
  validFrom: string;
}

export interface Project {
  id: string;
  name: string;
  developer: string;
  type: string;
  phase: string;
  floors: number;
  units: number;
  carpet: string;
  price: string;
  status: string;
  statusColor: string;
  completion: string;
  progress: number;
  highlight: boolean;
  verified: boolean;
  sponsored: boolean;
  amenities: string[];
  available: number;
  sold: number;
  // Project Progress data
  legalStatus: LegalStatus;
  constructionMilestones: ConstructionMilestone[];
  occupationCertificate?: OccupationCertificate;
}

export const PROJECTS: Project[] = [
  {
    id: "apex-tower",
    name: "Neopolis Apex Tower",
    developer: "Apex Realty Pvt Ltd",
    type: "Luxury Residential",
    phase: "Phase 1",
    floors: 42,
    units: 320,
    carpet: "850 – 2,200 sq ft",
    price: "₹1.2 Cr – ₹3.8 Cr",
    status: "Under Construction",
    statusColor: "tag-orange",
    completion: "December 2026",
    progress: 62,
    highlight: true,
    verified: true,
    sponsored: true,
    amenities: ["Club House", "Rooftop Pool", "EV Parking", "Co-Working"],
    available: 84,
    sold: 236,
    legalStatus: {
      developmentPlanApproval: {
        documentNumber: "DPA/MCGM/2023/NP-APX-00142",
        approvedOn: "12 January 2023",
        authority: "Municipal Corporation of Greater Mumbai (MCGM)",
      },
      reraRegistration: {
        registrationNumber: "P51800047839-APEX",
        registeredOn: "28 February 2023",
        validUntil: "31 December 2026",
        website: "maharera.mahaonline.gov.in",
      },
    },
    constructionMilestones: [
      {
        id: "m1",
        date: "March 2023",
        milestone: "Foundation & Piling Complete",
        details: "Bored cast-in-situ piles, 68 nos. at 32 m depth. Load tests passed.",
        media: "14 photos",
        postedBy: "Apex Realty Site Team",
      },
      {
        id: "m2",
        date: "July 2023",
        milestone: "Basement Levels B1 & B2 Complete",
        details: "Raft foundation poured. Basement waterproofing done. Structural audit clear.",
        media: "22 photos, 1 drone video",
        postedBy: "Apex Realty Site Team",
      },
      {
        id: "m3",
        date: "October 2023",
        milestone: "10 of 42 floors – Civil Works Complete",
        floorsCompleted: 10,
        totalFloors: 42,
        details: "Slab casting for floors 1–10 complete. MEP rough-in work ongoing.",
        media: "18 photos, 2 drone videos",
        postedBy: "Apex Realty Site Team",
      },
      {
        id: "m4",
        date: "April 2024",
        milestone: "20 of 42 floors – Civil Works Complete",
        floorsCompleted: 20,
        totalFloors: 42,
        details: "Floors 11–20 slabs cast. External scaffolding erected. Façade work started on lower floors.",
        media: "25 photos, 2 drone videos",
        postedBy: "Apex Realty Site Team",
      },
      {
        id: "m5",
        date: "October 2024",
        milestone: "30 of 42 floors – Civil Works Complete",
        floorsCompleted: 30,
        totalFloors: 42,
        details: "Structural frame at 30th floor. Glazing and ACP cladding underway on floors 1–15.",
        media: "31 photos, 3 drone videos",
        postedBy: "Apex Realty Site Team",
      },
      {
        id: "m6",
        date: "March 2026",
        milestone: "38 of 42 floors – Civil Works Complete",
        floorsCompleted: 38,
        totalFloors: 42,
        details: "Near-topping-out. Top 4 refuge floors in progress. Internal finishes ongoing for floors 1–25. On schedule for Dec 2026 possession.",
        media: "8 photos, 1 drone video",
        postedBy: "Apex Realty Site Team",
      },
    ],
  },
  {
    id: "neopolis-heights",
    name: "Neopolis Heights",
    developer: "Greenfield Developers",
    type: "Premium Residential",
    phase: "Phase 2",
    floors: 35,
    units: 480,
    carpet: "650 – 1,800 sq ft",
    price: "₹85 L – ₹2.5 Cr",
    status: "New Launch",
    statusColor: "tag-green",
    completion: "March 2028",
    progress: 18,
    highlight: false,
    verified: true,
    sponsored: false,
    amenities: ["Swimming Pool", "Gymnasium", "Kids Zone", "24/7 Security"],
    available: 420,
    sold: 60,
    legalStatus: {
      developmentPlanApproval: {
        documentNumber: "DPA/HMDA/2024/NP-HTS-00389",
        approvedOn: "05 March 2024",
        authority: "Hyderabad Metropolitan Development Authority (HMDA)",
      },
      reraRegistration: {
        registrationNumber: "P02400007231-NHTS",
        registeredOn: "30 April 2024",
        validUntil: "31 March 2028",
        website: "rera.telangana.gov.in",
      },
    },
    constructionMilestones: [
      {
        id: "m1",
        date: "June 2024",
        milestone: "Excavation & Soil Investigation Complete",
        details: "Full site excavation done. Soil bearing capacity report approved by structural consultant.",
        media: "10 photos",
        postedBy: "Greenfield Site Engineers",
      },
      {
        id: "m2",
        date: "October 2024",
        milestone: "Piling & Raft Foundation Complete",
        details: "168 bored piles installed. Raft concrete poured. Foundation approval by HMDA received.",
        media: "16 photos, 1 drone video",
        postedBy: "Greenfield Site Engineers",
      },
      {
        id: "m3",
        date: "March 2026",
        milestone: "6 of 35 floors – Civil Works Complete",
        floorsCompleted: 6,
        totalFloors: 35,
        details: "Podium structure complete. Floors 1–6 slabs cast. Basement car park waterproofing ongoing.",
        media: "6 photos, 2 drone videos",
        postedBy: "Greenfield Site Engineers",
      },
    ],
  },
  {
    id: "business-park",
    name: "Neopolis Business Park",
    developer: "CityEdge Properties",
    type: "Grade A Office",
    phase: "Phase 1",
    floors: 28,
    units: 0,
    carpet: "500 – 50,000 sq ft",
    price: "₹80 – ₹120/sq ft/mo",
    status: "Completed",
    statusColor: "tag-blue",
    completion: "February 2023",
    progress: 100,
    highlight: false,
    verified: true,
    sponsored: false,
    amenities: ["LEED Gold", "Cafeteria", "Conference Rooms", "Basement Parking"],
    available: 12,
    sold: 0,
    legalStatus: {
      developmentPlanApproval: {
        documentNumber: "DPA/GHMC/2020/NP-BPK-00077",
        approvedOn: "14 August 2020",
        authority: "Greater Hyderabad Municipal Corporation (GHMC)",
      },
      reraRegistration: {
        registrationNumber: "P02400003118-NBPK",
        registeredOn: "10 October 2020",
        validUntil: "31 December 2023",
        website: "rera.telangana.gov.in",
      },
    },
    constructionMilestones: [
      {
        id: "m1",
        date: "November 2020",
        milestone: "Foundation & Basement Complete",
        details: "Deep basement with 3 levels of parking. Structural design by Thornton Tomasetti.",
        media: "18 photos",
        postedBy: "CityEdge Project Management",
      },
      {
        id: "m2",
        date: "June 2021",
        milestone: "14 of 28 floors – Civil Works Complete",
        floorsCompleted: 14,
        totalFloors: 28,
        details: "Structural frame at mid-level. High-performance glass curtain wall installation started.",
        media: "24 photos, 2 drone videos",
        postedBy: "CityEdge Project Management",
      },
      {
        id: "m3",
        date: "December 2021",
        milestone: "28 of 28 floors – Topping Out",
        floorsCompleted: 28,
        totalFloors: 28,
        details: "Structural frame complete. Topping-out ceremony held. MEP and fit-out phase begins.",
        media: "40 photos, 4 drone videos",
        postedBy: "CityEdge Project Management",
      },
      {
        id: "m4",
        date: "August 2022",
        milestone: "External Façade & Landscaping Complete",
        details: "LEED Gold façade systems installed. Ground floor plaza and landscaping complete.",
        media: "35 photos, 3 drone videos",
        postedBy: "CityEdge Project Management",
      },
    ],
    occupationCertificate: {
      certificateNumber: "OC/GHMC/2023/NP-BPK-00214",
      issuedOn: "15 February 2023",
      issuedBy: "Greater Hyderabad Municipal Corporation (GHMC)",
      validFrom: "15 February 2023",
    },
  },
  {
    id: "grand-mall",
    name: "Neopolis Grand Mall",
    developer: "Retail Spaces Ltd",
    type: "Retail & Entertainment",
    phase: "Phase 2",
    floors: 5,
    units: 250,
    carpet: "200 – 8,000 sq ft",
    price: "₹120 – ₹200/sq ft/mo",
    status: "Pre-Launch",
    statusColor: "tag-purple",
    completion: "June 2027",
    progress: 28,
    highlight: false,
    verified: true,
    sponsored: true,
    amenities: ["8 Screen PVR", "Food Court", "Kids Entertainment", "Valet"],
    available: 200,
    sold: 50,
    legalStatus: {
      developmentPlanApproval: {
        documentNumber: "DPA/CIDCO/2023/NP-GML-00511",
        approvedOn: "20 September 2023",
        authority: "City & Industrial Development Corporation (CIDCO)",
      },
      // RERA not yet registered — pending for legal complete
    },
    constructionMilestones: [
      {
        id: "m1",
        date: "January 2024",
        milestone: "Site Clearance & Excavation Complete",
        details: "3.2 acre site cleared. Excavation to 9 m depth for basement + service areas.",
        media: "12 photos",
        postedBy: "Retail Spaces Construction",
      },
      {
        id: "m2",
        date: "March 2026",
        milestone: "Foundation & Ground Floor Slab Complete",
        details: "Raft foundation poured. Ground floor retail slab cast. Steel frame erection begins.",
        media: "12 photos",
        postedBy: "Retail Spaces Construction",
      },
    ],
  },
  {
    id: "sky-residences",
    name: "Sky Residences by Neopolis",
    developer: "SkyLine Corp",
    type: "Ultra-Luxury",
    phase: "Phase 3",
    floors: 55,
    units: 120,
    carpet: "2,000 – 5,500 sq ft",
    price: "₹4.5 Cr – ₹18 Cr",
    status: "Pre-Launch",
    statusColor: "tag-purple",
    completion: "December 2028",
    progress: 8,
    highlight: false,
    verified: false,
    sponsored: false,
    amenities: ["Private Pool", "Concierge", "Sky Lounge", "Smart Home"],
    available: 112,
    sold: 8,
    legalStatus: {
      // No approvals yet — land acquisition stage
    },
    constructionMilestones: [],
  },
];

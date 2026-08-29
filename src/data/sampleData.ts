import { 
  DetectionRecord, 
  IncidentRecord, 
  CleanupMission, 
  DroneMission, 
  HotspotRecord, 
  AIModelRecord, 
  DatasetRecord, 
  AlertRecord, 
  UserProfile,
  LiveStreamEvent
} from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Aris Thorne',
    email: 'admin@marinesight.ai',
    role: 'ADMIN',
    organization: 'Global Ocean Observatories / MarineSight AI HQ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-operator',
    name: 'Capt. Maya Vance',
    email: 'operator@marinesight.ai',
    role: 'MARINE_OPERATOR',
    organization: 'Coastal Survey Vessel RV Poseidon',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-researcher',
    name: 'Elena Rostova, Ph.D.',
    email: 'researcher@marinesight.ai',
    role: 'RESEARCHER',
    organization: 'Marine Benthic Acoustic Ecology Lab',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-cleanup',
    name: 'Liam Gallagher',
    email: 'cleanup@marinesight.ai',
    role: 'CLEANUP_TEAM',
    organization: 'Ocean Cleanup Rapid Response Taskforce',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-viewer',
    name: 'Public Environmental Observer',
    email: 'viewer@marinesight.ai',
    role: 'VIEWER',
    organization: 'Independent Marine Conservationist',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  }
];

export const SAMPLE_DETECTIONS: DetectionRecord[] = [
  {
    id: 'GV-1024',
    title: 'Submerged Filamentous Ghost Net',
    category: 'Ghost Fishing Gear',
    source: 'SONAR',
    confidence: 0.94,
    qualityScore: 91,
    severity: 'CRITICAL',
    location: {
      lat: 10.9541,
      lng: 78.0812,
      depthMeters: 28.5,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Palk Bay Acoustic Transect'
    },
    timestamp: '2026-08-27T01:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    processedImageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    status: 'Verified',
    boundingBoxes: [
      { x: 120, y: 140, width: 260, height: 210, label: 'Ghost Net (94%)', confidence: 0.94 }
    ],
    estimatedDimensions: '16.5m x 8.2m',
    estimatedWeightKg: 320,
    acousticSignature: 'High-backscatter diffuse mesh shadow with acoustic highlight',
    aiExplanation: 'Detected elongated high-contrast diffuse acoustic matrix consistent with abandoned nylon gillnet suspended across reef pinnacles.',
    isDemo: true
  },
  {
    id: 'GV-1025',
    title: 'Discarded Wire Crab Trap Aggregation',
    category: 'Derelict Crab Pot',
    source: 'SONAR',
    confidence: 0.91,
    qualityScore: 88,
    severity: 'HIGH',
    location: {
      lat: 10.9510,
      lng: 78.0845,
      depthMeters: 32.0,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Outer Reef Channel'
    },
    timestamp: '2026-08-27T00:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&auto=format&fit=crop&q=80',
    status: 'Incident Created',
    boundingBoxes: [
      { x: 220, y: 180, width: 140, height: 130, label: 'Crab Pot (91%)', confidence: 0.91 }
    ],
    estimatedDimensions: '1.8m x 1.8m',
    estimatedWeightKg: 85,
    acousticSignature: 'Geometric square acoustic shadow with corner reflection peaks',
    aiExplanation: 'Crisp rectangular acoustic shadow with internal metallic resonance characteristics matches MarineSight AI crab pot classification RF model.',
    isDemo: true
  },
  {
    id: 'GV-1026',
    title: 'Floating High-Density Plastic Slick',
    category: 'Plastic',
    source: 'DRONE',
    confidence: 0.89,
    qualityScore: 93,
    severity: 'HIGH',
    location: {
      lat: 10.9582,
      lng: 78.0790,
      depthMeters: 0,
      sector: 'Sector 4A - North Transect',
      areaName: 'Surface Gyre Convergence'
    },
    timestamp: '2026-08-26T23:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    status: 'Verified',
    boundingBoxes: [
      { x: 80, y: 120, width: 340, height: 230, label: 'Plastic Cluster (89%)', confidence: 0.89 }
    ],
    estimatedDimensions: '12.0m x 4.5m',
    estimatedWeightKg: 190,
    opticalSignature: 'Multispectral polymer reflectance anomaly in 850nm NIR band',
    aiExplanation: 'YOLOv8-Marine model segmented surface polymer aggregation with 89% confidence.',
    isDemo: true
  },
  {
    id: 'GV-1027',
    title: 'Dual-Layer Fused Ghost Gear Matrix',
    category: 'Ghost Fishing Gear',
    source: 'FUSION',
    confidence: 0.96,
    qualityScore: 96,
    severity: 'CRITICAL',
    location: {
      lat: 10.9544,
      lng: 78.0815,
      depthMeters: 26.8,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Marine Sanctuary Buffer'
    },
    timestamp: '2026-08-26T22:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    status: 'Incident Created',
    boundingBoxes: [
      { x: 100, y: 90, width: 380, height: 280, label: 'Fused Ghost Gear (96%)', confidence: 0.96 }
    ],
    estimatedDimensions: '24.0m x 11.5m',
    estimatedWeightKg: 540,
    acousticSignature: 'Fused Sonar Benthos Shadow + Aerial Marker Buoy Coordinates (Delta 3.4m)',
    aiExplanation: 'Multimodal spatial correlation engine joined aerial drone surface buoy detection with acoustic seafloor net shadow.',
    isDemo: true
  },
  {
    id: 'GV-1028',
    title: 'Submerged Industrial Truck Tire',
    category: 'Tire',
    source: 'SONAR',
    confidence: 0.87,
    qualityScore: 85,
    severity: 'MEDIUM',
    location: {
      lat: 10.9420,
      lng: 78.0920,
      depthMeters: 19.5,
      sector: 'Sector 5 - Anchorage Zone',
      areaName: 'Port Approach Fairway'
    },
    timestamp: '2026-08-26T21:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&auto=format&fit=crop&q=80',
    status: 'Verified',
    boundingBoxes: [
      { x: 190, y: 210, width: 110, height: 110, label: 'Tire (87%)', confidence: 0.87 }
    ],
    estimatedDimensions: '1.2m diameter',
    estimatedWeightKg: 75,
    acousticSignature: 'Toroidal acoustic shadow with dense perimeter wall reflection',
    aiExplanation: 'Clear annular acoustic shadow characteristic of rubberized heavy vehicle wheel.',
    isDemo: true
  },
  {
    id: 'GV-1029',
    title: 'Polypropylene Trawl Line Coil',
    category: 'Fishing Line',
    source: 'CAMERA',
    confidence: 0.88,
    qualityScore: 90,
    severity: 'HIGH',
    location: {
      lat: 10.9630,
      lng: 78.0750,
      depthMeters: 0,
      sector: 'Sector 3 - Outer Bay',
      areaName: 'Reef Crest'
    },
    timestamp: '2026-08-26T19:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    status: 'Unverified',
    boundingBoxes: [
      { x: 140, y: 160, width: 220, height: 170, label: 'Trawl Line (88%)', confidence: 0.88 }
    ],
    estimatedDimensions: '45m total length coiled',
    estimatedWeightKg: 60,
    opticalSignature: 'Bright yellow-orange braided rope with fraying fibers',
    aiExplanation: 'Vessel bow camera detected tangled synthetic mooring/trawl line floating in shipping channel.',
    isDemo: true
  },
  {
    id: 'GV-1030',
    title: 'Corroded Metal Drum with Residue',
    category: 'Metal Debris',
    source: 'SONAR',
    confidence: 0.92,
    qualityScore: 92,
    severity: 'HIGH',
    location: {
      lat: 10.9380,
      lng: 78.0890,
      depthMeters: 36.2,
      sector: 'Sector 5 - Anchorage Zone',
      areaName: 'Deep Sand Shelf'
    },
    timestamp: '2026-08-26T18:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    status: 'Incident Created',
    boundingBoxes: [
      { x: 250, y: 170, width: 95, height: 140, label: 'Metal Drum (92%)', confidence: 0.92 }
    ],
    estimatedDimensions: '0.9m x 1.3m',
    estimatedWeightKg: 110,
    acousticSignature: 'Sharp specular reflection with deep trailing shadow',
    aiExplanation: 'High acoustic contrast cylinder partially buried in sediment.',
    isDemo: true
  },
  {
    id: 'GV-1031',
    title: 'Sunken Wooden Vessel Fragment',
    category: 'Marine Anomaly',
    source: 'SONAR',
    confidence: 0.79,
    qualityScore: 82,
    severity: 'MEDIUM',
    location: {
      lat: 10.9710,
      lng: 78.0680,
      depthMeters: 22.4,
      sector: 'Sector 2 - Heritage Shoals',
      areaName: 'Old Channel Pass'
    },
    timestamp: '2026-08-26T16:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    status: 'Verified',
    boundingBoxes: [
      { x: 110, y: 150, width: 310, height: 180, label: 'Hull Ribs (79%)', confidence: 0.79 }
    ],
    estimatedDimensions: '8.4m x 3.1m',
    estimatedWeightKg: 650,
    acousticSignature: 'Repetitive parallel ribbing acoustic reflection pattern',
    aiExplanation: 'Acoustic texture suggests decaying wooden vessel ribs rather than synthetic hazardous debris.',
    isDemo: true
  },
  {
    id: 'GV-1032',
    title: 'Floating Beverage Can Cluster',
    category: 'Can',
    source: 'DRONE',
    confidence: 0.85,
    qualityScore: 87,
    severity: 'LOW',
    location: {
      lat: 10.9610,
      lng: 78.0820,
      depthMeters: 0,
      sector: 'Sector 4A - North Transect',
      areaName: 'Tidal Rip Current'
    },
    timestamp: '2026-08-26T14:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    status: 'Archived',
    boundingBoxes: [
      { x: 210, y: 190, width: 80, height: 75, label: 'Aluminum Cans (85%)', confidence: 0.85 }
    ],
    estimatedDimensions: '1.2m x 0.8m',
    estimatedWeightKg: 8.5,
    opticalSignature: 'Metallic specular glint in aerial RGB channel',
    aiExplanation: 'Low-density consumer aluminum packaging caught in surface weed raft.',
    isDemo: true
  },
  {
    id: 'GV-1033',
    title: 'Heavy Nylon Monofilament Braid',
    category: 'Fishing Net',
    source: 'CAMERA',
    confidence: 0.93,
    qualityScore: 94,
    severity: 'HIGH',
    location: {
      lat: 10.9520,
      lng: 78.0770,
      depthMeters: 4.2,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Coral Pinnacle Flank'
    },
    timestamp: '2026-08-26T12:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    status: 'Incident Created',
    boundingBoxes: [
      { x: 130, y: 100, width: 270, height: 240, label: 'Net Snag (93%)', confidence: 0.93 }
    ],
    estimatedDimensions: '11.0m x 6.0m',
    estimatedWeightKg: 140,
    opticalSignature: 'Translucent blue-green diamond mesh wrapped on coral heads',
    aiExplanation: 'Underwater ROV camera detected active reef smothering by commercial fishing net.',
    isDemo: true
  }
];

// Generate 40 additional realistic detections to total 50+ records
for (let i = 1034; i <= 1074; i++) {
  const categories: any[] = ['Ghost Fishing Gear', 'Plastic', 'Fishing Net', 'Derelict Crab Pot', 'Tire', 'Metal Debris', 'Bottle', 'Unknown Debris'];
  const sources: any[] = ['SONAR', 'DRONE', 'CAMERA', 'FUSION'];
  const severities: any[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const cat = categories[i % categories.length];
  const src = sources[i % sources.length];
  const sev = severities[i % severities.length];
  const lat = Number((10.9300 + (i % 30) * 0.0025).toFixed(4));
  const lng = Number((78.0600 + (i % 25) * 0.0028).toFixed(4));
  
  SAMPLE_DETECTIONS.push({
    id: `GV-${i}`,
    title: `${cat} Detection Record #${i}`,
    category: cat,
    source: src,
    confidence: Number((0.72 + (i % 25) * 0.01).toFixed(2)),
    qualityScore: Math.floor(75 + (i % 22)),
    severity: sev,
    location: {
      lat,
      lng,
      depthMeters: src === 'SONAR' ? Number((15 + (i % 20) * 1.2).toFixed(1)) : 0,
      sector: `Sector ${(i % 6) + 1}`,
      areaName: `Maritime Grid Loc ${String.fromCharCode(65 + (i % 6))}-${(i % 12) + 1}`
    },
    timestamp: new Date(Date.now() - (i - 1000) * 3600000 * 4).toISOString(),
    imageUrl: src === 'SONAR' 
      ? 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80' 
      : 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    status: (i % 3 === 0) ? 'Incident Created' : (i % 2 === 0 ? 'Verified' : 'Unverified'),
    boundingBoxes: [
      { x: 120 + (i % 80), y: 110 + (i % 60), width: 140 + (i % 100), height: 120 + (i % 80), label: `${cat} (${Math.round((0.72 + (i % 25) * 0.01) * 100)}%)`, confidence: 0.85 }
    ],
    estimatedDimensions: `${(2 + (i % 10)).toFixed(1)}m x ${(1 + (i % 6)).toFixed(1)}m`,
    estimatedWeightKg: Math.floor(25 + (i % 30) * 12),
    aiExplanation: `Automated detection validated by MarineSight AI ${src} processing pipeline with confidence ${Math.round((0.72 + (i % 25) * 0.01) * 100)}%.`,
    isDemo: true
  });
}

export const SAMPLE_INCIDENTS: IncidentRecord[] = [
  {
    id: 'INC-9042',
    title: 'Large-Scale Monofilament Ghost Net Entangled on Benthic Reef',
    category: 'Ghost Fishing Gear',
    source: 'FUSION',
    severity: 'CRITICAL',
    confidence: 0.96,
    status: 'IN_PROGRESS',
    location: {
      lat: 10.9544,
      lng: 78.0815,
      depthMeters: 28.5,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Marine Sanctuary Core Zone'
    },
    priorityScore: 96,
    assignedTeam: 'Alpha Diver Unit - Ghost Gear Rapid Response',
    assignedVessel: 'RV Ocean-Guardian (Winch Equipped)',
    createdDate: '2026-08-25T10:30:00Z',
    updatedDate: '2026-08-27T02:15:00Z',
    reportedBy: 'MarineSight AI Multimodal Fusion Pipeline',
    notes: [
      'Aerial drone buoy sighted and correlated with 28.5m seafloor sonar shadow.',
      'Diver recon team deployed at 06:00 UTC. Rigging safety cutting lines.',
      'Estimated 350kg synthetic net material threatening endangered sea turtles.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: ['GV-1024', 'GV-1027'],
    bioRiskLevel: 'CRITICAL',
    estimatedRemovalEffortHours: 12
  },
  {
    id: 'INC-9043',
    title: 'Cluster of 8 Derelict Wire Crab Pots in Main Trawl Lane',
    category: 'Derelict Crab Pot',
    source: 'SONAR',
    severity: 'HIGH',
    confidence: 0.91,
    status: 'ASSIGNED',
    location: {
      lat: 10.9510,
      lng: 78.0845,
      depthMeters: 32.0,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Outer Reef Channel'
    },
    priorityScore: 88,
    assignedTeam: 'Delta Recovery Crew',
    assignedVessel: 'Tug Nautilus 02',
    createdDate: '2026-08-26T04:10:00Z',
    updatedDate: '2026-08-26T18:30:00Z',
    reportedBy: 'Capt. Maya Vance (Sonar Scan Transect 04)',
    notes: [
      'Sonar classification confirmed 8 discrete crab pot targets.',
      'Grappling hook deployment scheduled for afternoon ebb tide.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: ['GV-1025'],
    bioRiskLevel: 'HIGH',
    estimatedRemovalEffortHours: 8
  },
  {
    id: 'INC-9044',
    title: 'Dense Surface Plastic Debris Slick in Convergence Eddy',
    category: 'Plastic',
    source: 'DRONE',
    severity: 'HIGH',
    confidence: 0.89,
    status: 'NEW',
    location: {
      lat: 10.9582,
      lng: 78.0790,
      depthMeters: 0,
      sector: 'Sector 4A - North Transect',
      areaName: 'Surface Gyre Convergence'
    },
    priorityScore: 82,
    createdDate: '2026-08-26T23:45:00Z',
    updatedDate: '2026-08-27T01:00:00Z',
    reportedBy: 'Drone Mission DM-08 (Automated YOLOv8-Marine)',
    notes: [
      'Drift vector heading 215° at 0.8 knots toward mangrove estuary.',
      'Immediate containment boom barrier recommended.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: ['GV-1026'],
    bioRiskLevel: 'HIGH',
    estimatedRemovalEffortHours: 6
  },
  {
    id: 'INC-9045',
    title: 'Abandoned Heavy Steel Mooring Drum',
    category: 'Metal Debris',
    source: 'SONAR',
    severity: 'MEDIUM',
    confidence: 0.92,
    status: 'VERIFIED',
    location: {
      lat: 10.9380,
      lng: 78.0890,
      depthMeters: 36.2,
      sector: 'Sector 5 - Anchorage Zone',
      areaName: 'Deep Sand Shelf'
    },
    priorityScore: 68,
    createdDate: '2026-08-25T14:20:00Z',
    updatedDate: '2026-08-26T11:00:00Z',
    reportedBy: 'RV Poseidon Acoustic Surveyor',
    notes: [
      'Verified by Chief Sonar Analyst. No imminent toxic leak detected.',
      'Scheduled for routine heavy crane extraction in Mission 09.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: ['GV-1030'],
    bioRiskLevel: 'MEDIUM',
    estimatedRemovalEffortHours: 5
  },
  {
    id: 'INC-9046',
    title: 'Commercial Trawl Net Snagged on Coral Shelf - Successfully Extracted',
    category: 'Fishing Net',
    source: 'FUSION',
    severity: 'HIGH',
    confidence: 0.95,
    status: 'RESOLVED',
    location: {
      lat: 10.9480,
      lng: 78.0720,
      depthMeters: 18.2,
      sector: 'Sector 3 - Coral Shelf',
      areaName: 'Shoal Reef East'
    },
    priorityScore: 90,
    assignedTeam: 'Alpha Diver Unit',
    assignedVessel: 'RV Ocean-Guardian',
    createdDate: '2026-08-20T08:00:00Z',
    updatedDate: '2026-08-24T16:45:00Z',
    reportedBy: 'MarineSight AI Marine Intelligence',
    notes: [
      'Incident successfully resolved by Diver Team Alpha.',
      '420 kg of entangled monofilament trawl netting safely hauled aboard.',
      'No diver injuries; coral damage mitigated.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    beforeImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: ['GV-1012'],
    bioRiskLevel: 'HIGH',
    estimatedRemovalEffortHours: 14
  }
];

// Add more incidents to reach 15 total
for (let j = 7; j <= 17; j++) {
  const cats: any[] = ['Plastic', 'Ghost Fishing Gear', 'Tire', 'Metal Debris', 'Fishing Line'];
  const statuses: any[] = ['NEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  const cat = cats[j % cats.length];
  const st = statuses[j % statuses.length];
  SAMPLE_INCIDENTS.push({
    id: `INC-${9040 + j}`,
    title: `${cat} Incident in Sector ${(j % 5) + 1}`,
    category: cat,
    source: j % 2 === 0 ? 'SONAR' : 'DRONE',
    severity: j % 3 === 0 ? 'CRITICAL' : (j % 2 === 0 ? 'HIGH' : 'MEDIUM'),
    confidence: Number((0.82 + (j % 15) * 0.01).toFixed(2)),
    status: st,
    location: {
      lat: Number((10.9400 + (j % 10) * 0.003).toFixed(4)),
      lng: Number((78.0700 + (j % 12) * 0.003).toFixed(4)),
      depthMeters: j % 2 === 0 ? 24.5 : 0,
      sector: `Sector ${(j % 5) + 1}`,
      areaName: `Maritime Region ${j}`
    },
    priorityScore: Math.floor(65 + (j % 30)),
    assignedTeam: st !== 'NEW' ? 'Coastal Taskforce Crew' : undefined,
    assignedVessel: st !== 'NEW' ? 'Support Vessel Sea-Hawk' : undefined,
    createdDate: new Date(Date.now() - j * 86400000 * 1.5).toISOString(),
    updatedDate: new Date().toISOString(),
    reportedBy: 'MarineSight AI Operations',
    notes: [`Target logged in active environmental database. Status: ${st}`],
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: [`GV-10${20 + j}`],
    bioRiskLevel: j % 3 === 0 ? 'CRITICAL' : 'HIGH',
    estimatedRemovalEffortHours: 4 + (j % 8)
  });
}

export const SAMPLE_CLEANUP_MISSIONS: CleanupMission[] = [
  {
    id: 'MSN-201',
    title: 'Operation Blue Shield - Sector 4 Ghost Net Recovery',
    status: 'ACTIVE',
    teamName: 'Alpha Diver Unit',
    vesselName: 'RV Ocean-Guardian',
    leader: 'Cmdr. Liam Gallagher',
    targetIncidents: ['INC-9042', 'INC-9043'],
    locationName: 'Palk Bay Sanctuary Reef (Sector 4B)',
    scheduledDate: '2026-08-27T06:00:00Z',
    debrisCollectedKg: 280,
    highRiskResolvedCount: 1,
    fuelEfficiencyIndex: 94,
    routeCoordinates: [
      [10.9400, 78.0750],
      [10.9500, 78.0800],
      [10.9544, 78.0815],
      [10.9580, 78.0840]
    ],
    beforePhoto: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    notes: 'Active recovery mission deploying specialized pneumatic shears and acoustic beacon transponders.'
  },
  {
    id: 'MSN-202',
    title: 'Surface Micro & Macro Plastic Skimming Sweep',
    status: 'COMPLETED',
    teamName: 'EcoSkim Marine Crew',
    vesselName: 'Skimmer-Cat 01',
    leader: 'Lt. Sarah Chen',
    targetIncidents: ['INC-9046'],
    locationName: 'Shoal Reef East Channel',
    scheduledDate: '2026-08-24T07:00:00Z',
    completedDate: '2026-08-24T18:00:00Z',
    debrisCollectedKg: 640,
    highRiskResolvedCount: 2,
    fuelEfficiencyIndex: 91,
    routeCoordinates: [
      [10.9450, 78.0700],
      [10.9480, 78.0720],
      [10.9520, 78.0750]
    ],
    beforePhoto: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    notes: 'Successfully cleared 640kg of polymer debris and 1 derelict trawl net.'
  },
  {
    id: 'MSN-203',
    title: 'Heavy Subsurface Mooring & Tire Extraction',
    status: 'PLANNED',
    teamName: 'Heavy Salvage Unit Bravo',
    vesselName: 'Crane Barge Hercules',
    leader: 'Arthur Pendelton',
    targetIncidents: ['INC-9045'],
    locationName: 'Sector 5 Anchorage Zone',
    scheduledDate: '2026-08-29T08:00:00Z',
    debrisCollectedKg: 0,
    highRiskResolvedCount: 0,
    routeCoordinates: [
      [10.9350, 78.0850],
      [10.9380, 78.0890]
    ],
    notes: 'Planned deployment of 40-ton crane for submerged industrial debris removal.'
  }
];

// Add 7 more cleanup missions to reach 10 total
for (let m = 4; m <= 10; m++) {
  SAMPLE_CLEANUP_MISSIONS.push({
    id: `MSN-20${m}`,
    title: `Coastal Clean Sweep Mission 0${m}`,
    status: m <= 5 ? 'COMPLETED' : (m === 6 ? 'ACTIVE' : 'PLANNED'),
    teamName: `Taskforce Group ${String.fromCharCode(65 + m)}`,
    vesselName: `Patrol Vessel Defender 0${m}`,
    leader: `Captain Officer ${m}`,
    targetIncidents: [`INC-904${m}`],
    locationName: `Sector ${(m % 5) + 1} Coastal Reef`,
    scheduledDate: new Date(Date.now() - (10 - m) * 86400000 * 2).toISOString(),
    completedDate: m <= 5 ? new Date(Date.now() - (10 - m) * 86400000 * 2 + 36000000).toISOString() : undefined,
    debrisCollectedKg: m <= 5 ? 320 + m * 85 : 0,
    highRiskResolvedCount: m <= 5 ? 1 + (m % 3) : 0,
    routeCoordinates: [
      [10.9400 + m * 0.002, 78.0700 + m * 0.002],
      [10.9500 + m * 0.002, 78.0800 + m * 0.002]
    ],
    notes: `Mission protocol #${m} targeting high-risk benthic accumulation.`
  });
}

export const SAMPLE_DRONE_MISSIONS: DroneMission[] = [
  {
    id: 'DM-101',
    missionName: 'Aerial Transect Survey Alpha - Gulf of Mannar',
    droneModel: 'Matrice 350 RTK + Multispectral Sensor',
    pilot: 'Operator Jason Vance',
    flightPath: [
      [10.950, 78.075],
      [10.955, 78.080],
      [10.960, 78.085],
      [10.955, 78.090],
      [10.950, 78.075]
    ],
    coverageAreaKm2: 4.8,
    durationMinutes: 42,
    detectionsCount: 9,
    averageConfidence: 0.91,
    date: '2026-08-27T02:00:00Z',
    status: 'COMPLETED'
  },
  {
    id: 'DM-102',
    missionName: 'Surface Convergence Gyre Patrol Beta',
    droneModel: 'WingtraOne GEN II VTOL',
    pilot: 'Auto-Pilot System 04',
    flightPath: [
      [10.960, 78.070],
      [10.970, 78.078],
      [10.965, 78.088],
      [10.960, 78.070]
    ],
    coverageAreaKm2: 8.2,
    durationMinutes: 58,
    detectionsCount: 14,
    averageConfidence: 0.88,
    date: '2026-08-26T21:30:00Z',
    status: 'COMPLETED'
  },
  {
    id: 'DM-103',
    missionName: 'Live Tidal Stream Surveillance Delta',
    droneModel: 'Matrice 350 RTK - Thermal/Optical',
    pilot: 'Operator Jason Vance',
    flightPath: [
      [10.945, 78.080],
      [10.952, 78.083],
      [10.958, 78.085]
    ],
    coverageAreaKm2: 3.1,
    durationMinutes: 25,
    detectionsCount: 4,
    averageConfidence: 0.93,
    date: '2026-08-27T03:10:00Z',
    status: 'IN_FLIGHT'
  }
];

export const SAMPLE_HOTSPOTS: HotspotRecord[] = [
  {
    id: 'HS-01',
    name: 'Mannar Sanctuary Benthic Gyre',
    sector: 'Sector 4B',
    centerLat: 10.9541,
    centerLng: 78.0812,
    radiusMeters: 450,
    detectionCount: 19,
    dominantCategory: 'Ghost Fishing Gear',
    riskScore: 94,
    recurrenceIndex: 9.2,
    lastActivity: '2026-08-27T02:15:00Z',
    currentVelocityKnots: 0.42
  },
  {
    id: 'HS-02',
    name: 'Palk Strait Tidal Convergence Rip',
    sector: 'Sector 4A',
    centerLat: 10.9582,
    centerLng: 78.0790,
    radiusMeters: 380,
    detectionCount: 15,
    dominantCategory: 'Plastic',
    riskScore: 86,
    recurrenceIndex: 8.4,
    lastActivity: '2026-08-26T23:30:00Z',
    currentVelocityKnots: 0.85
  },
  {
    id: 'HS-03',
    name: 'Anchorage Channel South Deposition Trench',
    sector: 'Sector 5',
    centerLat: 10.9380,
    centerLng: 78.0890,
    radiusMeters: 620,
    detectionCount: 11,
    dominantCategory: 'Metal Debris',
    riskScore: 78,
    recurrenceIndex: 7.1,
    lastActivity: '2026-08-26T18:00:00Z',
    currentVelocityKnots: 0.28
  },
  {
    id: 'HS-04',
    name: 'Outer Barrier Reef Pinnacles',
    sector: 'Sector 3',
    centerLat: 10.9630,
    centerLng: 78.0750,
    radiusMeters: 510,
    detectionCount: 13,
    dominantCategory: 'Fishing Line',
    riskScore: 82,
    recurrenceIndex: 7.9,
    lastActivity: '2026-08-26T19:40:00Z',
    currentVelocityKnots: 0.61
  },
  {
    id: 'HS-05',
    name: 'Old Channel Heritage Shoals',
    sector: 'Sector 2',
    centerLat: 10.9710,
    centerLng: 78.0680,
    radiusMeters: 300,
    detectionCount: 6,
    dominantCategory: 'Marine Anomaly',
    riskScore: 54,
    recurrenceIndex: 4.8,
    lastActivity: '2026-08-26T16:00:00Z',
    currentVelocityKnots: 0.35
  }
];

export const SAMPLE_AI_MODELS: AIModelRecord[] = [
  {
    id: 'MOD-01',
    name: 'MarineSight AI Sonar Acoustic Net & Pot Detector',
    version: 'v3.2.0-rf-acoustic',
    task: 'SONAR_ACOUSTIC',
    classes: ['Ghost Net', 'Crab Pot', 'Tire', 'Metal Drum', 'Hull Anomaly'],
    precision: 0.934,
    recall: 0.912,
    mAP: 0.923,
    dataset: 'DS-SONAR-GLOBAL-2026 (18,400 acoustic frames)',
    dateTrained: '2026-07-14',
    status: 'ACTIVE',
    architecture: 'Random Forest + Acoustic Backscatter Shadow Feature Pyramid'
  },
  {
    id: 'MOD-02',
    name: 'MarineSight AI YOLOv8-Marine Surface Vision',
    version: 'v2.8.4-yolov8x',
    task: 'SURFACE_YOLO',
    classes: ['Floating Plastic', 'Buoy', 'Monofilament Line', 'Cans', 'Bottles', 'Trawl Webbing'],
    precision: 0.948,
    recall: 0.925,
    mAP: 0.936,
    dataset: 'DS-DRONE-OPTICAL-v4 (24,500 labeled frames)',
    dateTrained: '2026-08-02',
    status: 'ACTIVE',
    architecture: 'Custom DarkNet Backbone + Multispectral Fusion Layer'
  },
  {
    id: 'MOD-03',
    name: 'MarineSight AI Multimodal Marine Fusion Engine',
    version: 'v2.1.0-spatial-temporal',
    task: 'MULTIMODAL_FUSION',
    classes: ['Confirmed Ghost Gear', 'Surface Polymer Slick', 'Submerged Hazard', 'Natural Debris'],
    precision: 0.962,
    recall: 0.941,
    mAP: 0.952,
    dataset: 'DS-MULTIMODAL-PAIRED-v2 (6,800 paired missions)',
    dateTrained: '2026-08-10',
    status: 'ACTIVE',
    architecture: 'Spatial-Temporal Bayesian Graph Neural Association'
  },
  {
    id: 'MOD-04',
    name: 'Oceanic Hydrodynamic Drift & Debris Accumulation Net',
    version: 'v1.4.2-eddy-drift',
    task: 'RISK_DRIFT',
    classes: ['Critical Accumulation', 'High Recurrence', 'Dispersal Zone'],
    precision: 0.892,
    recall: 0.870,
    mAP: 0.881,
    dataset: 'NOAA + Copernicus Ocean Current Reanalysis',
    dateTrained: '2026-06-20',
    status: 'ACTIVE',
    architecture: 'LSTM + Physics-Informed Neural Network (PINN)'
  },
  {
    id: 'MOD-05',
    name: 'Experimental Deep Sea Side-Scan Transformer',
    version: 'v0.9.0-transformer-experimental',
    task: 'SONAR_ACOUSTIC',
    classes: ['Ghost Gear', 'Benthic Reef', 'Sand Ribs', 'Man-Made Object'],
    precision: 0.915,
    recall: 0.884,
    mAP: 0.901,
    dataset: 'DS-SONAR-SYNTHETIC-DEEP',
    dateTrained: '2026-08-20',
    status: 'TESTING',
    architecture: 'Vision Transformer (ViT-Large) with Acoustic Positional Encoding'
  }
];

export const SAMPLE_DATASETS: DatasetRecord[] = [
  {
    id: 'DS-01',
    name: 'Global Side-Scan Sonar Marine Debris Benchmark',
    version: 'v3.2',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 18400,
    annotationsCount: 42100,
    classesCount: 6,
    trainValTestSplit: '70% / 15% / 15%',
    qualityScore: 94,
    lastUpdated: '2026-08-15',
    formats: ['.PNG', '.XTF', '.JSF', '.DAT', '.SL2']
  },
  {
    id: 'DS-02',
    name: 'Aerial Drone Marine Litter Optical & Multispectral',
    version: 'v4.0',
    type: 'SURFACE_AERIAL',
    imagesCount: 24500,
    annotationsCount: 68900,
    classesCount: 12,
    trainValTestSplit: '75% / 15% / 10%',
    qualityScore: 96,
    lastUpdated: '2026-08-20',
    formats: ['.JPG', '.MP4', '.GeoTIFF']
  },
  {
    id: 'DS-03',
    name: 'Benthic Reef Underwater ROV Entanglement Imagery',
    version: 'v2.1',
    type: 'UNDERWATER_OPTICAL',
    imagesCount: 9200,
    annotationsCount: 21400,
    classesCount: 8,
    trainValTestSplit: '70% / 20% / 10%',
    qualityScore: 91,
    lastUpdated: '2026-07-28',
    formats: ['.JPG', '.PNG', '.RAW']
  },
  {
    id: 'DS-04',
    name: 'Multimodal Paired Acoustic-Optical Co-Registrations',
    version: 'v1.8',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 6800,
    annotationsCount: 19500,
    classesCount: 5,
    trainValTestSplit: '80% / 10% / 10%',
    qualityScore: 98,
    lastUpdated: '2026-08-10',
    formats: ['.JSON', '.XTF', '.GeoJSON']
  }
];

export const SAMPLE_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-101',
    title: 'CRITICAL: High-Risk Ghost Fishing Gear Fused Incident',
    message: 'Multimodal fusion confirmed active ghost net with surface marker in Sector 4B Marine Sanctuary.',
    type: 'CRITICAL_DEBRIS',
    severity: 'CRITICAL',
    timestamp: '2026-08-27T02:30:00Z',
    isRead: false,
    relatedIncidentId: 'INC-9042'
  },
  {
    id: 'ALT-102',
    title: 'NEW RECURRING HOTSPOT IDENTIFIED',
    message: 'Mannar Sanctuary Benthic Gyre has exceeded 15 detections within 500m radius.',
    type: 'NEW_HOTSPOT',
    severity: 'HIGH',
    timestamp: '2026-08-26T22:00:00Z',
    isRead: false
  },
  {
    id: 'ALT-103',
    title: 'Drone Survey DM-101 Completed',
    message: 'Autonomous drone detected 9 surface debris targets along flight corridor Alpha.',
    type: 'FUSED_ALERT',
    severity: 'MEDIUM',
    timestamp: '2026-08-27T02:45:00Z',
    isRead: true
  },
  {
    id: 'ALT-104',
    title: 'Cleanup Mission MSN-201 Diver Unit Dispatched',
    message: 'RV Ocean-Guardian has arrived on site at Sector 4B for underwater winch recovery.',
    type: 'FUSED_ALERT',
    severity: 'LOW',
    timestamp: '2026-08-27T03:00:00Z',
    isRead: true,
    relatedIncidentId: 'INC-9042'
  }
];

export const INITIAL_LIVE_STREAM: LiveStreamEvent[] = [
  {
    id: 'LIVE-01',
    timestamp: '03:02:15',
    source: 'SONAR',
    category: 'Ghost Fishing Gear',
    confidence: 0.94,
    location: 'Sector 4B (28.5m depth)',
    severity: 'CRITICAL'
  },
  {
    id: 'LIVE-02',
    timestamp: '03:02:44',
    source: 'DRONE',
    category: 'Plastic',
    confidence: 0.89,
    location: 'North Transect (Surface)',
    severity: 'HIGH'
  },
  {
    id: 'LIVE-03',
    timestamp: '03:03:10',
    source: 'FUSION',
    category: 'Ghost Fishing Gear',
    confidence: 0.96,
    location: 'Marine Sanctuary Core',
    severity: 'CRITICAL'
  },
  {
    id: 'LIVE-04',
    timestamp: '03:03:32',
    source: 'CAMERA',
    category: 'Fishing Line',
    confidence: 0.88,
    location: 'Reef Crest Pinnacle',
    severity: 'HIGH'
  },
  {
    id: 'LIVE-05',
    timestamp: '03:03:50',
    source: 'SONAR',
    category: 'Derelict Crab Pot',
    confidence: 0.91,
    location: 'Outer Reef Channel',
    severity: 'HIGH'
  }
];

export const DRONE_MISSIONS_DATA = [
  {
    id: 'DM-101',
    model: 'AeroVessel Marine Scout Pro',
    status: 'IN_FLIGHT',
    battery: 84,
    altitudeMeters: 35,
    speedKnots: 18.2,
    sector: 'Sector 4B - Gulf of Mannar',
    detectionsLogged: 9,
    flightPath: [
      { lat: 10.954, lng: 78.081 },
      { lat: 10.958, lng: 78.084 },
      { lat: 10.962, lng: 78.080 },
      { lat: 10.954, lng: 78.081 }
    ]
  },
  {
    id: 'DM-102',
    model: 'Skylark Multispectral UAV-X',
    status: 'RETURNING',
    battery: 28,
    altitudeMeters: 42,
    speedKnots: 22.0,
    sector: 'Sector 2A - Palk Bay Estuary',
    detectionsLogged: 14,
    flightPath: [
      { lat: 10.970, lng: 78.065 },
      { lat: 10.975, lng: 78.070 },
      { lat: 10.968, lng: 78.062 }
    ]
  },
  {
    id: 'DM-103',
    model: 'HoverEye Autonomous Hexacopter',
    status: 'STANDBY',
    battery: 100,
    altitudeMeters: 0,
    speedKnots: 0,
    sector: 'Sector 1C - Coral Trench Base',
    detectionsLogged: 0,
    flightPath: [
      { lat: 10.940, lng: 78.090 },
      { lat: 10.945, lng: 78.095 }
    ]
  }
];

export const AI_MODELS_DATA = [
  {
    id: 'MOD-01',
    name: 'SonarNet-YOLOv8 Dual-Channel',
    version: 'v2.4.1',
    architecture: 'Side-Scan Sonar Slant-Range & Acoustic Shadow CNN',
    status: 'ACTIVE',
    mapScore: 94.8,
    latencyMs: 14,
    precision: 95.2,
    lastTrained: '2026-08-20',
    classesSupported: ['Ghost Net', 'Derelict Crab Pot', 'Tire', 'Metal Drum', 'Natural Reef']
  },
  {
    id: 'MOD-02',
    name: 'YOLOv8-Marine Aerial Debris Vision',
    version: 'v3.1.0',
    architecture: 'Multispectral RGB + 850nm NIR Drone Model',
    status: 'ACTIVE',
    mapScore: 96.2,
    latencyMs: 8,
    precision: 96.8,
    lastTrained: '2026-08-22',
    classesSupported: ['Floating Plastic Matrix', 'Ghost Net Buoy', 'Mooring Line', 'Polymer Slick']
  },
  {
    id: 'MOD-03',
    name: 'Multimodal Spatial-Temporal Fusion Engine',
    version: 'v2.0.0',
    architecture: 'Bayesian Acoustic-Optical Co-Registration Graph Network',
    status: 'ACTIVE',
    mapScore: 97.4,
    latencyMs: 22,
    precision: 98.1,
    lastTrained: '2026-08-24',
    classesSupported: ['High-Risk Fused Incident', 'Submerged Entanglement Hazard', 'Drifting Buoy Matrix']
  },
  {
    id: 'MOD-04',
    name: 'MarineSight AI Copilot Gemini 2.5 Flash',
    version: 'v2.5-flash',
    architecture: 'Multimodal Oceanographic LLM & Risk Reasoning Core',
    status: 'ACTIVE',
    mapScore: 98.9,
    latencyMs: 420,
    precision: 99.1,
    lastTrained: '2026-08-26',
    classesSupported: ['Acoustic Interpretation', 'Triage Recommendation', 'Cleanup Route Optimization']
  }
];

export const DATASETS_DATA = [
  {
    id: 'DS-01',
    name: 'Global Side-Scan Sonar Marine Debris Benchmark',
    format: 'COCO + SL2',
    description: 'High-frequency hydroacoustic side-scan transects containing ghost gear, crab pots, and seabed anomalies.',
    sampleCount: '18,400 scans',
    splitRatio: '70 / 15 / 15',
    classes: ['Ghost Net', 'Crab Pot', 'Tire', 'Metal Drum', 'Coral Pinnacle'],
    lastUpdated: '2026-08-15'
  },
  {
    id: 'DS-02',
    name: 'Aerial Drone Marine Litter Optical & Multispectral',
    format: 'YOLOv8 Darknet',
    description: 'RGB and 850nm NIR UAV imagery capturing floating plastic debris, nets, ropes, and buoys in Gulf of Mannar.',
    sampleCount: '24,500 frames',
    splitRatio: '75 / 15 / 10',
    classes: ['Plastic Matrix', 'Net Buoy', 'Rope', 'Polymer Slick', 'Foam Float'],
    lastUpdated: '2026-08-20'
  },
  {
    id: 'DS-03',
    name: 'Multimodal Paired Acoustic-Optical Co-Registrations',
    format: 'GeoJSON + JSON',
    description: 'Spatially synchronized side-scan sonar and drone aerial observations of submerged debris sites.',
    sampleCount: '6,800 pairs',
    splitRatio: '80 / 10 / 10',
    classes: ['Entangled Reef', 'Ghost Webbing Array', 'Sunken Line Cluster'],
    lastUpdated: '2026-08-10'
  }
];


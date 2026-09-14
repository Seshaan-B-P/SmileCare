// Tooth Chart Definitions & Fresh Production Data Structure (No Mock Patient Data)

export const TEETH_DEFINITIONS = [
  // Upper Right Quadrant (Teeth 1 - 8)
  { id: 1, fdi: '18', name: 'Upper Right 3rd Molar (Wisdom)', type: 'molar', arch: 'upper', side: 'right' },
  { id: 2, fdi: '17', name: 'Upper Right 2nd Molar', type: 'molar', arch: 'upper', side: 'right' },
  { id: 3, fdi: '16', name: 'Upper Right 1st Molar', type: 'molar', arch: 'upper', side: 'right' },
  { id: 4, fdi: '15', name: 'Upper Right 2nd Premolar', type: 'premolar', arch: 'upper', side: 'right' },
  { id: 5, fdi: '14', name: 'Upper Right 1st Premolar', type: 'premolar', arch: 'upper', side: 'right' },
  { id: 6, fdi: '13', name: 'Upper Right Canine (Cuspid)', type: 'canine', arch: 'upper', side: 'right' },
  { id: 7, fdi: '12', name: 'Upper Right Lateral Incisor', type: 'incisor', arch: 'upper', side: 'right' },
  { id: 8, fdi: '11', name: 'Upper Right Central Incisor', type: 'incisor', arch: 'upper', side: 'right' },

  // Upper Left Quadrant (Teeth 9 - 16)
  { id: 9, fdi: '21', name: 'Upper Left Central Incisor', type: 'incisor', arch: 'upper', side: 'left' },
  { id: 10, fdi: '22', name: 'Upper Left Lateral Incisor', type: 'incisor', arch: 'upper', side: 'left' },
  { id: 11, fdi: '23', name: 'Upper Left Canine (Cuspid)', type: 'canine', arch: 'upper', side: 'left' },
  { id: 12, fdi: '24', name: 'Upper Left 1st Premolar', type: 'premolar', arch: 'upper', side: 'left' },
  { id: 13, fdi: '25', name: 'Upper Left 2nd Premolar', type: 'premolar', arch: 'upper', side: 'left' },
  { id: 14, fdi: '26', name: 'Upper Left 1st Molar', type: 'molar', arch: 'upper', side: 'left' },
  { id: 15, fdi: '27', name: 'Upper Left 2nd Molar', type: 'molar', arch: 'upper', side: 'left' },
  { id: 16, fdi: '28', name: 'Upper Left 3rd Molar (Wisdom)', type: 'molar', arch: 'upper', side: 'left' },

  // Lower Left Quadrant (Teeth 17 - 24)
  { id: 17, fdi: '38', name: 'Lower Left 3rd Molar (Wisdom)', type: 'molar', arch: 'lower', side: 'left' },
  { id: 18, fdi: '37', name: 'Lower Left 2nd Molar', type: 'molar', arch: 'lower', side: 'left' },
  { id: 19, fdi: '36', name: 'Lower Left 1st Molar', type: 'molar', arch: 'lower', side: 'left' },
  { id: 20, fdi: '35', name: 'Lower Left 2nd Premolar', type: 'premolar', arch: 'lower', side: 'left' },
  { id: 21, fdi: '34', name: 'Lower Left 1st Premolar', type: 'premolar', arch: 'lower', side: 'left' },
  { id: 22, fdi: '33', name: 'Lower Left Canine (Cuspid)', type: 'canine', arch: 'lower', side: 'left' },
  { id: 23, fdi: '32', name: 'Lower Left Lateral Incisor', type: 'incisor', arch: 'lower', side: 'left' },
  { id: 24, fdi: '31', name: 'Lower Left Central Incisor', type: 'incisor', arch: 'lower', side: 'left' },

  // Lower Right Quadrant (Teeth 25 - 32)
  { id: 25, fdi: '41', name: 'Lower Right Central Incisor', type: 'incisor', arch: 'lower', side: 'right' },
  { id: 26, fdi: '42', name: 'Lower Right Lateral Incisor', type: 'incisor', arch: 'lower', side: 'right' },
  { id: 27, fdi: '43', name: 'Lower Right Canine (Cuspid)', type: 'canine', arch: 'lower', side: 'right' },
  { id: 28, fdi: '44', name: 'Lower Right 1st Premolar', type: 'premolar', arch: 'lower', side: 'right' },
  { id: 29, fdi: '45', name: 'Lower Right 2nd Premolar', type: 'premolar', arch: 'lower', side: 'right' },
  { id: 30, fdi: '46', name: 'Lower Right 1st Molar', type: 'molar', arch: 'lower', side: 'right' },
  { id: 31, fdi: '47', name: 'Lower Right 2nd Molar', type: 'molar', arch: 'lower', side: 'right' },
  { id: 32, fdi: '48', name: 'Lower Right 3rd Molar (Wisdom)', type: 'molar', arch: 'lower', side: 'right' }
];

export const CONDITION_TYPES = {
  cavity: {
    label: 'Cavity / Decay',
    color: 'bg-red-500 text-white border-red-600',
    badge: 'bg-red-100 text-red-700 border-red-200',
    iconColor: '#EF4444',
    code: 'CAV'
  },
  filling: {
    label: 'Composite Filling',
    color: 'bg-blue-500 text-white border-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: '#3B82F6',
    code: 'FIL'
  },
  root_canal: {
    label: 'Root Canal Treatment (RCT)',
    color: 'bg-purple-600 text-white border-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    iconColor: '#9333EA',
    code: 'RCT'
  },
  crown: {
    label: 'Dental Crown / Cap',
    color: 'bg-amber-500 text-white border-amber-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: '#F59E0B',
    code: 'CRN'
  },
  extraction: {
    label: 'Extraction Needed',
    color: 'bg-rose-700 text-white border-rose-800',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    iconColor: '#BE123C',
    code: 'EXT'
  },
  implant: {
    label: 'Dental Implant',
    color: 'bg-teal-500 text-white border-teal-600',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    iconColor: '#14B8A6',
    code: 'IMP'
  },
  missing: {
    label: 'Missing Tooth',
    color: 'bg-slate-400 text-white border-slate-500',
    badge: 'bg-slate-200 text-slate-700 border-slate-300',
    iconColor: '#94A3B8',
    code: 'MIS'
  }
};

export const STANDARD_SERVICES = [
  { id: 'srv_1', name: 'General Consultation & Oral Exam', defaultFee: 500, category: 'Diagnostic' },
  { id: 'srv_2', name: 'Scaling & Full Mouth Polishing', defaultFee: 1500, category: 'Preventive' },
  { id: 'srv_3', name: 'Composite Cavity Filling (Single Tooth)', defaultFee: 1200, category: 'Restorative' },
  { id: 'srv_4', name: 'Root Canal Treatment (Single Canal)', defaultFee: 4500, category: 'Endodontics' },
  { id: 'srv_5', name: 'Zirconia / Porcelain Crown', defaultFee: 8500, category: 'Prosthodontics' },
  { id: 'srv_6', name: 'Surgical Tooth Extraction', defaultFee: 2500, category: 'Oral Surgery' },
  { id: 'srv_7', name: 'Titanium Dental Implant', defaultFee: 28000, category: 'Implantology' },
  { id: 'srv_8', name: 'Laser Teeth Whitening Session', defaultFee: 6000, category: 'Cosmetic' }
];

export const RX_TEMPLATES = [
  {
    name: 'Post-Extraction Pain & Infection Care',
    medicines: [
      { name: 'Amoxicillin 500mg (Cipla)', dosage: '500 mg', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'Take after meals' },
      { name: 'Ketorolac DT 10mg (Dr. Reddy)', dosage: '10 mg', frequency: '1-0-1 (Twice daily)', duration: '3 days', instructions: 'Dissolve in half glass water after food' },
      { name: 'Pantoprazole 40mg (Pan-40)', dosage: '40 mg', frequency: '1-0-0 (Morning)', duration: '5 days', instructions: 'Take 30 mins before breakfast' }
    ]
  },
  {
    name: 'Root Canal Pain Relief & Antibiotic Protocol',
    medicines: [
      { name: 'Augmentin 625mg (GlaxoSmithKline)', dosage: '625 mg', frequency: '1-0-1 (Twice daily)', duration: '5 days', instructions: 'Take after heavy meals' },
      { name: 'Zerodol-P (Aceclofenac 100mg + Paracetamol 325mg)', dosage: '1 Tab', frequency: '1-1-1 (Thrice daily)', duration: '4 days', instructions: 'Take with full glass of water' },
      { name: 'Clohex 0.2% Oral Rinse', dosage: '10 ml', frequency: '1-0-1 (Twice daily)', duration: '7 days', instructions: 'Swish for 60 seconds after brushing' }
    ]
  }
];

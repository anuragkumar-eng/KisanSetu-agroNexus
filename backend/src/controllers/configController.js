// Static configuration data

const cropTypes = [
  { value: 'wheat',   label: 'Wheat',   labelHi: 'गेहूँ',    emoji: '🌾' },
  { value: 'rice',    label: 'Rice',    labelHi: 'धान',      emoji: '🍚' },
  { value: 'onion',   label: 'Onion',   labelHi: 'प्याज़',   emoji: '🧅' },
  { value: 'potato',  label: 'Potato',  labelHi: 'आलू',      emoji: '🥔' },
  { value: 'tomato',  label: 'Tomato',  labelHi: 'टमाटर',    emoji: '🍅' },
  { value: 'soybean', label: 'Soybean', labelHi: 'सोयाबीन',  emoji: '🌿' },
  { value: 'cotton',  label: 'Cotton',  labelHi: 'कपास',     emoji: '☁️' },
  { value: 'maize',   label: 'Maize',   labelHi: 'मक्का',    emoji: '🌽' },
  { value: 'mustard', label: 'Mustard', labelHi: 'सरसों',    emoji: '🌼' },
  { value: 'sugarcane',label:'Sugarcane',labelHi:'गन्ना',    emoji: '🎋' },
  { value: 'turmeric',label: 'Turmeric',labelHi: 'हल्दी',   emoji: '🫚' },
  { value: 'chilli',  label: 'Chilli',  labelHi: 'मिर्च',   emoji: '🌶️' },
];

const qualityGrades = [
  { value: 'grade_a', label: 'Grade A', labelHi: 'ग्रेड A - सर्वोच्च' },
  { value: 'grade_b', label: 'Grade B', labelHi: 'ग्रेड B - मध्यम' },
  { value: 'grade_c', label: 'Grade C', labelHi: 'ग्रेड C - साधारण' },
  { value: 'export',  label: 'Export Grade', labelHi: 'निर्यात ग्रेड' },
];

// @desc    Get master list of supported crop types
// @route   GET /api/config/crops
// @access  Public
const getCrops = (req, res) => {
  res.json({
    success: true,
    data: cropTypes
  });
};

// @desc    Get quality grade options
// @route   GET /api/config/quality-grades
// @access  Public
const getQualityGrades = (req, res) => {
  res.json({
    success: true,
    data: qualityGrades
  });
};

module.exports = {
  getCrops,
  getQualityGrades
};

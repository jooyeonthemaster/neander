const fs = require('fs');
const ko = JSON.parse(fs.readFileSync('messages/ko.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

const namespaces = ['metadata','nav','hero','services','stats','portfolio','about','quote','demo','contact','footer','common','errors','validation','accessibility','cookie','faq','scentQuiz','photoBooth'];

console.log('=== Namespace check ===');
let allOk = true;
namespaces.forEach(ns => {
  const inKo = ns in ko;
  const inEn = ns in en;
  if (inKo === false || inEn === false) {
    console.log('MISSING: ' + ns + ' - ko:' + inKo + ' en:' + inEn);
    allOk = false;
  }
});
if (allOk) console.log('All namespaces present in both files');

// scentQuiz keys
console.log('\n=== scentQuiz keys ===');
const sqKeys = ['moodTitle','moodSubtitle','moodCalm','moodEnergetic','moodRomantic','moodMysterious','colorTitle','colorSubtitle','colorRose','colorAmber','colorTeal','colorViolet','colorSky','colorLime','colorSlate','colorCream','memoryTitle','memorySubtitle','memBeach','memForest','memLibrary','memCity','memCafe','memGarden','intensityTitle','intensitySubtitle','intensityLabel','subtle','intense','back','next','seeResult','analyzing','analyzingSubtitle','complete','selectUpTo','yourScent','topNotes','middleNotes','baseNotes','ctaMessage','ctaButton','tryAgain'];
const missingSqKo = sqKeys.filter(k => ko.scentQuiz[k] === undefined);
const missingSqEn = sqKeys.filter(k => en.scentQuiz[k] === undefined);
if (missingSqKo.length) console.log('Missing scentQuiz ko:', missingSqKo);
if (missingSqEn.length) console.log('Missing scentQuiz en:', missingSqEn);
if (missingSqKo.length === 0 && missingSqEn.length === 0) console.log('scentQuiz: all keys present');

// photoBooth keys
console.log('\n=== photoBooth keys ===');
const pbKeys = ['category','title','subtitle','uploadLabel','dragOrClick','dropHere','upTo','uploadedImage','processing','ctaMessage','ctaButton','tryAgain','errorNotImage','errorTooLarge','selectStyle','styles'];
const missingPbKo = pbKeys.filter(k => ko.photoBooth[k] === undefined);
const missingPbEn = pbKeys.filter(k => en.photoBooth[k] === undefined);
if (missingPbKo.length) console.log('Missing photoBooth ko:', missingPbKo);
if (missingPbEn.length) console.log('Missing photoBooth en:', missingPbEn);
if (missingPbKo.length === 0 && missingPbEn.length === 0) console.log('photoBooth: all keys present');

// demo page keys
console.log('\n=== demo page keys ===');
const demoKeys = ['metaTitle','metaDescription','category','tryIt'];
const missingDemoKo = demoKeys.filter(k => ko.demo[k] === undefined);
const missingDemoEn = demoKeys.filter(k => en.demo[k] === undefined);
if (missingDemoKo.length) console.log('Missing demo ko:', missingDemoKo);
if (missingDemoEn.length) console.log('Missing demo en:', missingDemoEn);
if (missingDemoKo.length === 0 && missingDemoEn.length === 0) console.log('demo page keys: all present');

// demo sub-pages
console.log('demo[scent-quiz] ko:', ko.demo['scent-quiz'] ? 'present' : 'MISSING');
console.log('demo[photo-booth] ko:', ko.demo['photo-booth'] ? 'present' : 'MISSING');
console.log('demo[scent-quiz] en:', en.demo['scent-quiz'] ? 'present' : 'MISSING');
console.log('demo[photo-booth] en:', en.demo['photo-booth'] ? 'present' : 'MISSING');

// Sub-page meta keys
if (ko.demo['scent-quiz']) {
  ['metaTitle','metaDescription'].forEach(k => {
    if (ko.demo['scent-quiz'][k] === undefined) console.log('MISSING ko demo.scent-quiz.' + k);
    if (en.demo['scent-quiz'][k] === undefined) console.log('MISSING en demo.scent-quiz.' + k);
  });
}
if (ko.demo['photo-booth']) {
  ['metaTitle','metaDescription'].forEach(k => {
    if (ko.demo['photo-booth'][k] === undefined) console.log('MISSING ko demo.photo-booth.' + k);
    if (en.demo['photo-booth'][k] === undefined) console.log('MISSING en demo.photo-booth.' + k);
  });
}

// quote keys
console.log('\n=== quote keys ===');
const quoteKeys = ['step','prev','next','summaryReview','summaryDescription','eventDetailsTitle','eventDetailsSubtitle','eventType','duration','decrease','increase','days','multiplier','expectedAttendees','people','venueSize','venueSizes','location','locationPlaceholder','preferredDate','serviceTitle','serviceSubtitle','services','from','added','add','configure','customServiceCTA','options','each','subtotal','removeService','addOnsTitle','addOnsSubtitle','addOnsLabel','quoteSummary','selectedServices','durationMultiplier','estimatedTotal','manwon','emptyServices','requestQuote','reset'];
const missingQKo = quoteKeys.filter(k => ko.quote[k] === undefined);
const missingQEn = quoteKeys.filter(k => en.quote[k] === undefined);
if (missingQKo.length) console.log('Missing quote ko:', missingQKo);
if (missingQEn.length) console.log('Missing quote en:', missingQEn);
if (missingQKo.length === 0 && missingQEn.length === 0) console.log('quote: all keys present');

// quote.eventTypes.brand-event
console.log('\nquote.eventTypes[brand-event] ko:', ko.quote.eventTypes['brand-event'] ? 'present' : 'MISSING');
console.log('quote.eventTypes[brand-event] en:', en.quote.eventTypes['brand-event'] ? 'present' : 'MISSING');

// Check quote.services sub-keys
console.log('\n=== quote.services sub-keys ===');
['acscent','photoBooth','mediaArt','spatialDesign','rental'].forEach(svc => {
  if (ko.quote.services[svc] === undefined) console.log('MISSING ko quote.services.' + svc);
  else if (ko.quote.services[svc].name === undefined) console.log('MISSING ko quote.services.' + svc + '.name');
  if (en.quote.services[svc] === undefined) console.log('MISSING en quote.services.' + svc);
  else if (en.quote.services[svc].name === undefined) console.log('MISSING en quote.services.' + svc + '.name');
});
console.log('quote.services sub-keys check done');

// Check quote.addOns sub-keys from pricing.ts
console.log('\n=== quote.addOns labelKeys ===');
['operationStaff','brandedPackaging','dataAnalytics','extendedHours','remoteMonitoring'].forEach(k => {
  if (ko.quote.addOns[k] === undefined) console.log('MISSING ko quote.addOns.' + k);
  if (en.quote.addOns[k] === undefined) console.log('MISSING en quote.addOns.' + k);
});
console.log('quote.addOns labelKeys check done');

// Check quote.options sub-keys from pricing.ts
console.log('\n=== quote.options sub-keys ===');
const optionKeys = ['capacityPerHour','cap20','cap40','cap60','customScentDesign','premiumPackaging','numberOfBooths','printType','qrOnly','instantPrint','photoCard','aiStyleCount','complexityTier','standard','premium','fullCustom','motionSensors','venueArea','areaSmall','areaMedium','areaLarge','photoZoneDesign','customLighting','aiKiosk','cameraSetup','instantPrinter'];
optionKeys.forEach(k => {
  if (ko.quote.options[k] === undefined) console.log('MISSING ko quote.options.' + k);
  if (en.quote.options[k] === undefined) console.log('MISSING en quote.options.' + k);
});
console.log('quote.options sub-keys check done');

// photoBooth styles sub-keys
console.log('\n=== photoBooth.styles sub-keys ===');
['watercolor','pixel','retro','cyberpunk'].forEach(k => {
  if (ko.photoBooth.styles[k] === undefined) console.log('MISSING ko photoBooth.styles.' + k);
  if (en.photoBooth.styles[k] === undefined) console.log('MISSING en photoBooth.styles.' + k);
});
console.log('photoBooth.styles check done');

console.log('\n=== VALIDATION COMPLETE ===');

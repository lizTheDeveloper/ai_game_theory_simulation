const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Create presentation
const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = 'MARCUS Platform Team';
pptx.company = 'AI Game Theory Simulation';
pptx.subject = 'MARCUS 3.2 - Enterprise Citation Integrity Platform';
pptx.title = 'MARCUS 3.2 Product Demo';

// Define layout (16:9 widescreen)
pptx.defineLayout({ name: 'CUSTOM_16_9', width: 10, height: 5.625 });
pptx.layout = 'CUSTOM_16_9';

// Color scheme
const colors = {
  black: '000000',
  white: 'FFFFFF',
  cyan: '00F0FF',
  green: '00FF88',
  red: 'FF0040',
  orange: 'FFB000',
  darkGray: '0A0A0A'
};

// ========== SLIDE 1: Title ==========
const slide1 = pptx.addSlide();
slide1.background = { color: colors.black };

// Add cyan glow lines
slide1.addShape(pptx.shapes.LINE, {
  x: 0, y: 0.8, w: 10, h: 0,
  line: { color: colors.cyan, width: 2, transparency: 50 }
});

slide1.addText('MARCUS', {
  x: 0, y: 1.8, w: 10, h: 1,
  fontSize: 52, bold: true, color: colors.white,
  align: 'center', fontFace: 'Arial'
});

slide1.addText('Enterprise Citation Integrity Platform', {
  x: 0, y: 2.8, w: 10, h: 0.6,
  fontSize: 28, color: colors.cyan,
  align: 'center', fontFace: 'Arial'
});

slide1.addText('Multi-Agent Research Consensus for Production AI Systems', {
  x: 0, y: 4.8, w: 10, h: 0.4,
  fontSize: 16, color: colors.white,
  align: 'center', fontFace: 'Arial'
});

slide1.addText('v3.2', {
  x: 8.5, y: 0.3, w: 1.2, h: 0.3,
  fontSize: 14, color: colors.cyan,
  align: 'right', fontFace: 'Courier New'
});

// ========== SLIDE 2: Problem ==========
const slide2 = pptx.addSlide();
slide2.background = { color: colors.black };

slide2.addText('THE PROBLEM', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, bold: true, color: colors.red,
  fontFace: 'Arial'
});

// Stats boxes
slide2.addShape(pptx.shapes.RECTANGLE, {
  x: 0.5, y: 1.2, w: 4.2, h: 1.2,
  fill: { color: colors.red, transparency: 95 },
  line: { color: colors.red, width: 1 }
});

slide2.addText('67%', {
  x: 0.7, y: 1.4, w: 3.8, h: 0.5,
  fontSize: 42, bold: true, color: colors.red,
  fontFace: 'Courier New'
});

slide2.addText('AI citations are hallucinated', {
  x: 0.7, y: 1.9, w: 3.8, h: 0.3,
  fontSize: 14, color: colors.white,
  fontFace: 'Arial'
});

slide2.addShape(pptx.shapes.RECTANGLE, {
  x: 5.3, y: 1.2, w: 4.2, h: 1.2,
  fill: { color: colors.red, transparency: 95 },
  line: { color: colors.red, width: 1 }
});

slide2.addText('$2.3M', {
  x: 5.5, y: 1.4, w: 3.8, h: 0.5,
  fontSize: 42, bold: true, color: colors.red,
  fontFace: 'Courier New'
});

slide2.addText('Average cost of misinformation incident', {
  x: 5.5, y: 1.9, w: 3.8, h: 0.3,
  fontSize: 14, color: colors.white,
  fontFace: 'Arial'
});

// Problem list
const problems = [
  'Single-agent verification fails at scale',
  'No consensus mechanism for citation accuracy',
  'Manual review bottlenecks deployment',
  'Existing solutions lack behavioral diversity',
  'Zero observability into citation decision-making'
];

problems.forEach((problem, index) => {
  slide2.addText(`⚠ ${problem}`, {
    x: 0.5, y: 2.8 + (index * 0.4), w: 9, h: 0.3,
    fontSize: 16, color: colors.white,
    fontFace: 'Arial'
  });
});

// ========== SLIDE 3: Solution ==========
const slide3 = pptx.addSlide();
slide3.background = { color: colors.black };

slide3.addText('THE SOLUTION', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

// Solution cards
const solutions = [
  { icon: '🤖', title: '9 BEHAVIORAL AGENTS', desc: 'Diverse verification strategies prevent groupthink' },
  { icon: '🎯', title: 'CONSENSUS ALGORITHM', desc: 'Weighted voting with reputation tracking' },
  { icon: '🧠', title: 'NESTED LEARNING', desc: 'Meta-learning from collective decisions' }
];

solutions.forEach((sol, index) => {
  const x = 0.5 + (index * 3.2);

  slide3.addShape(pptx.shapes.RECTANGLE, {
    x: x, y: 1.3, w: 3, h: 1.8,
    fill: { color: colors.cyan, transparency: 95 },
    line: { color: colors.cyan, width: 1 }
  });

  slide3.addText(sol.icon, {
    x: x, y: 1.4, w: 3, h: 0.6,
    fontSize: 32, align: 'center'
  });

  slide3.addText(sol.title, {
    x: x + 0.1, y: 2.0, w: 2.8, h: 0.4,
    fontSize: 14, bold: true, color: colors.white,
    align: 'center', fontFace: 'Arial'
  });

  slide3.addText(sol.desc, {
    x: x + 0.1, y: 2.4, w: 2.8, h: 0.6,
    fontSize: 11, color: colors.white,
    align: 'center', fontFace: 'Arial'
  });
});

// Key feature box
slide3.addShape(pptx.shapes.RECTANGLE, {
  x: 0.5, y: 3.5, w: 9, h: 1.5,
  fill: { color: colors.cyan, transparency: 90 },
  line: { color: colors.cyan, width: 2 }
});

slide3.addText('PRODUCTION-READY PLATFORM', {
  x: 0.7, y: 3.7, w: 8.6, h: 0.4,
  fontSize: 18, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

slide3.addText('Kubernetes-native deployment with auto-scaling, distributed tracing, and enterprise security. Process 40+ citations/second with 99.9% uptime SLA.', {
  x: 0.7, y: 4.1, w: 8.6, h: 0.7,
  fontSize: 14, color: colors.white,
  fontFace: 'Arial', valign: 'top'
});

// ========== SLIDE 4: Results ==========
const slide4 = pptx.addSlide();
slide4.background = { color: colors.black };

slide4.addText('KEY RESULTS', {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 36, bold: true, color: colors.green,
  fontFace: 'Arial'
});

const metrics = [
  { value: '2.8x', label: 'THROUGHPUT INCREASE', detail: 'From 15 to 42 citations/second' },
  { value: '63%', label: 'COST REDUCTION', detail: 'From $120 to $45/month' },
  { value: '94%', label: 'CITATION ACCURACY', detail: 'Multi-agent consensus validation' },
  { value: '<5min', label: 'MTTR', detail: 'With distributed tracing' }
];

metrics.forEach((metric, index) => {
  const x = 0.5 + (index % 2) * 4.75;
  const y = 1.3 + Math.floor(index / 2) * 2;

  slide4.addShape(pptx.shapes.RECTANGLE, {
    x: x, y: y, w: 4.25, h: 1.7,
    fill: { color: colors.green, transparency: 92 },
    line: { color: colors.green, width: 1 }
  });

  slide4.addText(metric.value, {
    x: x + 0.1, y: y + 0.2, w: 4.05, h: 0.6,
    fontSize: 36, bold: true, color: colors.green,
    align: 'center', fontFace: 'Courier New'
  });

  slide4.addText(metric.label, {
    x: x + 0.1, y: y + 0.8, w: 4.05, h: 0.3,
    fontSize: 14, bold: true, color: colors.white,
    align: 'center', fontFace: 'Arial'
  });

  slide4.addText(metric.detail, {
    x: x + 0.1, y: y + 1.2, w: 4.05, h: 0.4,
    fontSize: 12, color: colors.white,
    align: 'center', fontFace: 'Arial'
  });
});

// ========== SLIDE 5: Architecture ==========
const slide5 = pptx.addSlide();
slide5.background = { color: colors.black };

slide5.addText('SYSTEM ARCHITECTURE', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

// Add architecture diagram using shapes
const archLayers = [
  { y: 1.0, components: ['API Gateway', 'Load Balancer', 'Monitoring'] },
  { y: 2.3, components: ['Orchestrator Pods', '9 Agent Workers'], highlight: true },
  { y: 3.6, components: ['PostgreSQL', 'Redis Cluster', 'GKE Infrastructure'] }
];

archLayers.forEach(layer => {
  const width = 9 / layer.components.length - 0.2;
  layer.components.forEach((comp, index) => {
    const x = 0.5 + index * (width + 0.2);

    slide5.addShape(pptx.shapes.RECTANGLE, {
      x: x, y: layer.y, w: width, h: 1,
      fill: { color: layer.highlight ? colors.green : colors.cyan, transparency: 93 },
      line: { color: layer.highlight ? colors.green : colors.cyan, width: 1 }
    });

    slide5.addText(comp, {
      x: x + 0.1, y: layer.y + 0.3, w: width - 0.2, h: 0.4,
      fontSize: 12, bold: true,
      color: layer.highlight ? colors.green : colors.cyan,
      align: 'center', fontFace: 'Arial'
    });
  });
});

// ========== SLIDE 6: Performance Table ==========
const slide6 = pptx.addSlide();
slide6.background = { color: colors.black };

slide6.addText('PERFORMANCE IMPROVEMENTS', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

// Create performance comparison table
const tableData = [
  ['Metric', 'Before', 'After', 'Improvement'],
  ['Metrics Cardinality', '25,000', '10,000', '60% ↓'],
  ['Redis Memory', 'OOM Daily', 'Stable 2GB', '100% Fix'],
  ['Citation Throughput', '15/sec', '42/sec', '2.8x ↑'],
  ['API Latency (P95)', '450ms', '180ms', '60% ↓'],
  ['Database Queries', 'O(n²)', 'O(1)', '100x ↑'],
  ['Platform Cost', '$120/mo', '$45/mo', '63% ↓'],
  ['Platform Health', '7.5/10', '10/10', 'Perfect']
];

slide6.addTable(tableData, {
  x: 0.5, y: 1.0, w: 9, h: 4,
  fontSize: 12,
  fontFace: 'Courier New',
  color: colors.white,
  fill: { color: colors.black },
  border: { pt: 1, color: colors.cyan },
  colW: [3.5, 1.5, 1.5, 1.5]
});

// ========== SLIDE 7: Agents ==========
const slide7 = pptx.addSlide();
slide7.background = { color: colors.black };

slide7.addText('BEHAVIORAL AGENT DIVERSITY', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

const agents = [
  'Fact Checker', 'Format Validator', 'Relevance Scorer',
  'Skeptic*', 'Devil\'s Advocate*', 'Synthesis Expert*',
  'Context Analyzer', 'Authority Verifier', 'Temporal Validator'
];

agents.forEach((agent, index) => {
  const x = 0.5 + (index % 3) * 3.2;
  const y = 1.0 + Math.floor(index / 3) * 1.0;
  const isSpecial = agent.includes('*');
  const cleanName = agent.replaceAll('*', '');

  slide7.addShape(pptx.shapes.RECTANGLE, {
    x: x, y: y, w: 3, h: 0.8,
    fill: { color: isSpecial ? colors.green : colors.cyan, transparency: 93 },
    line: { color: isSpecial ? colors.green : colors.cyan, width: 1 }
  });

  slide7.addText(cleanName, {
    x: x + 0.1, y: y + 0.25, w: 2.8, h: 0.3,
    fontSize: 11, bold: true,
    color: isSpecial ? colors.green : colors.cyan,
    align: 'center', fontFace: 'Arial'
  });
});

// Consensus note
slide7.addShape(pptx.shapes.RECTANGLE, {
  x: 0.5, y: 4.0, w: 9, h: 1.2,
  fill: { color: colors.cyan, transparency: 92 },
  line: { color: colors.cyan, width: 1 }
});

slide7.addText('Consensus Algorithm: Weighted voting with reputation tracking. Agents that consistently align with verified outcomes gain higher weight. Requires 6/9 agreement for high confidence.', {
  x: 0.7, y: 4.2, w: 8.6, h: 0.8,
  fontSize: 12, color: colors.white,
  fontFace: 'Arial', valign: 'top'
});

// ========== SLIDE 8: ROI ==========
const slide8 = pptx.addSlide();
slide8.background = { color: colors.black };

slide8.addText('RETURN ON INVESTMENT', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.green,
  fontFace: 'Arial'
});

// Cost comparison
const costItems = [
  { category: 'Infrastructure Costs', items: [
    { name: 'Compute (GKE)', before: '$85', after: '$30' },
    { name: 'Storage (PostgreSQL)', before: '$25', after: '$10' },
    { name: 'Memory (Redis)', before: '$10', after: '$5' }
  ]},
  { category: 'Operational Savings', items: [
    { name: 'Manual Review', before: '160 hrs', after: '10 hrs' },
    { name: 'Incident Response', before: '40 hrs', after: '2 hrs' }
  ]}
];

let yPos = 1.0;
costItems.forEach(category => {
  slide8.addText(category.category, {
    x: 0.5, y: yPos, w: 5, h: 0.3,
    fontSize: 14, bold: true, color: colors.cyan,
    fontFace: 'Arial'
  });
  yPos += 0.4;

  category.items.forEach(item => {
    slide8.addText(`${item.name}: ${item.before} → ${item.after}`, {
      x: 0.7, y: yPos, w: 5, h: 0.3,
      fontSize: 11, color: colors.white,
      fontFace: 'Arial'
    });
    yPos += 0.3;
  });
  yPos += 0.2;
});

// Total savings box
slide8.addShape(pptx.shapes.RECTANGLE, {
  x: 6, y: 1.5, w: 3.5, h: 2.5,
  fill: { color: colors.green, transparency: 90 },
  line: { color: colors.green, width: 2 }
});

slide8.addText('$18,750', {
  x: 6.1, y: 1.8, w: 3.3, h: 0.8,
  fontSize: 48, bold: true, color: colors.green,
  align: 'center', fontFace: 'Courier New'
});

slide8.addText('MONTHLY SAVINGS', {
  x: 6.1, y: 2.6, w: 3.3, h: 0.3,
  fontSize: 14, color: colors.white,
  align: 'center', fontFace: 'Arial'
});

slide8.addText('Payback: 2.3 months', {
  x: 6.1, y: 3.2, w: 3.3, h: 0.4,
  fontSize: 16, bold: true, color: colors.cyan,
  align: 'center', fontFace: 'Courier New'
});

// ========== SLIDE 9: Integration ==========
const slide9 = pptx.addSlide();
slide9.background = { color: colors.black };

slide9.addText('INTEGRATION PATH', {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 32, bold: true, color: colors.cyan,
  fontFace: 'Arial'
});

// Integration steps
const steps = [
  { num: '01', title: 'API Setup', time: '< 1 hour' },
  { num: '02', title: 'Deploy Workers', time: '2 hours' },
  { num: '03', title: 'Production Ready', time: 'Same day' }
];

steps.forEach((step, index) => {
  const x = 0.5 + index * 3.2;

  slide9.addShape(pptx.shapes.RECTANGLE, {
    x: x, y: 1.0, w: 3, h: 1.2,
    fill: { color: colors.black },
    line: { color: colors.cyan, width: 2 }
  });

  slide9.addText(step.num, {
    x: x, y: 1.1, w: 3, h: 0.4,
    fontSize: 24, bold: true, color: colors.cyan,
    align: 'center', fontFace: 'Courier New'
  });

  slide9.addText(step.title, {
    x: x, y: 1.5, w: 3, h: 0.3,
    fontSize: 12, bold: true, color: colors.white,
    align: 'center', fontFace: 'Arial'
  });

  slide9.addText(step.time, {
    x: x, y: 1.8, w: 3, h: 0.2,
    fontSize: 10, color: colors.green,
    align: 'center', fontFace: 'Arial'
  });
});

// Code sample
slide9.addShape(pptx.shapes.RECTANGLE, {
  x: 0.5, y: 2.5, w: 9, h: 2,
  fill: { color: colors.cyan, transparency: 95 },
  line: { color: colors.cyan, width: 1 }
});

slide9.addText('Simple GraphQL Integration:', {
  x: 0.7, y: 2.6, w: 8.6, h: 0.3,
  fontSize: 11, color: colors.cyan,
  fontFace: 'Arial'
});

slide9.addText(
`mutation {
  analyzeCitation(input: {
    claim: "GPT-4 scores 86.4% on MMLU",
    citation: "OpenAI, 2023"
  }) {
    confidence, consensus
    agents { name, vote, reasoning }
  }
}`, {
  x: 0.7, y: 2.9, w: 8.6, h: 1.4,
  fontSize: 11, color: colors.green,
  fontFace: 'Courier New',
  valign: 'top'
});

// ========== SLIDE 10: Call to Action ==========
const slide10 = pptx.addSlide();
slide10.background = { color: colors.black };

slide10.addText('READY TO DEPLOY?', {
  x: 0, y: 1.5, w: 10, h: 0.8,
  fontSize: 48, bold: true, color: colors.green,
  align: 'center', fontFace: 'Arial'
});

// CTA box
slide10.addShape(pptx.shapes.RECTANGLE, {
  x: 2, y: 2.5, w: 6, h: 2,
  fill: { color: colors.green, transparency: 93 },
  line: { color: colors.green, width: 2 }
});

const ctaPoints = [
  '→ Start with our free trial',
  '→ Deploy in your infrastructure',
  '→ See results in 24 hours'
];

ctaPoints.forEach((point, index) => {
  slide10.addText(point, {
    x: 2.3, y: 2.8 + index * 0.4, w: 5.4, h: 0.3,
    fontSize: 18, color: colors.white,
    fontFace: 'Arial'
  });
});

// Contact info
slide10.addText('Schedule Demo: demo.marcus.ai    |    Technical Docs: docs.marcus.ai', {
  x: 0, y: 4.8, w: 10, h: 0.3,
  fontSize: 14, color: colors.cyan,
  align: 'center', fontFace: 'Arial'
});

// Save the presentation
pptx.writeFile({ fileName: 'MARCUS_3.2_Demo_Presentation.pptx' })
  .then(() => {
    console.log('Presentation created successfully!');
  })
  .catch(err => {
    console.error('Error creating presentation:', err);
  });
/**
 * generatePremiumPDF  —  PrepAI branded PDF
 * Works with both Interview report (from Interview.jsx) and
 * Report detail (from Reports.jsx) data shapes.
 *
 * Both shapes have:
 *   report.category, report.difficulty, report.overallScore,
 *   report.createdAt, report.questions[] (array of question objects)
 *
 * Question objects may have:
 *   .questionText, .userAnswer, .idealAnswer / .idealAnswerText,
 *   .final_score, .accuracy_score, .keyword_score, .explanation, .aiAdvice
 */

import jsPDF from 'jspdf';

// ─── helpers ───────────────────────────────────────────────────────────────
const HEX = {
  bg:       [3,   3,  10],
  panel:    [12,  12,  26],
  border:   [30,  30,  60],
  accent:   [99, 102, 241],  // indigo
  accent2:  [167,139, 250],  // violet
  pink:     [236, 72, 153],
  green:    [74, 222, 128],
  yellow:   [251,191,  36],
  red:      [248,113, 113],
  white:    [255,255,255],
  muted:    [100,116,139],
  faint:    [30,  41,  59],
};

const scoreColor = (s) =>
  s >= 8 ? HEX.green : s >= 6 ? HEX.accent2 : s >= 4 ? HEX.yellow : HEX.red;

const gradeLabel = (s) =>
  s >= 8 ? 'EXCELLENT' : s >= 6 ? 'GOOD' : s >= 4 ? 'AVERAGE' : 'NEEDS WORK';

// Wrap text into lines fitting maxWidth (in doc units)
function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text || ''), maxWidth);
}

// Draw a rounded rect (no native arc in jsPDF basic)
function roundRect(doc, x, y, w, h, fill, stroke) {
  if (fill) { doc.setFillColor(...fill); doc.roundedRect(x, y, w, h, 4, 4, 'F'); }
  if (stroke) { doc.setDrawColor(...stroke); doc.roundedRect(x, y, w, h, 4, 4, 'S'); }
}

// ─── main export ────────────────────────────────────────────────────────────
export function generatePremiumPDF(report) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210, PH = 297;
  const ML = 18, MR = 18, MW = PW - ML - MR;
  let y = 0;

  const questions = report.questions || [];
  const score = Number(report.overallScore || 0);
  const sCol = scoreColor(score);
  const category = report.category || 'Interview';
  const difficulty = report.difficulty || 'Mixed';
  const date = new Date(report.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // ══════════════════════════════ PAGE 1 HEADER ══════════════════════════════

  // Dark full-width header banner
  doc.setFillColor(...HEX.bg);
  doc.rect(0, 0, PW, PH, 'F');

  // Header gradient band
  doc.setFillColor(14, 14, 38);
  doc.rect(0, 0, PW, 64, 'F');

  // Accent top strip
  doc.setFillColor(...HEX.accent);
  doc.rect(0, 0, PW, 3, 'F');

  // Logo mark — shield-like box
  doc.setFillColor(...HEX.accent);
  roundRect(doc, ML, 10, 12, 12, HEX.accent);
  doc.setTextColor(...HEX.white);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('P', ML + 4, 18.5);

  // PrepAI wordmark
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.white);
  doc.text('Prep', ML + 16, 20);
  doc.setTextColor(...HEX.accent2);
  doc.text('AI', ML + 35, 20);

  // Tagline
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HEX.muted);
  doc.text('interview intelligence platform', ML + 16, 25);

  // Right: date + category
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HEX.muted);
  doc.text(date, PW - MR, 14, { align: 'right' });
  doc.setFontSize(9); doc.setTextColor(...HEX.accent2);
  doc.text(category.toUpperCase() + ' SESSION', PW - MR, 23, { align: 'right' });

  // Hero title
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.white);
  doc.text('Interview Analysis Report', ML, 50);

  // Divider
  doc.setDrawColor(...HEX.border);
  doc.setLineWidth(0.3);
  doc.line(ML, 55, PW - MR, 55);

  y = 68;

  // ── Score hero block ───────────────────────────────────────────────────────
  // Large score card
  roundRect(doc, ML, y, 62, 46, [10, 15, 35], HEX.border);

  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.muted);
  doc.text('OVERALL SCORE', ML + 31, y + 8, { align: 'center' });

  doc.setFontSize(32); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...sCol);
  doc.text(score.toFixed(1), ML + 31, y + 28, { align: 'center' });

  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HEX.muted);
  doc.text('/ 10', ML + 31, y + 36, { align: 'center' });

  // Grade pill
  roundRect(doc, ML + 10, y + 39, 42, 7, [...sCol.map(c => Math.round(c * 0.2))]);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...sCol);
  doc.text(gradeLabel(score), ML + 31, y + 44, { align: 'center' });

  // Info boxes
  const infoItems = [
    { label: 'CATEGORY',   value: category },
    { label: 'DIFFICULTY', value: difficulty },
    { label: 'QUESTIONS',  value: String(questions.length) },
  ];
  infoItems.forEach((item, i) => {
    const bx = ML + 68 + i * 46;
    roundRect(doc, bx, y, 42, 22, [10, 15, 35], HEX.border);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HEX.accent2);
    doc.text(item.label, bx + 21, y + 7, { align: 'center' });
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HEX.white);
    doc.text(item.value, bx + 21, y + 17, { align: 'center' });
  });

  // Progress bar
  const barY = y + 52, barW = MW;
  doc.setFillColor(...HEX.faint);
  doc.roundedRect(ML, barY, barW, 5, 2.5, 2.5, 'F');
  doc.setFillColor(...sCol);
  doc.roundedRect(ML, barY, barW * (score / 10), 5, 2.5, 2.5, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HEX.muted);
  doc.text(`${Math.round((score / 10) * 100)}% mastery`, PW - MR, barY + 4.5, { align: 'right' });

  y = barY + 16;

  // ── Section header: Q&A Breakdown ─────────────────────────────────────────
  doc.setFillColor(...HEX.accent);
  doc.rect(ML, y, 4, 12, 'F');
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.white);
  doc.text('Question-by-Question Breakdown', ML + 8, y + 9);
  y += 18;

  // ── Q cards ───────────────────────────────────────────────────────────────
  questions.forEach((q, idx) => {
    const qScore = Number(q.final_score || 0);
    const qCol   = scoreColor(qScore);
    const qText  = q.questionText || q.question || `Question ${idx + 1}`;
    const userAns = q.userAnswer   || '(no answer provided)';
    const idealAns = q.idealAnswer || q.idealAnswerText || '';
    const explanation = q.explanation || '';
    const advice = q.aiAdvice || '';

    // Estimate block height
    const wrQ  = wrapText(doc, qText,    MW - 16);
    const wrU  = wrapText(doc, userAns,  MW - 26);
    const wrI  = idealAns   ? wrapText(doc, idealAns,    MW - 26) : [];
    const wrE  = explanation? wrapText(doc, explanation, MW - 26) : [];
    const lineH = 5;
    const blockH = 14 + wrQ.length * lineH + 10 + wrU.length * lineH
      + (wrI.length ? 8 + wrI.length * lineH : 0)
      + (wrE.length ? 8 + wrE.length * lineH : 0)
      + (advice ? 17 : 0) + 12;

    // Page break
    if (y + blockH > PH - 24) {
      addFooter(doc, PW, PH, ML, MR);
      doc.addPage();
      doc.setFillColor(...HEX.bg);
      doc.rect(0, 0, PW, PH, 'F');
      y = 24;
    }

    // Card bg
    roundRect(doc, ML, y, MW, blockH, [10, 15, 35], HEX.border);
    // Left color bar
    doc.setFillColor(...qCol);
    doc.roundedRect(ML, y, 4, blockH, 2, 2, 'F');

    // Q number badge
    roundRect(doc, ML + 8, y + 6, 16, 8, [...qCol.map(c => Math.round(c * 0.2))]);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...qCol);
    doc.text(`Q${idx + 1}`, ML + 16, y + 11.5, { align: 'center' });

    // Score badge (right)
    const sbx = ML + MW - 22;
    roundRect(doc, sbx, y + 5, 18, 10, [...qCol.map(c => Math.round(c * 0.15))]);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...qCol);
    doc.text(`${qScore}/10`, sbx + 9, y + 12, { align: 'center' });

    let qy = y + 8;

    // Question text
    const qTextX = ML + 28;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HEX.white);
    wrQ.forEach(line => { doc.text(line, qTextX, qy); qy += lineH; });
    qy += 4;

    // Metrics bar
    const metrics = [
      { lbl: 'Accuracy', val: `${Math.round((q.accuracy_score || 0) * 100)}%`, col: HEX.accent2 },
      q.keyword_score ? { lbl: 'Keywords', val: `${Math.round((q.keyword_score || 0) * 100)}%`, col: HEX.pink } : null,
      { lbl: 'Score', val: `${qScore}/10`, col: qCol },
    ].filter(Boolean);

    metrics.forEach((m, mi) => {
      const mx = ML + 8 + mi * 44;
      roundRect(doc, mx, qy, 40, 7, [...m.col.map(c => Math.round(c * 0.12))]);
      doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...m.col);
      doc.text(`${m.lbl}: ${m.val}`, mx + 20, qy + 4.8, { align: 'center' });
    });
    qy += 12;

    // Your Answer
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HEX.muted);
    doc.text('YOUR ANSWER', ML + 8, qy); qy += 5;
    doc.setFontSize(9); doc.setFont('helvetica', 'italic');
    doc.setTextColor(160, 174, 192);
    wrU.forEach(line => { doc.text(line, ML + 8, qy); qy += lineH; });
    qy += 3;

    // Ideal Answer
    if (wrI.length) {
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HEX.green);
      doc.text('IDEAL ANSWER', ML + 8, qy); qy += 5;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.setTextColor(134, 239, 172);
      wrI.forEach(line => { doc.text(line, ML + 8, qy); qy += lineH; });
      qy += 3;
    }

    // AI Rationale
    if (wrE.length) {
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HEX.yellow);
      doc.text('💡 AI RATIONALE', ML + 8, qy); qy += 5;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.setTextColor(253, 230, 138);
      wrE.forEach(line => { doc.text(line, ML + 8, qy); qy += lineH; });
    }

    if (advice) {
      qy += 3;
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HEX.accent2);
      doc.text('AI ADVICE', ML + 8, qy); qy += 5;
      const wrA = wrapText(doc, advice, MW - 26);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.setTextColor(196, 181, 253);
      wrA.forEach(line => { doc.text(line, ML + 8, qy); qy += lineH; });
    }

    y += blockH + 8;
  });

  // ── Summary Footer on last page ───────────────────────────────────────────
  if (y + 40 > PH - 24) {
    addFooter(doc, PW, PH, ML, MR);
    doc.addPage();
    doc.setFillColor(...HEX.bg);
    doc.rect(0, 0, PW, PH, 'F');
    y = 24;
  }

  // Summary card
  roundRect(doc, ML, y, MW, 32, [14, 14, 38], HEX.border);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.accent2);
  doc.text('SESSION SUMMARY', ML + 8, y + 9);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.setTextColor(...HEX.white);
  const avgAcc = questions.length
    ? Math.round(questions.reduce((s, q) => s + (q.accuracy_score || 0), 0) / questions.length * 100)
    : 0;
  const best = questions.reduce((b, q) => Number(q.final_score || 0) > Number(b.final_score || 0) ? q : b, questions[0] || {});
  doc.text(`Overall: ${score.toFixed(1)}/10   •   Avg Accuracy: ${avgAcc}%   •   Questions: ${questions.length}`, ML + 8, y + 20);
  doc.setFontSize(9); doc.setFont('helvetica', 'italic');
  doc.setTextColor(...HEX.muted);
  if (best?.questionText) {
    const bw = wrapText(doc, `Best: "${best.questionText.slice(0, 80)}..."`, MW - 16);
    doc.text(bw[0], ML + 8, y + 28);
  }

  addFooter(doc, PW, PH, ML, MR);

  // ── Save ─────────────────────────────────────────────────────────────────
  const filename = `PrepAI_Report_${category}_${new Date(report.createdAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function addFooter(doc, PW, PH, ML, MR) {
  const HEX_BORDER = [30, 30, 60];
  const HEX_MUTED  = [100,116,139];
  const HEX_ACCENT2= [167,139,250];
  doc.setDrawColor(...HEX_BORDER);
  doc.setLineWidth(0.3);
  doc.line(ML, PH - 16, PW - MR, PH - 16);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HEX_MUTED);
  doc.text('PrepAI — Interview Intelligence Platform', ML, PH - 10);
  doc.setTextColor(...HEX_ACCENT2);
  doc.text('prepai.io', PW - MR, PH - 10, { align: 'right' });
}

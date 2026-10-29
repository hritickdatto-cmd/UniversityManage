/**
 * ============================================================================
 * UNIVERSITY MANAGEMENT SYSTEM (UMS) - ANALYTICS & VECTOR CHARTING ENGINE
 * ============================================================================
 */

const UMSReports = (() => {
            return {
                /**
                 * Compute aggregated student demographic statistics
                 */
                getStudentStats() {
                    const students = UMSStorage.getData('students');
                    const departments = UMSStorage.getData('departments');

                    // Department distribution
                    const deptMap = {};
                    departments.forEach(d => { deptMap[d.code] = 0; });
                    students.forEach(s => {
                        const dept = s.department || 'Other';
                        deptMap[dept] = (deptMap[dept] || 0) + 1;
                    });

                    const byDept = Object.keys(deptMap).map(code => ({
                        label: code,
                        value: deptMap[code]
                    }));

                    // Batch distribution
                    const batchMap = {};
                    students.forEach(s => {
                        const batch = s.batch || '2024';
                        batchMap[batch] = (batchMap[batch] || 0) + 1;
                    });

                    const byBatch = Object.keys(batchMap).map(batch => ({
                        label: `Batch ${batch}`,
                        value: batchMap[batch]
                    }));

                    // Gender distribution
                    let male = 0,
                        female = 0,
                        other = 0;
                    students.forEach(s => {
                        const g = (s.gender || '').toLowerCase();
                        if (g === 'male') male++;
                        else if (g === 'female') female++;
                        else other++;
                    });

                    return {
                        total: students.length,
                        byDept,
                        byBatch,
                        gender: [
                            { label: 'Male', value: male, color: '#1e3a8a' },
                            { label: 'Female', value: female, color: '#0d9488' },
                            { label: 'Other/Unspecified', value: other, color: '#94a3b8' }
                        ]
                    };
                },

                /**
                 * Compute academic performance & GPA distributions
                 */
                getResultStats() {
                    const results = UMSStorage.getData('results');
                    const courses = UMSStorage.getData('courses');

                    // GPA Bins: A+ (4.00), A (3.75-3.99), B (3.00-3.74), C (2.00-2.99), F (<2.00)
                    const distribution = {
                        'A+ (4.00)': 0,
                        'A (3.75 - 3.99)': 0,
                        'B (3.00 - 3.74)': 0,
                        'C (2.00 - 2.99)': 0,
                        'F (Below 2.0)': 0
                    };

                    let totalScore = 0;
                    let passed = 0;
                    let failed = 0;

                    results.forEach(r => {
                        const pt = r.gradePoint || 0;
                        totalScore += (r.marks || 0);

                        if (pt >= 4.0) distribution['A+ (4.00)']++;
                        else if (pt >= 3.75) distribution['A (3.75 - 3.99)']++;
                        else if (pt >= 3.0) distribution['B (3.00 - 3.74)']++;
                        else if (pt >= 2.0) distribution['C (2.00 - 2.99)']++;
                        else distribution['F (Below 2.0)']++;

                        if (r.grade === 'F' || pt < 2.0) failed++;
                        else passed++;
                    });

                    const totalCount = results.length || 1;
                    const avgScore = (totalScore / totalCount).toFixed(1);
                    const passRate = ((passed / totalCount) * 100).toFixed(1);

                    // Course-level average performance
                    const courseMap = {};
                    courses.forEach(c => {
                        courseMap[c.code] = { title: c.title, totalMarks: 0, count: 0 };
                    });

                    results.forEach(r => {
                        if (!courseMap[r.courseCode]) {
                            courseMap[r.courseCode] = { title: r.courseTitle || r.courseCode, totalMarks: 0, count: 0 };
                        }
                        courseMap[r.courseCode].totalMarks += (r.marks || 0);
                        courseMap[r.courseCode].count += 1;
                    });

                    const coursePerformance = Object.keys(courseMap).map(code => {
                        const item = courseMap[code];
                        const avg = item.count > 0 ? (item.totalMarks / item.count).toFixed(1) : 0;
                        return { label: code, value: parseFloat(avg), fullTitle: item.title };
                    });

                    return {
                        totalEvaluated: results.length,
                        avgScore,
                        passRate,
                        passed,
                        failed,
                        distribution: Object.keys(distribution).map(k => ({ label: k, value: distribution[k] })),
                        coursePerformance
                    };
                },

                /**
                 * Compute institutional lecture attendance compliance
                 */
                getAttendanceStats() {
                    const attendance = UMSStorage.getData('attendance');

                    let grandTotalClasses = 0;
                    let grandPresent = 0;
                    let grandAbsent = 0;

                    const courseAttMap = {};

                    attendance.forEach(a => {
                        grandTotalClasses += a.totalClasses;
                        grandPresent += a.present;
                        grandAbsent += a.absent;

                        if (!courseAttMap[a.courseCode]) {
                            courseAttMap[a.courseCode] = { classes: 0, present: 0 };
                        }
                        courseAttMap[a.courseCode].classes += a.totalClasses;
                        courseAttMap[a.courseCode].present += a.present;
                    });

                    const institutionalRate = grandTotalClasses > 0 ?
                        ((grandPresent / grandTotalClasses) * 100).toFixed(1) :
                        88.5;

                    const courseWise = Object.keys(courseAttMap).map(code => {
                        const item = courseAttMap[code];
                        const rate = item.classes > 0 ? ((item.present / item.classes) * 100).toFixed(1) : 0;
                        return { label: code, value: parseFloat(rate) };
                    });

                    return {
                        overallRate: institutionalRate,
                        totalClasses: grandTotalClasses,
                        totalPresent: grandPresent,
                        totalAbsent: grandAbsent,
                        courseWise
                    };
                },

                /**
                 * Compute tuition billing, fee recovery & balance arrears
                 */
                getFeeStats() {
                    const fees = UMSStorage.getData('fees');

                    let totalInvoiced = 0;
                    let totalCollected = 0;
                    let totalDue = 0;

                    const statusMap = { 'Paid': 0, 'Partially Paid': 0, 'Due': 0 };

                    fees.forEach(f => {
                        totalInvoiced += (f.total || 0);
                        totalCollected += (f.paid || 0);
                        totalDue += (f.due || 0);

                        if (statusMap[f.status] !== undefined) {
                            statusMap[f.status]++;
                        } else {
                            statusMap['Due']++;
                        }
                    });

                    const recoveryRate = totalInvoiced > 0 ?
                        ((totalCollected / totalInvoiced) * 100).toFixed(1) :
                        0;

                    return {
                        totalInvoiced,
                        totalCollected,
                        totalDue,
                        recoveryRate,
                        statusBreakdown: [
                            { label: 'Paid in Full', value: statusMap['Paid'], color: '#10b981' },
                            { label: 'Partially Settled', value: statusMap['Partially Paid'], color: '#f59e0b' },
                            { label: 'Outstanding Dues', value: statusMap['Due'], color: '#ef4444' }
                        ]
                    };
                },

                /**
                 * Vector SVG Bar Chart Generator
                 * @param {string} containerId - Target element ID
                 * @param {Array<{label: string, value: number}>} data - Values to chart
                 * @param {Object} options - Customizations (maxVal, height, color, unit)
                 */
                renderBarChart(containerId, data, options = {}) {
                    const container = document.getElementById(containerId);
                    if (!container) return;

                    const height = options.height || 240;
                    const barColor = options.color || 'var(--primary)';
                    const unit = options.unit || '';

                    if (!data || data.length === 0) {
                        container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No statistical entries available</div>`;
                        return;
                    }

                    const maxValue = options.maxVal || Math.max(...data.map(d => d.value), 10);
                    const svgWidth = 100; // Percentage basis viewBox
                    const barWidth = Math.min(14, Math.max(6, 60 / data.length));
                    const gap = (svgWidth - (barWidth * data.length)) / (data.length + 1);

                    let barsSvg = '';
                    let labelsSvg = '';

                    data.forEach((item, idx) => {
                        const x = gap + idx * (barWidth + gap);
                        const barHeight = Math.max(2, (item.value / maxValue) * (height - 60));
                        const y = height - 40 - barHeight;

                        barsSvg += `
          <g class="svg-bar-group" tabindex="0">
            <title>${item.label}: ${item.value}${unit}</title>
            <rect x="${x}%" y="${y}" width="${barWidth}%" height="${barHeight}" rx="4" fill="${barColor}" class="chart-bar-rect">
              <animate attributeName="height" from="0" to="${barHeight}" dur="0.5s" fill="freeze" />
              <animate attributeName="y" from="${height - 40}" to="${y}" dur="0.5s" fill="freeze" />
            </rect>
            <text x="${x + barWidth / 2}%" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-primary)">
              ${item.value}${unit}
            </text>
          </g>
        `;

                        labelsSvg += `
          <text x="${x + barWidth / 2}%" y="${height - 15}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-secondary)">
            ${item.label}
          </text>
        `;
                    });

                    // Horizontal reference grids
                    const gridSvg = `
        <line x1="2%" y1="${height - 40}" x2="98%" y2="${height - 40}" stroke="var(--border-color)" stroke-width="1" />
        <line x1="2%" y1="${(height - 40) / 2}" x2="98%" y2="${(height - 40) / 2}" stroke="var(--border-color)" stroke-dasharray="3,3" stroke-width="1" />
      `;

                    container.innerHTML = `
        <svg viewBox="0 0 100% ${height}" style="width: 100%; height: ${height}px; overflow: visible;">
          ${gridSvg}
          ${barsSvg}
          ${labelsSvg}
        </svg>
      `;
                },

                /**
                 * Vector SVG Donut Chart Generator
                 * @param {string} containerId - Target element ID
                 * @param {Array<{label: string, value: number, color: string}>} data
                 * @param {Object} options
                 */
                renderDonutChart(containerId, data, options = {}) {
                    const container = document.getElementById(containerId);
                    if (!container) return;

                    const size = options.size || 220;
                    const strokeWidth = options.strokeWidth || 32;
                    const radius = (size - strokeWidth) / 2;
                    const circumference = 2 * Math.PI * radius;

                    const total = data.reduce((sum, d) => sum + d.value, 0);

                    if (total === 0) {
                        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No metrics available</div>`;
                        return;
                    }

                    let cumulativeAngle = 0;
                    let slicesSvg = '';

                    data.forEach(slice => {
                        const percentage = slice.value / total;
                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativeAngle;

                        slicesSvg += `
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                  fill="transparent" 
                  stroke="${slice.color}" 
                  stroke-width="${strokeWidth}" 
                  stroke-dasharray="${strokeDasharray}" 
                  stroke-dashoffset="${strokeDashoffset}"
                  transform="rotate(-90 ${size / 2} ${size / 2})">
            <title>${slice.label}: ${slice.value} (${Math.round(percentage * 100)}%)</title>
          </circle>
        `;

                        cumulativeAngle += percentage * circumference;
                    });

                    // Legend markup
                    const legendHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: center;">
          ${data.map(d => `
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem;">
              <span style="width: 12px; height: 12px; border-radius: 3px; background-color: ${d.color}; display: inline-block;"></span>
              <span style="color: var(--text-secondary);">${d.label}:</span>
              <strong>${d.value} (${Math.round((d.value / total) * 100)}%)</strong>
            </div>
          `).join('')}
        </div>
      `;

      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap;">
          <div style="position: relative; width: ${size}px; height: ${size}px;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              ${slicesSvg}
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1;">${total}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total</div>
            </div>
          </div>
          ${legendHtml}
        </div>
      `;
    }
  };
})();
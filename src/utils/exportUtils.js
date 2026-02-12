/**
 * Export Utilities - Handle dashboard exports in various formats
 * Supports: JSON, PNG, JPG, PDF with company logo
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LOGO_PATH = (process.env.PUBLIC_URL || '') + '/alrajhi_logo.png';

/**
 * Export dashboard as JSON file
 */
export const exportAsJSON = (dashboard) => {
  const dataStr = JSON.stringify(dashboard, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${dashboard.name || 'dashboard'}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Prepare a clone of the dashboard element that captures the full scrollable content
 */
function prepareClone(element) {
  const clone = element.cloneNode(true);
  // Get the actual scrollable content dimensions
  const scrollWidth = Math.max(element.scrollWidth, element.offsetWidth);
  const scrollHeight = Math.max(element.scrollHeight, element.offsetHeight);
  clone.style.width = `${scrollWidth}px`;
  clone.style.height = `${scrollHeight}px`;
  clone.style.overflow = 'visible';
  clone.style.position = 'relative';
  // Remove any max-height constraints
  clone.style.maxHeight = 'none';
  clone.style.maxWidth = 'none';
  return { clone, scrollWidth, scrollHeight };
}

/**
 * Build a wrapper div with optional logo header
 */
function buildWrapper(clone, scrollWidth, options) {
  const { includeLogo = true, dashboardTitle = 'Dashboard' } = options;
  const wrapper = document.createElement('div');
  wrapper.style.padding = '40px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.width = `${scrollWidth + 80}px`;
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';

  if (includeLogo) {
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '30px';

    const logo = document.createElement('img');
    logo.src = LOGO_PATH;
    logo.crossOrigin = 'anonymous';
    logo.style.width = '180px';
    logo.style.height = 'auto';
    logo.style.margin = '0 auto 16px';
    logo.style.display = 'block';
    header.appendChild(logo);

    const title = document.createElement('h1');
    title.textContent = dashboardTitle;
    title.style.fontSize = '22px';
    title.style.fontWeight = 'bold';
    title.style.color = '#1a2b6d';
    title.style.marginBottom = '8px';
    header.appendChild(title);

    const timestamp = document.createElement('p');
    timestamp.textContent = `Generated on ${new Date().toLocaleString()}`;
    timestamp.style.fontSize = '12px';
    timestamp.style.color = '#6B7280';
    header.appendChild(timestamp);

    const separator = document.createElement('hr');
    separator.style.border = 'none';
    separator.style.borderTop = '2px solid #1a2b6d';
    separator.style.marginTop = '16px';
    separator.style.opacity = '0.2';
    header.appendChild(separator);

    wrapper.appendChild(header);
  }

  wrapper.appendChild(clone);
  return wrapper;
}

/**
 * Export dashboard as Image (PNG or JPG)
 */
export const exportAsImage = async (elementId, options = {}) => {
  const {
    format = 'png',
    quality = 0.95,
    includeLogo = true,
    dashboardTitle = 'Dashboard',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Dashboard element not found');

    const { clone, scrollWidth } = prepareClone(element);
    const wrapper = buildWrapper(clone, scrollWidth, { includeLogo, dashboardTitle });
    document.body.appendChild(wrapper);

    // Wait a tick for images to load
    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
      windowWidth: wrapper.scrollWidth,
      windowHeight: wrapper.scrollHeight,
    });

    document.body.removeChild(wrapper);

    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dashboardTitle.replace(/\s+/g, '_')}_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality
    );

    return { success: true };
  } catch (error) {
    console.error('Export as image failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export dashboard as PDF — landscape by default for better dashboard layout
 */
export const exportAsPDF = async (elementId, options = {}) => {
  const {
    orientation = 'landscape',
    pageSize = 'a4',
    includeLogo = true,
    dashboardTitle = 'Dashboard',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Dashboard element not found');

    const { clone, scrollWidth } = prepareClone(element);
    const wrapper = buildWrapper(clone, scrollWidth, { includeLogo, dashboardTitle });
    document.body.appendChild(wrapper);

    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
      windowWidth: wrapper.scrollWidth,
      windowHeight: wrapper.scrollHeight,
    });

    document.body.removeChild(wrapper);

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = usableWidth;
    const imgHeight = (canvasHeight * usableWidth) / canvasWidth;

    if (imgHeight <= usableHeight) {
      // Single page — fits entirely
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      pdf.setFontSize(8);
      pdf.setTextColor(160);
      pdf.text('Page 1 of 1', pdfWidth - 25, pdfHeight - 5);
    } else {
      // Multi-page — slice the canvas into page-sized chunks
      const pageCanvasHeight = (usableHeight * canvasWidth) / usableWidth;
      const totalPages = Math.ceil(canvasHeight / pageCanvasHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        const sourceY = i * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, canvasHeight - sourceY);
        const sliceImgHeight = (sliceHeight * usableWidth) / canvasWidth;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, sourceY, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, sliceImgHeight);

        // Page footer
        pdf.setFontSize(8);
        pdf.setTextColor(160);
        pdf.text(`Page ${i + 1} of ${totalPages}`, pdfWidth - 25, pdfHeight - 5);
      }
    }

    pdf.save(`${dashboardTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Export as PDF failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export widget data as CSV
 */
export const exportWidgetAsCSV = (data, filename = 'widget_data') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export widget data as Excel
 */
export const exportWidgetAsExcel = async (data, filename = 'widget_data') => {
  try {
    const XLSX = await import('xlsx');
    
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
  } catch (error) {
    console.error('Export as Excel failed:', error);
  }
};

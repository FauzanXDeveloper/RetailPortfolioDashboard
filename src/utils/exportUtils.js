/**
 * Export Utilities - Handle dashboard exports in various formats
 * Supports: JSON, PNG, JPG, PDF with company logo
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

    // Create a wrapper div to include logo and title
    const wrapper = document.createElement('div');
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.width = `${element.offsetWidth + 80}px`;

    // Add logo header if enabled
    if (includeLogo) {
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '30px';

      // Logo
      const logo = document.createElement('img');
      logo.src = '/alrajhi_logo.png';
      logo.style.width = '200px';
      logo.style.height = 'auto';
      logo.style.margin = '0 auto 20px';
      logo.style.display = 'block';
      header.appendChild(logo);

      // Title
      const title = document.createElement('h1');
      title.textContent = dashboardTitle;
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.color = '#1F2937';
      title.style.marginBottom = '10px';
      header.appendChild(title);

      // Timestamp
      const timestamp = document.createElement('p');
      timestamp.textContent = `Generated on ${new Date().toLocaleString()}`;
      timestamp.style.fontSize = '14px';
      timestamp.style.color = '#6B7280';
      header.appendChild(timestamp);

      // Separator
      const separator = document.createElement('hr');
      separator.style.border = 'none';
      separator.style.borderTop = '2px solid #E5E7EB';
      separator.style.marginTop = '20px';
      header.appendChild(separator);

      wrapper.appendChild(header);
    }

    // Clone the dashboard content
    const clone = element.cloneNode(true);
    wrapper.appendChild(clone);

    // Temporarily append to body
    document.body.appendChild(wrapper);

    // Capture the wrapper
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Convert to blob and download
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
 * Export dashboard as PDF
 */
export const exportAsPDF = async (elementId, options = {}) => {
  const {
    orientation = 'portrait',
    pageSize = 'a4',
    includeLogo = true,
    dashboardTitle = 'Dashboard',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Dashboard element not found');

    // Create wrapper with logo and title
    const wrapper = document.createElement('div');
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.width = `${element.offsetWidth + 80}px`;

    // Add logo header if enabled
    if (includeLogo) {
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '30px';

      // Logo
      const logo = document.createElement('img');
      logo.src = '/alrajhi_logo.png';
      logo.style.width = '150px';
      logo.style.height = 'auto';
      logo.style.margin = '0 auto 20px';
      logo.style.display = 'block';
      header.appendChild(logo);

      // Title
      const title = document.createElement('h1');
      title.textContent = dashboardTitle;
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.color = '#1F2937';
      title.style.marginBottom = '10px';
      header.appendChild(title);

      // Timestamp
      const timestamp = document.createElement('p');
      timestamp.textContent = `Generated on ${new Date().toLocaleString()}`;
      timestamp.style.fontSize = '14px';
      timestamp.style.color = '#6B7280';
      header.appendChild(timestamp);

      // Separator
      const separator = document.createElement('hr');
      separator.style.border = 'none';
      separator.style.borderTop = '2px solid #E5E7EB';
      separator.style.marginTop = '20px';
      header.appendChild(separator);

      wrapper.appendChild(header);
    }

    // Clone the dashboard content
    const clone = element.cloneNode(true);
    wrapper.appendChild(clone);

    // Temporarily append to body
    document.body.appendChild(wrapper);

    // Capture as canvas
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // PDF dimensions
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const width = pdfWidth - 20; // 10mm margin on each side
    const height = width / ratio;

    // Check if content fits on one page
    if (height <= pdfHeight - 20) {
      // Single page
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 10, 10, width, height);
      
      // Add page number
      pdf.setFontSize(10);
      pdf.setTextColor(128);
      pdf.text(`Page 1 of 1`, pdfWidth - 30, pdfHeight - 10);
    } else {
      // Multiple pages
      const totalPages = Math.ceil(height / (pdfHeight - 20));
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        
        const sourceY = i * (canvasHeight / totalPages);
        const sourceHeight = canvasHeight / totalPages;
        
        // Create canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          sourceHeight,
          0,
          0,
          canvasWidth,
          sourceHeight
        );
        
        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 10, 10, width, pdfHeight - 20);
        
        // Add page number
        pdf.setFontSize(10);
        pdf.setTextColor(128);
        pdf.text(`Page ${i + 1} of ${totalPages}`, pdfWidth - 30, pdfHeight - 10);
      }
    }

    // Save PDF
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

# Logo Setup Instructions

## Adding the AlRajhi Logo

To enable logo features in dashboard exports (PNG, JPG, PDF), you need to add the company logo:

### Steps:

1. **Place your logo file** in the `public` folder:
   ```
   public/alrajhi_logo.png
   ```

2. **Logo Requirements**:
   - Format: PNG (recommended for transparency)
   - Recommended size: 200-400px width
   - Transparent background preferred
   - Will be automatically resized in exports

3. **Usage**:
   - Logo will appear automatically in:
     - PNG image exports (top center)
     - JPG image exports (top center)
     - PDF exports (header of first page)
   
4. **Optional: Favicon**:
   - Replace `public/favicon.ico` with your own favicon
   - Or add `public/favicon.png` and update `public/index.html`

### Current Export Features:

- ✅ Export as JSON (dashboard configuration)
- ✅ Export as PNG with logo header
- ✅ Export as JPG with logo header  
- ✅ Export as PDF with logo and page numbers
- ✅ Export widget data as CSV
- ✅ Export widget data as Excel (XLSX)

All image/PDF exports include:
- Company logo (if present at `public/alrajhi_logo.png`)
- Dashboard title
- Timestamp
- Professional formatting

const puppeteer = require('puppeteer');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Template = require('../models/Template');
const CollegeAsset = require('../models/CollegeAsset');
const Record = require('../models/Record');

const generateDocument = async (req, res) => {
  try {
    const { templateId, variables, labId } = req.body;
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    let pdfBuffer;

    if (template.type === 'html') {
      pdfBuffer = await generateHtmlPdf(template.contentHtml, variables);
    } else if (template.type === 'pdf') {
      pdfBuffer = await generatePdfLibMap(template.pdfPath, template.mappedVariables, variables);
    }

    await Record.create({
      user: req.user._id,
      lab: labId,
      department: req.user.department,
      documentType: template.name,
      filePath: 'Generated On-the-fly'
    });

    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadAllDocs = async (req, res) => {
  try {
    const { documents, labId } = req.body;
    // documents is array of { templateId, variables, fileName }
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`documents-${Date.now()}.zip`);
    archive.pipe(res);

    for (const doc of documents) {
      const template = await Template.findById(doc.templateId);
      if (!template) continue;

      let pdfBuffer;
      if (template.type === 'html') {
         pdfBuffer = await generateHtmlPdf(template.contentHtml, doc.variables);
      } else {
         pdfBuffer = await generatePdfLibMap(template.pdfPath, template.mappedVariables, doc.variables);
      }

      await Record.create({
        user: req.user._id,
        lab: labId,
        department: req.user.department,
        documentType: template.name,
        filePath: 'ZIP Generated On-the-fly'
      });

      archive.append(pdfBuffer, { name: `${doc.fileName || template.name}.pdf` });
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateHtmlPdf = async (htmlContent, variables) => {
  let content = htmlContent;
  
  for (const [key, value] of Object.entries(variables || {})) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
  }

  const headAsset = await CollegeAsset.findOne({ type: 'HeaderPDF' });
  const logoAsset = await CollegeAsset.findOne({ type: 'LogoPNG' });

  let logoBase64 = '';
  if (logoAsset) {
    const logoFile = fs.readFileSync(path.join(__dirname, '..', logoAsset.filePath));
    logoBase64 = `data:image/png;base64,${logoFile.toString('base64')}`;
  }
  
  const finalHtml = `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 25mm 20mm 20mm 20mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            z-index: -1;
            width: 400px;
          }
          table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; font-weight: bold; background: #eee; }
          tfoot { display: table-footer-group; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        ${logoBase64 ? `<img src="${logoBase64}" class="watermark" />` : ''}
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: 'load' });
  let buffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  if (headAsset) {
     const mergedPdf = await PDFDocument.create();
     const headerPdfDoc = await PDFDocument.load(fs.readFileSync(path.join(__dirname, '..', headAsset.filePath)));
     const contentPdfDoc = await PDFDocument.load(buffer);
     
     const [headerPageTemplate] = await mergedPdf.embedPdf(headerPdfDoc, [0]);
     
     const contentPages = await mergedPdf.copyPages(contentPdfDoc, contentPdfDoc.getPageIndices());
     for (const p of contentPages) {
        // Draw header at the top, shifted down by 5mm maybe, or just at y=height
        p.drawPage(headerPageTemplate, {
          x: 0,
          y: p.getHeight() - (headerPageTemplate.height * (p.getWidth() / headerPageTemplate.width)),
          width: p.getWidth(),
          height: headerPageTemplate.height * (p.getWidth() / headerPageTemplate.width)
        });
        mergedPdf.addPage(p);
     }
     buffer = await mergedPdf.save();
  }

  return Buffer.from(buffer);
};

const generatePdfLibMap = async (pdfPath, mappedVariables, variables) => {
  const existingPdfBytes = fs.readFileSync(path.join(__dirname, '..', pdfPath));
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  for (const map of mappedVariables) {
    const valStr = variables[map.variableName] || '';
    const page = pages[map.page || 0];
    page.drawText(String(valStr), {
      x: map.x,
      y: map.y,
      size: 12,
      color: rgb(0, 0, 0)
    });
  }

  const headAsset = await CollegeAsset.findOne({ type: 'HeaderPDF' });
  if (headAsset) {
     const headerPdfDoc = await PDFDocument.load(fs.readFileSync(path.join(__dirname, '..', headAsset.filePath)));
     const [headerPageTemplate] = await pdfDoc.embedPdf(headerPdfDoc, [0]);
     for (const p of pages) {
        p.drawPage(headerPageTemplate, {
          x: 0,
          y: p.getHeight() - (headerPageTemplate.height * (p.getWidth() / headerPageTemplate.width)),
          width: p.getWidth(),
          height: headerPageTemplate.height * (p.getWidth() / headerPageTemplate.width)
        });
     }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = { generateDocument, downloadAllDocs };

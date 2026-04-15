import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  async generatePDF(elementId: string, title: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#0a0e14',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF('l', 'mm', 'a4');
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    doc.setFontSize(20);
    doc.text(title, 15, 20);
    
    doc.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
    doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
  }
}

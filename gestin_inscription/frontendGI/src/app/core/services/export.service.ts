import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    region?: string;
  };
  columns?: string[];
  includeStats?: boolean;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  /**
   * Export des dossiers avec options avancées
   */
  exportDossiers(options: ExportOptions): Observable<ExportResult> {
    return this.http.post<ExportResult>(`${this.apiUrl}/dossiers`, options);
  }

  /**
   * Export des candidats
   */
  exportCandidats(options: ExportOptions): Observable<ExportResult> {
    return this.http.post<ExportResult>(`${this.apiUrl}/candidats`, options);
  }

  /**
   * Export des statistiques
   */
  exportStatistics(options: ExportOptions): Observable<ExportResult> {
    return this.http.post<ExportResult>(`${this.apiUrl}/statistics`, options);
  }

  /**
   * Export côté client (fallback si pas d'API backend)
   */
  exportToCSV(data: any[], filename: string, columns?: string[]): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    // Déterminer les colonnes à exporter
    const headers = columns || Object.keys(data[0]);
    
    // Créer le contenu CSV
    const csvContent = this.generateCSVContent(data, headers);
    
    // Télécharger le fichier
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Export Excel côté client (format CSV compatible Excel)
   */
  exportToExcel(data: any[], filename: string, columns?: string[]): void {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    // Déterminer les colonnes à exporter
    const headers = columns || Object.keys(data[0]);
    
    // Créer le contenu CSV avec BOM pour Excel
    const csvContent = '\ufeff' + this.generateCSVContent(data, headers);
    
    // Télécharger le fichier
    this.downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.ms-excel');
  }

  /**
   * Export JSON pour développement/debug
   */
  exportToJSON(data: any[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * Export avec template personnalisé
   */
  exportWithTemplate(data: any[], template: ExportTemplate): void {
    let content = '';
    
    switch (template.format) {
      case 'csv':
        const columns = template.columns || (data.length > 0 ? Object.keys(data[0]) : []);
        content = this.generateCSVContent(data, columns, template.headers);
        break;
      case 'html':
        content = this.generateHTMLContent(data, template);
        break;
      case 'xml':
        content = this.generateXMLContent(data, template);
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      default:
        const defaultColumns = template.columns || (data.length > 0 ? Object.keys(data[0]) : []);
        content = this.generateCSVContent(data, defaultColumns);
    }
    
    this.downloadFile(content, template.filename, template.mimeType);
  }

  /**
   * Génération du contenu CSV
   */
  private generateCSVContent(data: any[], headers: string[], customHeaders?: string[]): string {
    const csvHeaders = customHeaders || headers;
    const csvRows = [csvHeaders.join(',')];
    
    data.forEach(item => {
      const row = headers.map(header => {
        let value = item[header];
        
        // Traitement des valeurs spéciales
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Génération du contenu HTML
   */
  private generateHTMLContent(data: any[], template: ExportTemplate): string {
    const headers = template.columns || Object.keys(data[0] || {});
    const customHeaders = template.headers || headers;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${template.title || 'Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 20px; }
          .stats { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.title || 'Export des données'}</h1>
          <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        <table>
          <thead>
            <tr>
    `;
    
    customHeaders.forEach(header => {
      html += `<th>${header}</th>`;
    });
    
    html += `
            </tr>
          </thead>
          <tbody>
    `;
    
    data.forEach(item => {
      html += '<tr>';
      headers.forEach(header => {
        let value = item[header];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
          </tbody>
        </table>
        <div class="stats">
          <p>Total: ${data.length} enregistrements</p>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }

  /**
   * Génération du contenu XML
   */
  private generateXMLContent(data: any[], template: ExportTemplate): string {
    const rootElement = template.xmlRoot || 'data';
    const itemElement = template.xmlItem || 'item';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
    
    data.forEach(item => {
      xml += `  <${itemElement}>\n`;
      Object.keys(item).forEach(key => {
        const value = item[key];
        xml += `    <${key}>${this.escapeXML(value)}</${key}>\n`;
      });
      xml += `  </${itemElement}>\n`;
    });
    
    xml += `</${rootElement}>`;
    return xml;
  }

  /**
   * Échappement XML
   */
  private escapeXML(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Téléchargement du fichier
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Validation des données avant export
   */
  validateExportData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || !Array.isArray(data)) {
      errors.push('Les données doivent être un tableau');
    } else if (data.length === 0) {
      errors.push('Aucune donnée à exporter');
    } else if (data.length > 10000) {
      errors.push('Trop de données (limite: 10000 enregistrements)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prévisualisation des données d'export
   */
  previewExport(data: any[], options: ExportOptions): {
    preview: any[];
    totalRows: number;
    columns: string[];
  } {
    const columns = options.columns || (data.length > 0 ? Object.keys(data[0]) : []);
    const preview = data.slice(0, 5); // Première 5 lignes pour prévisualisation
    
    return {
      preview,
      totalRows: data.length,
      columns
    };
  }
}

export interface ExportTemplate {
  format: 'csv' | 'html' | 'xml' | 'json';
  filename: string;
  mimeType: string;
  columns?: string[];
  headers?: string[];
  title?: string;
  xmlRoot?: string;
  xmlItem?: string;
}

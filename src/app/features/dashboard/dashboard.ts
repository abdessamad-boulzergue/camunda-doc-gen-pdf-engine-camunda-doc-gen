import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentTemplate } from '../../core/models/document.model';
import { DocumentService } from '../../core/services/document.service';
import { DocumentCard } from './components/document-card/document-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DocumentCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  documents: DocumentTemplate[] = [];

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    console.log('Loading documents...');
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        console.log('Documents loaded:', docs);
        this.documents = docs;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error loading documents:', err);
      }
    });
  }

  createNewDocument() {
    this.router.navigate(['/editor']);
  }

  navigateToEditor(id: string) {
    this.router.navigate(['/editor', id]);
  }

  previewDocument(id: string) {
    // For now, preview just goes to editor, or maybe we add a 'preview' mode query param
    this.router.navigate(['/editor', id], { queryParams: { mode: 'preview' } });
  }

  downloadDocument(id: string) {
    const doc = this.documents.find(d => d.id === id);
    if (!doc) return;

    this.documentService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title.replace(/\s+/g, '_')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Failed to download PDF. Ensure backend is running.');
      }
    });
  }
}

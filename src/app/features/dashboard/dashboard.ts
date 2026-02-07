import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentTemplate, MOCK_DOCUMENTS } from '../../core/models/document.model';
import { DocumentCard } from './components/document-card/document-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DocumentCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  documents: DocumentTemplate[] = MOCK_DOCUMENTS;

  constructor(private router: Router) { }

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
}

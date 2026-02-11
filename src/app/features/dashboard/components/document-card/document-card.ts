import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentTemplate } from '../../../../core/models/document.model';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-card.html',
  styleUrl: './document-card.css',
})
export class DocumentCard {
  @Input() document!: DocumentTemplate;
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

  onView(event: Event) {
    event.stopPropagation();
    this.view.emit(this.document.id);
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.document.id);
  }

  onDownload(event: Event) {
    event.stopPropagation();
    this.download.emit(this.document.id);
  }
}

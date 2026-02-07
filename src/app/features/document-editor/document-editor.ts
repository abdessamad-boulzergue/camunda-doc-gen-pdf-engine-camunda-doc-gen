import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// Using direct package imports
import { FormEditor } from '@bpmn-io/form-js-editor';
import { Form } from '@bpmn-io/form-js-viewer';
import { DocumentService } from '../../core/services/document.service';
import { DocumentTemplate } from '../../core/models/document.model';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css',
})
export class DocumentEditor implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formContainer', { static: true }) formContainer!: ElementRef;

  id: string | null = null;
  mode: 'edit' | 'preview' = 'edit';
  document: DocumentTemplate | null = null;
  private formInstance: any;

  // Initial schema
  private schema: any = {
    components: [],
    schemaVersion: 4,
    exporter: {
      name: 'form-js',
      version: '0.1.0'
    },
    type: 'default'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        this.loadDocument(this.id);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const modeParam = params.get('mode');
      if (modeParam === 'preview') {
        this.mode = 'preview';
      } else {
        this.mode = 'edit';
      }
    });
  }

  loadDocument(id: string) {
    this.documentService.getDocumentById(id).subscribe(doc => {
      console.log('Loaded document', doc);
      this.document = doc;
      if (doc.content) {
        try {
          this.schema = JSON.parse(doc.content);
          console.log('Parsed schema from content', this.schema);
        } catch (e) {
          console.error('Error parsing schema from content', e);
        }
      }

      // Update form instance if it exists
      if (this.formInstance) {
        this.formInstance.importSchema(this.schema).catch((err: any) => console.error('Import schema failed', err));
      }
    });
  }

  async ngAfterViewInit() {
    if (this.mode === 'edit') {
      this.formInstance = new FormEditor({
        container: this.formContainer.nativeElement
      });
    } else {
      this.formInstance = new Form({
        container: this.formContainer.nativeElement
      });
    }

    try {
      await this.formInstance.importSchema(this.schema);
      if (this.mode === 'preview') {
        // Set some mock data for preview
        this.formInstance.on('changed', (event: any) => {
          console.log('Form data changed', event);
        });
      }
    } catch (err) {
      console.error('Failed to import form schema', err);
    }
  }

  ngOnDestroy() {
    if (this.formInstance) {
      this.formInstance.destroy();
    }
  }

  toggleMode() {
    this.mode = this.mode === 'edit' ? 'preview' : 'edit';
    // Ideally we should save schema and re-init, but for now just reload page or navigate
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: this.mode },
      queryParamsHandling: 'merge'
    }).then(() => {
      // Simple hack to re-init component for now since we change class instance
      window.location.reload();
    });
  }

  async saveDocument() {
    if (!this.formInstance) return;

    try {
      const schema = this.formInstance.saveSchema();
      console.log('Saving schema:', schema);

      const doc: DocumentTemplate = {
        id: this.id || '',
        title: this.document?.title || 'New Document',
        description: this.document?.description || 'Created via Editor',
        updatedAt: new Date(),
        content: JSON.stringify(schema)
      };

      if (this.id) {
        this.documentService.updateDocument(this.id, doc).subscribe(updated => {
          console.log('Document updated', updated);
          this.document = updated;
          alert('Document saved successfully!');
        });
      } else {
        this.documentService.createDocument(doc).subscribe(created => {
          console.log('Document created', created);
          this.router.navigate(['/editor', created.id], { replaceUrl: true });
          alert('Document created successfully!');
        });
      }
    } catch (err) {
      console.error('Failed to save document', err);
      alert('Failed to save document');
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

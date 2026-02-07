import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Using direct package imports
import { FormEditor } from '@bpmn-io/form-js-editor';
import { Form } from '@bpmn-io/form-js-viewer';
import { DocumentService } from '../../core/services/document.service';
import { DocumentTemplate } from '../../core/models/document.model';
import { DataSource, MOCK_DATA_SOURCES } from '../../core/models/data-source.model';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css',
})
export class DocumentEditor implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formContainer', { static: true }) formContainer!: ElementRef;

  id: string | null = null;
  mode: 'edit' | 'preview' = 'edit';
  document: DocumentTemplate | null = null;
  title: string = 'New Document';
  dataSources: DataSource[] = MOCK_DATA_SOURCES;
  selectedDataSourceId: string | null = null;
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
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
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
      this.title = doc.title;
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
      this.cdr.detectChanges();
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
        if (this.selectedDataSourceId) {
          this.updatePreviewData();
        }
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: this.mode },
      queryParamsHandling: 'merge'
    }).then(() => this.initForm());
  }

  private async initForm() {
    this.formInstance?.destroy();

    this.formInstance =
      this.mode === 'edit'
        ? new FormEditor({ container: this.formContainer.nativeElement })
        : new Form({ container: this.formContainer.nativeElement });

    await this.formInstance.importSchema(this.schema);

    if (this.mode === 'preview' && this.selectedDataSourceId) {
      this.updatePreviewData();
    }
  }


  async saveDocument() {
    if (!this.formInstance) return;

    try {
      const result = this.formInstance.saveSchema();
      console.log('saveSchema result:', result);
      const schema = result.schema || result;

      const doc: DocumentTemplate = {
        id: this.id || '',
        title: this.title,
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

  onDataSourceChange() {
    if (this.mode === 'preview' && this.formInstance) {
      this.updatePreviewData();
    }
  }

  private updatePreviewData() {
    const selectedSource = this.dataSources.find(ds => ds.id === this.selectedDataSourceId);
    if (selectedSource) {
      this.formInstance.importSchema(this.schema, selectedSource.data).catch((err: any) => console.error('Import schema with data failed', err));
    } else {
      this.formInstance.importSchema(this.schema).catch((err: any) => console.error('Import schema failed', err));
    }
  }
}

import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// Using direct package imports
import { FormEditor } from '@bpmn-io/form-js-editor';
import { Form } from '@bpmn-io/form-js-viewer';

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
  private formInstance: any;

  // Mock initial schema
  private schema = {
    components: [
      {
        key: 'textfield1',
        label: 'Text Field',
        type: 'textfield',
        validate: {
          required: true
        }
      }
    ],
    schemaVersion: 4,
    exporter: {
      name: 'form-js',
      version: '0.1.0'
    },
    type: 'default'
  };

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
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

  goBack() {
    this.router.navigate(['/']);
  }
}

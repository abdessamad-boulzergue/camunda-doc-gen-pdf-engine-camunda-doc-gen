import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { DocumentEditor } from './features/document-editor/document-editor';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'editor', component: DocumentEditor },
    { path: 'editor/:id', component: DocumentEditor },
];

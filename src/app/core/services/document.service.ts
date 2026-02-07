import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentTemplate } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = `${environment.apiUrl}/documents`;

    constructor(private http: HttpClient) { }

    getDocuments(): Observable<DocumentTemplate[]> {
        return this.http.get<DocumentTemplate[]>(this.apiUrl);
    }

    getDocumentById(id: string): Observable<DocumentTemplate> {
        return this.http.get<DocumentTemplate>(`${this.apiUrl}/${id}`);
    }

    createDocument(document: DocumentTemplate): Observable<DocumentTemplate> {
        return this.http.post<DocumentTemplate>(this.apiUrl, document);
    }

    updateDocument(id: string, document: DocumentTemplate): Observable<DocumentTemplate> {
        return this.http.put<DocumentTemplate>(`${this.apiUrl}/${id}`, document);
    }

    deleteDocument(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

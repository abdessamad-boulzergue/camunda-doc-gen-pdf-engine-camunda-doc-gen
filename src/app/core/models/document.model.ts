export interface DocumentTemplate {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string; // For now just a color or placeholder
    updatedAt: Date;
    content?: string; // JSON schema string
}

export const MOCK_DOCUMENTS: DocumentTemplate[] = [
    {
        id: '1',
        title: 'Employee Onboarding',
        description: 'Form for new employee details',
        updatedAt: new Date(),
    },
    {
        id: '2',
        title: 'Invoice Request',
        description: 'Submit an invoice for payment',
        updatedAt: new Date(Date.now() - 86400000), // Yesterday
    },
    {
        id: '3',
        title: 'Leave Application',
        description: 'Apply for annual leave',
        updatedAt: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
        id: '4',
        title: 'Data Binding Demo (Employees)',
        description: 'Select "John Doe" or "Jane Smith" in Preview to see data binding.',
        updatedAt: new Date(),
        content: JSON.stringify({
            schemaVersion: 4,
            exporter: {
                name: 'form-js',
                version: '0.1.0'
            },
            components: [
                {
                    key: 'firstName',
                    label: 'First Name',
                    type: 'textfield',
                    id: 'Field_firstName'
                },
                {
                    key: 'lastName',
                    label: 'Last Name',
                    type: 'textfield',
                    id: 'Field_lastName'
                },
                {
                    key: 'email',
                    label: 'Email',
                    type: 'textfield',
                    id: 'Field_email'
                },
                {
                    key: 'department',
                    label: 'Department',
                    type: 'textfield',
                    id: 'Field_department'
                }
            ],
            type: 'default'
        })
    }
];

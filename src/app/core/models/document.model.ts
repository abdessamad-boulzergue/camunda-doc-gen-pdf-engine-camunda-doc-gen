export interface DocumentTemplate {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string; // For now just a color or placeholder
    updatedAt: Date;
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
];

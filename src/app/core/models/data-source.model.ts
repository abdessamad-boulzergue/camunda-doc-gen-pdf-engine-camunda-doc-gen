export interface DataSource {
    id: string;
    name: string;
    data: any;
}

export const MOCK_DATA_SOURCES: DataSource[] = [
    {
        id: 'emp-1',
        name: 'John Doe (Employee)',
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            startDate: '2023-01-15'
        }
    },
    {
        id: 'emp-2',
        name: 'Jane Smith (Employee)',
        data: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            department: 'Marketing',
            startDate: '2022-11-01'
        }
    },
    {
        id: 'inv-1',
        name: 'Invoice #12345',
        data: {
            invoiceNumber: 'INV-12345',
            vendor: 'Acme Corp',
            amount: 1500.00,
            currency: 'USD',
            date: '2023-10-25'
        }
    }
];

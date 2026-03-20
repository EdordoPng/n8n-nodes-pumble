import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

// ── UI Parameters ──────────────────────────────────────────────────────────
export const description: INodeProperties[] = [
    {
        displayName: 'User Name or ID',
        name: 'userId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getUsers' },
        required: true,
        displayOptions: {
            show: {
                resource: ['directMessage'],
                operation: ['send'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        displayOptions: {
            show: {
                resource: ['directMessage'],
                operation: ['send'],
            },
        },
        default: '',
        placeholder: 'Hey, can we sync later?',
        description: 'The text content of the direct message',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['directMessage'],
                operation: ['send'],
            },
        },
        options: [
            {
                displayName: 'Attachments',
                name: 'attachments',
                type: 'json',
                default: '[]',
                description: 'A JSON array of attachment objects to include with the message',
            },
        ],
    },
];

// ── Execute Function ───────────────────────────────────────────────────────
export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const userId = this.getNodeParameter('userId', i, '') as string;
    const text   = this.getNodeParameter('text', i, '') as string;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    if (!userId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'User ID cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!text.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Text cannot be empty.',
            { itemIndex: i },
        );
    }

    // Blocca l'invio a se stessi — Pumble restituisce 403 in quel caso
    const me = await pumbleApiRequest.call(this, 'GET', '/myInfo') as IDataObject;
    const myId = me.id as string;
    if (userId === myId) {
        throw new NodeOperationError(
            this.getNode(),
            'You cannot send a direct message to yourself. Please select a different user.',
            { itemIndex: i },
        );
    }

    const body: IDataObject = { userId, text };

    if (additionalFields.attachments !== undefined) {
        let attachments: unknown;
        try {
            attachments =
                typeof additionalFields.attachments === 'string'
                    ? (JSON.parse(additionalFields.attachments) as unknown)
                    : additionalFields.attachments;
        } catch {
            throw new NodeOperationError(
                this.getNode(),
                'Attachments must be a valid JSON array.',
                { itemIndex: i },
            );
        }
        if (!Array.isArray(attachments)) {
            throw new NodeOperationError(
                this.getNode(),
                'Attachments must be a JSON array, not an object or primitive.',
                { itemIndex: i },
            );
        }
        body.attachments = attachments as IDataObject[];
    }

    const responseData = await pumbleApiRequest.call(
        this,
        'POST',
        '/dmUser',
        body,
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}

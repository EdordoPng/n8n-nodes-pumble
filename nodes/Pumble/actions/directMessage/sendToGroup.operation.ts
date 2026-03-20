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
        displayName: 'User Names or IDs',
        name: 'userIds',
        type: 'multiOptions',
        typeOptions: { loadOptionsMethod: 'getUsers' },
        required: true,
        displayOptions: {
            show: {
                resource: ['directMessage'],
                operation: ['sendToGroup'],
            },
        },
        default: [],
        description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
                operation: ['sendToGroup'],
            },
        },
        default: '',
        placeholder: 'Team sync at 3pm!',
        description: 'The text content of the group direct message',
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
                operation: ['sendToGroup'],
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

    const userIds          = this.getNodeParameter('userIds', i, []) as string[];
    const text             = this.getNodeParameter('text', i, '') as string;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    if (!text.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Text cannot be empty.',
            { itemIndex: i },
        );
    }

    if (userIds.length < 2) {
        throw new NodeOperationError(
            this.getNode(),
            'At least two User IDs are required for a group direct message.',
            { itemIndex: i },
        );
    }

    // Controlla se l'utente corrente è tra i destinatari
    const me = await pumbleApiRequest.call(this, 'GET', '/myInfo') as IDataObject;
    const myId = me.id as string;
    const selfIncluded = userIds.includes(myId);

    const body: IDataObject = { userIds, text };

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

    const responseData = await pumbleApiRequest.call(this, 'POST', '/dmGroup', body);

    const result = this.helpers.returnJsonArray(responseData);

    // Aggiunge _warning all'output se l'utente corrente era tra i destinatari
    if (selfIncluded) {
        (result[0].json as IDataObject)._warning =
            'You were included in the recipients list but Pumble does not deliver group DMs to yourself. The message was sent to the other recipients only.';
    }

    return this.helpers.constructExecutionMetaData(result, { itemData: { item: i } });
}

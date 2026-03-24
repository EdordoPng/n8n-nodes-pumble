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
        displayName: 'Channel Name or ID',
        name: 'channelId',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'getChannels' },
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['sendReply'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['sendReply'],
            },
        },
        default: '',
        placeholder: 'MSG1234567890',
        description: 'The ID of the parent message to reply to (thread root)',
    },
    {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['sendReply'],
            },
        },
        default: '',
        placeholder: 'Thanks for the update!',
        description: 'The text content of the reply',
    },
    {
        displayName: 'Send As Bot',
        name: 'asBot',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['sendReply'],
            },
        },
        description: 'Whether to post the reply as the Addon Bot identity instead of the authenticated user. Note: bots cannot reply in private channels.',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['sendReply'],
            },
        },
        options: [
            {
                displayName: 'Attachments',
                name: 'attachments',
                type: 'json',
                default: '[]',
                description: 'A JSON array of attachment objects to include with the reply',
            },
        ],
    },
];

// ── Execute Function ───────────────────────────────────────────────────────
export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const channelId = this.getNodeParameter('channelId', i, '') as string;
    const messageId = this.getNodeParameter('messageId', i, '') as string;
    const text      = this.getNodeParameter('text', i, '') as string;
    const asBot     = this.getNodeParameter('asBot', i, false) as boolean;
    const additionalFields = this.getNodeParameter(
        'additionalFields', i, {},
    ) as IDataObject;

    if (!channelId.trim()) {
        throw new NodeOperationError(this.getNode(), 'Channel ID cannot be empty.', { itemIndex: i });
    }
    if (!messageId.trim()) {
        throw new NodeOperationError(this.getNode(), 'Message ID cannot be empty.', { itemIndex: i });
    }
    if (!text.trim()) {
        throw new NodeOperationError(this.getNode(), 'Text cannot be empty.', { itemIndex: i });
    }

    const body: IDataObject = { channelId, messageId, text };

    if (asBot) {
        body.asBot = true;
    }

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

    const responseData = await pumbleApiRequest.call(this, 'POST', '/sendReply', body);

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}

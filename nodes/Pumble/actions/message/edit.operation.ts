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
                operation: ['edit'],
            },
        },
        default: '',
        description: 'The channel where the message was sent. Note: editing DM messages is not supported by the Pumble API. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['edit'],
            },
        },
        default: '',
        placeholder: 'MSG1234567890',
        description: 'The ID of the message to edit',
    },
    {
        displayName: 'New Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['edit'],
            },
        },
        default: '',
        placeholder: 'Updated message content',
        // Replaces the entire existing text — not appended
        description: 'The new text that will replace the current message content entirely',
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

    if (!channelId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Channel ID cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!messageId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Message ID cannot be empty.',
            { itemIndex: i },
        );
    }
    if (!text.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'New Text cannot be empty.',
            { itemIndex: i },
        );
    }

    const body: IDataObject = { channelId, messageId, text };

    const responseData = await pumbleApiRequest.call(
        this,
        'POST',
        '/editMessage',
        body,
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}

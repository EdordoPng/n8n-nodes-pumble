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
                operation: ['get'],
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
                operation: ['get'],
            },
        },
        default: '',
        placeholder: 'MSG1234567890',
        description: 'The ID of the message to retrieve',
    },
];

// ── Execute Function ───────────────────────────────────────────────────────
export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const channelId = this.getNodeParameter('channelId', i, '') as string;
    const messageId = this.getNodeParameter('messageId', i, '') as string;

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

    // GET requests carry parameters in the query string, never in the body
    const qs: IDataObject = { channelId, messageId };

    const responseData = await pumbleApiRequest.call(
        this,
        'GET',
        '/fetchMessage',
        {},
        qs,
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}

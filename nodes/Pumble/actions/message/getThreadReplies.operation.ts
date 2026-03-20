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
                operation: ['getThreadReplies'],
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
                operation: ['getThreadReplies'],
            },
        },
        default: '',
        placeholder: 'MSG1234567890',
        // This is the root message of the thread, not a reply
        description: 'The ID of the parent message whose thread replies to retrieve',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['getThreadReplies'],
            },
        },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
            minValue: 1,
            maxValue: 100,
        },
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['getThreadReplies'],
                returnAll: [false],
            },
        },
        default: 50,
        // Exact wording required by n8n ESLint rule node-param-description-wrong-for-limit
        description: 'Max number of results to return',
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
                operation: ['getThreadReplies'],
            },
        },
        options: [
            {
                displayName: 'Cursor',
                name: 'cursor',
                type: 'string',
                default: '',
                description: 'Pagination cursor returned by the previous request to fetch the next page',
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
    const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
    const additionalFields = this.getNodeParameter(
        'additionalFields', i, {},
    ) as IDataObject;

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

    // Both required params always go in qs — this is a GET request
    const qs: IDataObject = { channelId, rootMessageId: messageId };


    if (returnAll) {
        const allResults: IDataObject[] = [];
        let cursor: string | undefined;

        do {
            if (cursor) qs.cursor = cursor;

            const responseData = await pumbleApiRequest.call(
                this,
                'GET',
                '/fetchThreadReplies',
                {},
                qs,
            );

            const replies = (responseData.messages ?? responseData) as IDataObject[];
            allResults.push(...(Array.isArray(replies) ? replies : [responseData]));

            cursor = responseData.nextCursor as string | undefined;
        } while (cursor);

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(allResults),
            { itemData: { item: i } },
        );

    } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.limit = limit;

        if (additionalFields.cursor) {
            qs.cursor = (additionalFields.cursor as string).trim();
        }

        const responseData = await pumbleApiRequest.call(
            this,
            'GET',
            '/fetchThreadReplies',
            {},
            qs,
        );

        const replies = (responseData.messages ?? responseData) as IDataObject[];
        const results = Array.isArray(replies) ? replies : [responseData];

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(results),
            { itemData: { item: i } },
        );
    }
}

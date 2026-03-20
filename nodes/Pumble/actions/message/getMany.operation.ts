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
                operation: ['getMany'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['getMany'],
            },
        },
        default: false,
        // When true, the execute function loops through all pages automatically
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
        // Only show this field when returnAll is false
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['getMany'],
                returnAll: [false],
            },
        },
        default: 50,
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
                operation: ['getMany'],
            },
        },
        options: [
            {
                displayName: 'Cursor',
                name: 'cursor',
                type: 'string',
                default: '',
                // Pumble uses cursor-based pagination — pass the cursor from
                // the previous response to fetch the next page of results
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

    const channelId  = this.getNodeParameter('channelId', i, '') as string;
    const returnAll  = this.getNodeParameter('returnAll', i, false) as boolean;
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

    const qs: IDataObject = { channelId };

    // Attach optional cursor for manual pagination
    if (additionalFields.cursor) {
        qs.cursor = additionalFields.cursor as string;
    }

    if (returnAll) {
        // Fetch all pages automatically by following cursors until exhausted.
        // Each iteration appends results and updates the cursor for the next call.
        const allResults: IDataObject[] = [];
        let cursor: string | undefined;

        do {
            if (cursor) qs.cursor = cursor;

            const responseData = await pumbleApiRequest.call(
                this,
                'GET',
                '/listMessages',
                {},
                qs,
            );

            const messages = (responseData.messages ?? responseData) as IDataObject[];
            allResults.push(...(Array.isArray(messages) ? messages : [responseData]));

            // Stop when the API returns no next cursor
            cursor = responseData.nextCursor as string | undefined;
        } while (cursor);

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(allResults),
            { itemData: { item: i } },
        );

    } else {
        // Fetch a single page with the requested limit
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.limit = limit;

        const responseData = await pumbleApiRequest.call(
            this,
            'GET',
            '/listMessages',
            {},
            qs,
        );

        const messages = (responseData.messages ?? responseData) as IDataObject[];
        const results = Array.isArray(messages) ? messages : [responseData];

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(results),
            { itemData: { item: i } },
        );
    }
}

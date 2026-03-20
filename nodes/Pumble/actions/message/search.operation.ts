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
        displayName: 'Query',
        name: 'query',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['search'],
            },
        },
        default: '',
        placeholder: 'project update',
        description: 'The search term to look for in messages',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['search'],
            },
        },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
            show: {
                resource: ['message'],
                operation: ['search'],
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
                operation: ['search'],
            },
        },
        options: [
            {
                displayName: 'Channel Names or IDs',
                name: 'in',
                type: 'multiOptions',                              // ← era options singola
                typeOptions: { loadOptionsMethod: 'getChannels' },
                default: [],
                description: 'Filter results to specific channels. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            },
            {
                displayName: 'From User Names or IDs',
                name: 'from',
                type: 'multiOptions',                              // ← nuovo campo
                typeOptions: { loadOptionsMethod: 'getUsers' },
                default: [],
                description: 'Filter results to messages sent by specific users. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            },
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

    const query            = this.getNodeParameter('query', i, '') as string;
    const returnAll        = this.getNodeParameter('returnAll', i, false) as boolean;
    const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

    if (!query.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Query cannot be empty.',
            { itemIndex: i },
        );
    }

    const body: IDataObject = { text: query };          

    if ((additionalFields.in as string[])?.length > 0) {
        body.in = additionalFields.in;                     
    }

    if ((additionalFields.from as string[])?.length > 0) {
        body.from = additionalFields.from;                 
    }

    if (returnAll) {
        const allResults: IDataObject[] = [];
        let cursor: string | undefined;

        do {
            if (cursor) body.cursor = cursor;

            const responseData = await pumbleApiRequest.call(this, 'POST', '/searchMessages', body);
            const messages = (responseData.messages ?? responseData) as IDataObject[];
            allResults.push(...(Array.isArray(messages) ? messages : [responseData]));
            cursor = responseData.nextCursor as string | undefined;
        } while (cursor);

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(allResults),
            { itemData: { item: i } },
        );

    } else {
        const limitRaw = this.getNodeParameter('limit', i, 50) as number;
        const limit = Math.min(limitRaw, 20);
        body.limit = limit;

        if (additionalFields.cursor) {
            body.cursor = (additionalFields.cursor as string).trim();
        }

        const responseData = await pumbleApiRequest.call(this, 'POST', '/searchMessages', body);
        const messages = (responseData.messages ?? responseData) as IDataObject[];
        const results = Array.isArray(messages) ? messages : [responseData];

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(results),
            { itemData: { item: i } },
        );
    }
}

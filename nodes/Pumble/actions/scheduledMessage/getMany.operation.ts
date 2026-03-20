import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

export const description: INodeProperties[] = [
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['getMany'],
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
                resource: ['scheduledMessage'],
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
                resource: ['scheduledMessage'],
                operation: ['getMany'],
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

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
    const additionalFields = this.getNodeParameter(
        'additionalFields', i, {},
    ) as IDataObject;

    const qs: IDataObject = {};

    if (returnAll) {
        const allResults: IDataObject[] = [];
        let cursor: string | undefined;

        do {
            if (cursor) qs.cursor = cursor;

            const responseData = await pumbleApiRequest.call(
                this, 'GET', '/fetchScheduledMessages', {}, qs,
            );

            const messages = (responseData.scheduledMessages ?? responseData) as IDataObject[];
            allResults.push(...(Array.isArray(messages) ? messages : [responseData]));
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
            this, 'GET', '/fetchScheduledMessages', {}, qs,
        );

        const messages = (responseData.scheduledMessages ?? responseData) as IDataObject[];
        const results = Array.isArray(messages) ? messages : [responseData];

        return this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(results),
            { itemData: { item: i } },
        );
    }
}

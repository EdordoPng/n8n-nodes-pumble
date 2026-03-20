import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

export const description: INodeProperties[] = [
    {
        displayName: 'Scheduled Message ID',
        name: 'scheduledMessageId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['scheduledMessage'],
                operation: ['delete'],
            },
        },
        default: '',
        placeholder: 'SCH1234567890',
        description: 'The ID of the scheduled message to delete',
    },
];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {

    const scheduledMessageId = this.getNodeParameter(
        'scheduledMessageId', i, '',
    ) as string;

    if (!scheduledMessageId.trim()) {
        throw new NodeOperationError(
            this.getNode(),
            'Scheduled Message ID cannot be empty.',
            { itemIndex: i },
        );
    }

    // DELETE — params in qs, empty body
    const responseData = await pumbleApiRequest.call(
        this, 'DELETE', '/deleteScheduledMessage', {}, { scheduledMessageId },
    );

    return this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
    );
}

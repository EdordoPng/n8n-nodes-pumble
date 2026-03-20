import type {
    IDataObject,
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { pumbleApiRequest } from './GenericFunctions';


// Import all resource aggregators — each index.ts exposes descriptions and execute functions
import * as message from './actions/message/index';
import * as directMessage from './actions/directMessage/index';
import * as channel from './actions/channel/index';
import * as scheduledMessage from './actions/scheduledMessage/index';
import * as user from './actions/user/index';

export class Pumble implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Pumble',
        name: 'pumble',
        icon: 'file:pumble.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with the Pumble API',
        defaults: {
            name: 'Pumble',
        },
        usableAsTool: true,
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [
            {
                name: 'pumbleApi',
                required: true,
            },
        ],

        properties: [
            // ── Resource selector ────────────────────────────────────────
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'Channel', value: 'channel' },
                    { name: 'Direct Message', value: 'directMessage' },
                    { name: 'Message', value: 'message' },
                    { name: 'Scheduled Message', value: 'scheduledMessage' },
                    { name: 'User', value: 'user' },
                ],
                default: 'message',
            },

            // ── Operation selectors — one per resource ───────────────────
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['message'] } },
                options: [
                    { name: 'Delete', value: 'delete', action: 'Delete a message' },
                    { name: 'Edit', value: 'edit', action: 'Edit a message' },
                    { name: 'Get', value: 'get', action: 'Get a message' },
                    { name: 'Get Many', value: 'getMany', action: 'Get many messages' },
                    { name: 'Get Thread Replies', value: 'getThreadReplies', action: 'Get thread replies' },
                    { name: 'Search', value: 'search', action: 'Search messages' },
                    { name: 'Send', value: 'send', action: 'Send a message' },
                    { name: 'Send Reply', value: 'sendReply', action: 'Send a reply to a message' },
                ],
                default: 'send',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['directMessage'] } },
                options: [
                    { name: 'Send', value: 'send', action: 'Send a direct message' },
                    { name: 'Send to Group', value: 'sendToGroup', action: 'Send a group direct message' },
                ],
                default: 'send',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['channel'] } },
                options: [
                    { name: 'Add Users', value: 'addUsers', action: 'Add users to a channel' },
                    { name: 'Create', value: 'create', action: 'Create a channel' },
                    { name: 'Get', value: 'get', action: 'Get a channel' },
                    { name: 'Get Many', value: 'getMany', action: 'Get many channels' },
                    { name: 'Remove User', value: 'removeUser', action: 'Remove a user from a channel' },
                ],
                default: 'getMany',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['scheduledMessage'] } },
                options: [
                    { name: 'Create', value: 'create', action: 'Create a scheduled message' },
                    { name: 'Delete', value: 'delete', action: 'Delete a scheduled message' },
                    { name: 'Edit', value: 'edit', action: 'Edit a scheduled message' },
                    { name: 'Get', value: 'get', action: 'Get a scheduled message' },
                    { name: 'Get Many', value: 'getMany', action: 'Get many scheduled messages' },
                ],
                default: 'create',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['user'] } },
                options: [
                    { name: 'Get Many', value: 'getMany', action: 'Get many users' },
                    { name: 'Get Groups', value: 'getGroups', action: 'Get user groups' },
                    { name: 'Get Me', value: 'getMe', action: 'Get own user profile' },
                ],
                default: 'getMany',
            },

            // ── Operation parameters — spread from each resource index ───
            ...message.sendDescription,
            ...message.sendReplyDescription,
            ...message.editDescription,
            ...message.deleteDescription,
            ...message.getDescription,
            ...message.getManyDescription,
            ...message.searchDescription,
            ...message.getThreadRepliesDescription,

            ...directMessage.sendDescription,
            ...directMessage.sendToGroupDescription,

            ...channel.getManyDescription,
            ...channel.getDescription,
            ...channel.createDescription,
            ...channel.addUsersDescription,
            ...channel.removeUserDescription,

            ...scheduledMessage.createDescription,
            ...scheduledMessage.getManyDescription,
            ...scheduledMessage.getDescription,
            ...scheduledMessage.editDescription,
            ...scheduledMessage.deleteDescription,

            ...user.getManyDescription,
            ...user.getGroupsDescription,
            ...user.getMeDescription,
        ],
    };

    // ── Load Options Methods ─────────────────────────────────────────────────
    // These methods are called dynamically by n8n when the user opens a dropdown.
    // They fetch live data from Pumble and populate the field options in real time.
    methods = {
        loadOptions: {
            // Loads all channels the authenticated user is a member of
            async getChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const responseData = await pumbleApiRequest.call(this, 'GET', '/listChannels', {}, {});
                const items = (responseData.channels ?? responseData) as IDataObject[];
                const channels = Array.isArray(items) ? items : [responseData];
            
                const options: INodePropertyOptions[] = [];
            
                for (const item of channels) {
                    const ch = (item.channel ?? item) as IDataObject;
                    const type = ch.channelType as string;
                    const name = ch.name as string;
                
                    // Skip DIRECT channels — they have no meaningful name
                    if (type === 'DIRECT') continue;
                
                    let label: string;
                    if (type === 'PUBLIC' || type === 'PRIVATE') {
                        label = `#${name}`;
                    } else if (type === 'SELF') {
                        label = 'Personal (me)';
                    } else {
                        continue;
                    }
                
                    options.push({
                        name: label,
                        value: ch.id as string,
                    });
                }
            
                return options;
            },


            // Loads all users in the workspace
            async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const responseData = await pumbleApiRequest.call(this, 'GET', '/listUsers', {}, {});
                const items = (responseData.users ?? responseData) as IDataObject[];
                const users = Array.isArray(items) ? items : [responseData];

                return users.map((user) => ({
                    name: (user.name ?? user.email ?? user.id) as string,
                    value: user.id as string,
                }));
            },
        },
    };



    // ── Main execute method ──────────────────────────────────────────────────
    // Loops over all input items, dispatches each to the correct operation,
    // and handles errors via continueOnFail — defined once here for all operations.
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const resource  = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                let result: INodeExecutionData[] = [];

                if (resource === 'message') {
                    if (operation === 'send')               result = await message.sendExecute.call(this, i);
                    else if (operation === 'sendReply')     result = await message.sendReplyExecute.call(this, i);
                    else if (operation === 'edit')          result = await message.editExecute.call(this, i);
                    else if (operation === 'delete')        result = await message.deleteExecute.call(this, i);
                    else if (operation === 'get')           result = await message.getExecute.call(this, i);
                    else if (operation === 'getMany')       result = await message.getManyExecute.call(this, i);
                    else if (operation === 'search')        result = await message.searchExecute.call(this, i);
                    else if (operation === 'getThreadReplies') result = await message.getThreadRepliesExecute.call(this, i);

                } else if (resource === 'directMessage') {
                    if (operation === 'send')               result = await directMessage.sendExecute.call(this, i);
                    else if (operation === 'sendToGroup')   result = await directMessage.sendToGroupExecute.call(this, i);

                } else if (resource === 'channel') {
                    if (operation === 'getMany')            result = await channel.getManyExecute.call(this, i);
                    else if (operation === 'get')           result = await channel.getExecute.call(this, i);
                    else if (operation === 'create')        result = await channel.createExecute.call(this, i);
                    else if (operation === 'addUsers')      result = await channel.addUsersExecute.call(this, i);
                    else if (operation === 'removeUser')    result = await channel.removeUserExecute.call(this, i);

                } else if (resource === 'scheduledMessage') {
                    if (operation === 'create')             result = await scheduledMessage.createExecute.call(this, i);
                    else if (operation === 'getMany')       result = await scheduledMessage.getManyExecute.call(this, i);
                    else if (operation === 'get')           result = await scheduledMessage.getExecute.call(this, i);
                    else if (operation === 'edit')          result = await scheduledMessage.editExecute.call(this, i);
                    else if (operation === 'delete')        result = await scheduledMessage.deleteExecute.call(this, i);

                } else if (resource === 'user') {
                    if (operation === 'getMany')            result = await user.getManyExecute.call(this, i);
                    else if (operation === 'getGroups')     result = await user.getGroupsExecute.call(this, i);
                    else if (operation === 'getMe')         result = await user.getMeExecute.call(this, i);
                }

                returnData.push(...result);

            } catch (error) {
                // continueOnFail is handled once here — covers all 26 operations uniformly.
                // If enabled, failed items are passed through with their error message
                // so the workflow can continue processing the remaining items.
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: (error as Error).message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}

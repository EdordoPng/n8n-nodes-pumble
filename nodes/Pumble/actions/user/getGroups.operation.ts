import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { pumbleApiRequest } from '../../GenericFunctions';

// 1. Definiamo l'interfaccia (ora la useremo davvero)
interface IPumbleUserGroup extends IDataObject {
	id: string;
	workspaceId: string;
	name: string;
	handle: string;
	description?: string;
	disabled: boolean;
	workspaceUserIds: string[];
}

export const description: INodeProperties[] = [
	{
		displayName: 'Notice',
		name: 'notice',
		type: 'notice',
		default: 'This operation retrieves all user groups in the workspace.',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getGroups'],
			},
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	
	const responseData = (await pumbleApiRequest.call(
		this,
		'GET',
		'/listUserGroups'
	)) as unknown;

	// 2. Usiamo l'interfaccia qui per tipizzare l'array
	let results: IPumbleUserGroup[] = [];

	if (Array.isArray(responseData)) {
		// Castiamo all'interfaccia specifica
		results = responseData as IPumbleUserGroup[];
	} else if (responseData !== null && typeof responseData === 'object') {
		const responseObj = responseData as IDataObject;
		
		// Fallback nel caso l'API risponda con un oggetto wrapper
		if (responseObj.userGroups && Array.isArray(responseObj.userGroups)) {
			results = responseObj.userGroups as IPumbleUserGroup[];
		} else {
			// Se è un singolo oggetto gruppo, lo mettiamo nell'array
			results = [responseObj as IPumbleUserGroup];
		}
	}

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(results),
		{ itemData: { item: i } },
	);
}
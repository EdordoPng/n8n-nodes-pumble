// Aggregator for all message resource operations.
// Pumble.node.ts imports this file to access descriptions and execute functions
// for every operation in this resource — without knowing the internal file structure.

export { description as sendDescription, execute as sendExecute } from './send.operation';
export { description as sendReplyDescription, execute as sendReplyExecute } from './sendReply.operation';
export { description as editDescription, execute as editExecute } from './edit.operation';
export { description as deleteDescription, execute as deleteExecute } from './delete.operation';
export { description as getDescription, execute as getExecute } from './get.operation';
export { description as getManyDescription, execute as getManyExecute } from './getMany.operation';
export { description as searchDescription, execute as searchExecute } from './search.operation';
export { description as getThreadRepliesDescription, execute as getThreadRepliesExecute } from './getThreadReplies.operation';

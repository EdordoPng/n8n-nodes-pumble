// Aggregator for all scheduledMessage resource operations.

export { description as createDescription, execute as createExecute } from './create.operation';
export { description as getManyDescription, execute as getManyExecute } from './getMany.operation';
export { description as getDescription, execute as getExecute } from './get.operation';
export { description as editDescription, execute as editExecute } from './edit.operation';
export { description as deleteDescription, execute as deleteExecute } from './delete.operation';

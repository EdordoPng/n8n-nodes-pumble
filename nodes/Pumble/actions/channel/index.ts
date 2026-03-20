// Aggregator for all channel resource operations.

export { description as getManyDescription, execute as getManyExecute } from './getMany.operation';
export { description as getDescription, execute as getExecute } from './get.operation';
export { description as createDescription, execute as createExecute } from './create.operation';
export { description as addUsersDescription, execute as addUsersExecute } from './addUsers.operation';
export { description as removeUserDescription, execute as removeUserExecute } from './removeUser.operation';

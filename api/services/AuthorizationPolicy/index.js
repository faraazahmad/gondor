import PolicyBuilder from './PolicyBuilder';
import { createPolicy as cp } from './EntityPolicy';

export default class AuthorizationPolicy extends PolicyBuilder {
  /* NOTE(naman): example
   * AuthorizationPolicy.can(viewer).perform('email:read').on(MyEntity, 'entity_name');
   * or
   * AuthorizationPolicy.can(viewer).perform('email:read').on(MyEntityInstance);
   */
  static can = viewer => ({
    perform: new AuthorizationPolicy(viewer).authorize,
  });

  /* NOTE(naman): example
   * AuthorizationPolicy.for(viewer).gather(MyEntity, 'entity_name').concerns;
   * or
   * AuthorizationPolicy.for(viewer).gather(MyEntityInstance).properties;
   */
  static for = viewer => ({
    gather: new AuthorizationPolicy(viewer).gather,
  });

  _features = cp(policy => {
    policy.register('teamManagement', () => this.isAdmin);
  });

  _user = cp(policy => {
    const isSelf = user => user.id === this.viewer?.id;

    policy.register('read', () => !!this.viewer);
    policy.register('update', user => isSelf(user) || this.isAdmin);

    policy.include(['email', 'mobile_number', 'photo'], p => {
      p.register('read', user => isSelf(user) || this.isAdmin || this.isMember);
      p.register('update', user => isSelf(user) || this.isAdmin);
    });

    policy.include('roles', p => {
      p.register('read', user => isSelf(user) || this.isAdmin || this.isMember);
      p.register('update', user => this.isAdmin);
    });
  });
}

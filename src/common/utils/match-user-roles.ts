import { Role } from 'src/modules/role/entities/role.entity';

export const matchUserRoles = (roles: string[], userRoles: Role[]): boolean => {
  const upperCased = roles.map((r) => r.toUpperCase());
  return userRoles.some((userRole) => upperCased.includes(userRole.title));
};

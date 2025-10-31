import { customPermissions } from "@/lib/auth/permissions";

// Extract the resource names (story, comment, etc.)
export type PermissionResource = keyof typeof customPermissions;

// Extract all permissions for a specific resource
export type PermissionsForResource<T extends PermissionResource> =
    (typeof customPermissions)[T][number];

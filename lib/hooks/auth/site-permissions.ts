import { getSitePermissions } from "@/lib/auth/policies/site-policy";
import { useQuery } from "@tanstack/react-query";

export const useSitePermissions = ({
    currentOrganizationId,
    userId,
}: {
    currentOrganizationId: string | undefined;
    userId: string | undefined;
}) => {
    return useQuery({
        queryKey: ["site-permissions", { currentOrganizationId, userId }],
        queryFn: async () => {
            try {
                const permissions = await getSitePermissions({
                    currentOrganizationId,
                    userId,
                });

                return permissions;
            } catch {
                throw new Error("Failed to fetch site permissions");
            }
        },
        enabled: !!currentOrganizationId && !!userId,
    });
};

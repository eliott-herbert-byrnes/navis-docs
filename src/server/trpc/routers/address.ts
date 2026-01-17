import { createAuditLog } from "@/features/audit/utils/audit";
import {
  router,
  orgProcedure,
  adminProcedure,
  rateLimitMiddleware,
} from "@/server/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const addressRouter = router({
  listAddress: orgProcedure.query(async ({ ctx }) => {
    const addresses = await ctx.db.address.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: addresses,
    };
  }),
  createAddress: adminProcedure
    .use(rateLimitMiddleware("address-create"))
    .input(
      z.object({
        name: z.string().min(1, { message: "Name is required" }).max(100),
        address: z.string().min(1, { message: "Address is required" }).max(255),
        phone: z.string().max(20).optional().or(z.literal("")),
        email: z
          .string()
          .email({ message: "Invalid email" })
          .optional()
          .or(z.literal("")),
        website: z
          .string({ message: "Invalid URL" })
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newAddress = await ctx.db.address.create({
        data: {
          name: input.name,
          address: input.address,
          phone: input.phone ?? "",
          email: input.email ?? "",
          website: input.website ?? "",
        },
      });

      await createAuditLog({
        orgId: ctx.org?.id ?? "",
        actorId: ctx.user?.id ?? "",
        action: "ADDRESS_CREATED",
        entityType: "ADDRESS",
        entityId: newAddress.id,
        afterJSON: JSON.parse(JSON.stringify(newAddress)),
      });

      return {
        data: newAddress,
      };
    }),
  addressDelete: adminProcedure
    .use(rateLimitMiddleware("address-delete"))
    .input(
      z.object({
        addressId: z.string().min(1, { message: "Address ID is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentAddress = await ctx.db.address.findUnique({
        where: { id: input.addressId },
      });
      if (!currentAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      const deletedAddress = await ctx.db.address.delete({
        where: { id: input.addressId },
      });

      await createAuditLog({
        orgId: ctx.org?.id ?? "",
        actorId: ctx.user?.id ?? "",
        action: "ADDRESS_DELETED",
        entityType: "ADDRESS",
        entityId: input.addressId,
        beforeJSON: JSON.parse(JSON.stringify(deletedAddress)),
      });

      return {
        data: deletedAddress,
      };
    }),
});

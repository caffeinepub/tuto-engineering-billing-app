import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address, CompanyHeader, CostRow, Invoice } from "../backend";
import { useActor } from "./useActor";

export function useListInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.listInvoices();
        // Sort by date descending (newest first)
        return [...result].sort((a, b) => {
          const dateA = Number(a.date);
          const dateB = Number(b.date);
          return dateB - dateA;
        });
      } catch (err) {
        // Gracefully handle network failures (e.g. offline)
        console.warn("[useListInvoices] Failed to fetch invoices:", err);
        throw err;
      }
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, _error) => {
      // Don't retry if we're offline; retry up to 2 times otherwise
      if (!navigator.onLine) return false;
      return failureCount < 2;
    },
  });
}

export function useGetInvoice(invoiceNumber: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice>({
    queryKey: ["invoice", invoiceNumber?.toString()],
    queryFn: async () => {
      if (!actor || invoiceNumber === null)
        throw new Error("No invoice number");
      try {
        return await actor.getInvoice(invoiceNumber);
      } catch (err) {
        console.warn("[useGetInvoice] Failed to fetch invoice:", err);
        throw err;
      }
    },
    enabled: !!actor && !isFetching && invoiceNumber !== null,
    retry: (failureCount) => {
      if (!navigator.onLine) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      companyHeader: CompanyHeader;
      billTo: Address;
      shippedTo: Address;
      materialCosts: CostRow[];
      fabricationCosts: CostRow[];
      loadingCharges: bigint;
      shippingCharges: bigint;
      advanceAmount: bigint;
      declaration: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!navigator.onLine)
        throw new Error(
          "You are offline. Please reconnect to save the invoice.",
        );
      return actor.createInvoice(
        params.companyHeader,
        params.billTo,
        params.shippedTo,
        params.materialCosts,
        params.fabricationCosts,
        params.loadingCharges,
        params.shippingCharges,
        params.advanceAmount,
        params.declaration,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceNumber: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      if (!navigator.onLine)
        throw new Error(
          "You are offline. Please reconnect to delete the invoice.",
        );
      return actor.deleteInvoice(invoiceNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

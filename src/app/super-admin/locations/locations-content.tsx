"use client";

import { PageHeader, Card, Table, Td, Pagination } from "@/components/ui";
import { useAllLocations } from "@/lib/services/super-admin";
import { usePagination } from "@/lib/use-pagination";

export function LocationsContent() {
  const standorte = useAllLocations();
  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems, pageSizeOptions } = usePagination(standorte);

  return (
    <>
      <PageHeader
        title="Standorte"
        subtitle="Küchen- und Produktionsstandorte aller Mandanten."
      />
      <Card>
        <Table head={["Standort", "Mandant"]}>
          {pageItems.map((s) => (
            <tr key={s.id} className="hover:bg-paper">
              <Td className="font-medium text-ink">{s.name}</Td>
              <Td className="text-muted">{s.tenantName}</Td>
            </tr>
          ))}
        </Table>
        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems}
          onPageChange={setPage} onPageSizeChange={setPageSize} pageSizeOptions={pageSizeOptions}
        />
      </Card>
    </>
  );
}

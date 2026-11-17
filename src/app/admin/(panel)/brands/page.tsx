import Link from "next/link";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { BrandForm } from "@/components/admin/brand-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminPage } from "@/lib/auth/session";
import { deleteBrandAction } from "@/modules/brands/actions";
import { listBrandsForAdmin } from "@/modules/brands/queries";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireAdminPage();
  const { edit } = await searchParams;
  const brands = await listBrandsForAdmin();
  const editing = brands.find((brand) => brand.id === edit);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Brands</h1>
      <p className="text-muted-foreground mt-3 mb-6 text-sm">
        Suppliers choose from these, and every product belongs to one. A brand
        can only be deleted when nothing uses it.
      </p>

      <section className="bg-card mb-6 rounded-2xl border p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">
          {editing ? `Rename ${editing.name}` : "Add a brand"}
        </h2>
        <BrandForm key={editing?.id ?? "new"} brand={editing} />
      </section>

      {brands.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
          No brands yet.
        </div>
      ) : (
        <div className="bg-card rounded-2xl border p-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {brand.productCount}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {brand.supplierCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link href={`/admin/brands?edit=${brand.id}`} />
                        }
                      >
                        Rename
                      </Button>
                      <AdminActionButton
                        label="Delete"
                        confirmMessage={`Delete ${brand.name}? This can't be undone.`}
                        action={deleteBrandAction.bind(null, brand.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

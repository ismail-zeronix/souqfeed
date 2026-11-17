import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { BrandForm } from "@/components/admin/brand-form";
import {
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin/admin-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const metadata: Metadata = { title: "Brands" };

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
      <AdminPageHeader
        title="Brands"
        description="Suppliers choose from these, and every product belongs to one. A brand can only be deleted when nothing uses it."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {editing ? `Rename ${editing.name}` : "Add a brand"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BrandForm key={editing?.id ?? "new"} brand={editing} />
        </CardContent>
      </Card>

      {brands.length === 0 ? (
        <AdminEmptyState>No brands yet.</AdminEmptyState>
      ) : (
        <Card className="py-0">
          <CardContent className="px-2 sm:px-3">
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
          </CardContent>
        </Card>
      )}
    </>
  );
}

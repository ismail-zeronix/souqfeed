import Link from "next/link";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminPage } from "@/lib/auth/session";
import { listBrands } from "@/modules/brands/queries";
import { listCategoriesForAdmin } from "@/modules/categories/queries";
import { setProductActiveAction } from "@/modules/products/actions";
import {
  parseProductFilters,
  toProductListUrl,
} from "@/modules/products/filters";
import { listProductsForAdmin } from "@/modules/products/queries";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const filters = parseProductFilters(await searchParams);
  const [result, brands, categories] = await Promise.all([
    listProductsForAdmin(filters),
    listBrands(),
    listCategoriesForAdmin(),
  ]);
  const isFiltered = Boolean(
    filters.query || filters.brandId || filters.categoryId,
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            The canonical catalog that supplier broadcasts get matched against.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/products/new" />}
        >
          Add product
        </Button>
      </div>

      <form
        method="get"
        action="/admin/products"
        className="bg-card mb-6 grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_11rem_11rem_auto]"
      >
        <Input
          name="q"
          type="search"
          aria-label="Search products"
          placeholder="Title, part number, model, or alias"
          defaultValue={filters.query}
        />
        <NativeSelect
          name="brand"
          aria-label="Filter by brand"
          defaultValue={filters.brandId ?? ""}
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="category"
          aria-label="Filter by category"
          defaultValue={filters.categoryId ?? ""}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {`${"— ".repeat(category.depth)}${category.name}`}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {result.rows.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
          {isFiltered
            ? "No products match this search."
            : "No products yet. Add the first one."}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border p-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Part number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-72 font-medium whitespace-normal">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="hover:underline"
                    >
                      {product.title}
                    </Link>
                  </TableCell>
                  <TableCell>{product.brandName}</TableCell>
                  <TableCell>{product.categoryName ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">
                    {product.partNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "default" : "destructive"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={`/admin/products/${product.id}`} />}
                      >
                        Edit
                      </Button>
                      <AdminActionButton
                        label={product.active ? "Deactivate" : "Reactivate"}
                        action={setProductActiveAction.bind(
                          null,
                          product.id,
                          !product.active,
                        )}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <nav
        aria-label="Pagination"
        className="text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        <span>
          {result.total} {result.total === 1 ? "product" : "products"}
          {result.totalPages > 1 &&
            `, page ${result.page} of ${result.totalPages}`}
        </span>
        {result.totalPages > 1 && (
          <div className="flex gap-2">
            {result.page > 1 && (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={toProductListUrl(filters, result.page - 1)} />
                }
              >
                Previous
              </Button>
            )}
            {result.page < result.totalPages && (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={toProductListUrl(filters, result.page + 1)} />
                }
              >
                Next
              </Button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

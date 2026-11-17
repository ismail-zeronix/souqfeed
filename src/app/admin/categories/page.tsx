import Link from "next/link";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { CategoryForm } from "@/components/admin/category-form";
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
import { deleteCategoryAction } from "@/modules/categories/actions";
import { listCategoriesForAdmin } from "@/modules/categories/queries";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireAdminPage();
  const { edit } = await searchParams;
  const categories = await listCategoriesForAdmin();
  const editing = categories.find((category) => category.id === edit);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
      <p className="text-muted-foreground mt-3 mb-6 text-sm">
        A category can only be deleted when it has no subcategories, products,
        or suppliers.
      </p>

      <section className="bg-card mb-6 rounded-2xl border p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">
          {editing ? `Edit ${editing.name}` : "Add a category"}
        </h2>
        <CategoryForm
          key={editing?.id ?? "new"}
          category={editing}
          allCategories={categories}
        />
      </section>

      {categories.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
          No categories yet.
        </div>
      ) : (
        <div className="bg-card rounded-2xl border p-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <span
                      style={{ paddingLeft: `${category.depth * 1.25}rem` }}
                    >
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {category.childCount}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {category.productCount}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {category.supplierCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/admin/categories?edit=${category.id}`}
                          />
                        }
                      >
                        Edit
                      </Button>
                      <AdminActionButton
                        label="Delete"
                        confirmMessage={`Delete ${category.name}? This can't be undone.`}
                        action={deleteCategoryAction.bind(null, category.id)}
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

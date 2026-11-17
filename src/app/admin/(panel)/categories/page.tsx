import type { Metadata } from "next";
import Link from "next/link";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { CategoryForm } from "@/components/admin/category-form";
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
import { deleteCategoryAction } from "@/modules/categories/actions";
import { listCategoriesForAdmin } from "@/modules/categories/queries";

export const metadata: Metadata = { title: "Categories" };

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
      <AdminPageHeader
        title="Categories"
        description="A category can only be deleted when it has no subcategories, products, or suppliers."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {editing ? `Edit ${editing.name}` : "Add a category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            key={editing?.id ?? "new"}
            category={editing}
            allCategories={categories}
          />
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <AdminEmptyState>No categories yet.</AdminEmptyState>
      ) : (
        <Card className="py-0">
          <CardContent className="px-2 sm:px-3">
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
          </CardContent>
        </Card>
      )}
    </>
  );
}

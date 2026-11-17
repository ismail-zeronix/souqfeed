"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/admin/admin-page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminSetActive, adminSetVerified } from "@/modules/suppliers/actions";
import type { AdminActionResult } from "@/lib/validation/form";
import type { AdminSupplierRow } from "@/modules/suppliers/types";

function SupplierRow({ supplier }: { supplier: AdminSupplierRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<AdminActionResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) setError(result.message);
      } catch {
        setError("We couldn't reach the server. Please try again.");
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {supplier.active ? (
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="hover:underline"
          >
            {supplier.companyName}
          </Link>
        ) : (
          supplier.companyName
        )}
        {error && (
          <p role="alert" className="text-destructive mt-1 text-xs font-normal">
            {error}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={supplier.verified ? "default" : "secondary"}>
          {supplier.verified ? "Verified" : "Not verified"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={supplier.active ? "default" : "destructive"}>
          {supplier.active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() => adminSetVerified(supplier.id, !supplier.verified))
            }
          >
            {supplier.verified ? "Unverify" : "Verify"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() => adminSetActive(supplier.id, !supplier.active))
            }
          >
            {supplier.active ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AdminSupplierTable({
  suppliers,
}: {
  suppliers: AdminSupplierRow[];
}) {
  if (suppliers.length === 0) {
    return (
      <AdminEmptyState>
        No suppliers have created a profile yet.
      </AdminEmptyState>
    );
  }

  return (
    <Card className="py-0">
      <CardContent className="px-2 sm:px-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <SupplierRow key={supplier.id} supplier={supplier} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

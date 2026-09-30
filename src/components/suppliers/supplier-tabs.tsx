"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SupplierTabs({ liveOffersContent }: { liveOffersContent: ReactNode }) {
  return (
    <Tabs defaultValue="live-offers">
      <TabsList>
        <TabsTrigger value="live-offers">Live Offers</TabsTrigger>
        <TabsTrigger value="history">Broadcast History</TabsTrigger>
        <TabsTrigger value="about">About Supplier</TabsTrigger>
        <TabsTrigger value="brands">Brands & Categories</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <TabsContent value="live-offers">{liveOffersContent}</TabsContent>
      <TabsContent value="history">
        <p className="py-8 text-center text-sm text-muted-foreground">Broadcast history is not available yet.</p>
      </TabsContent>
      <TabsContent value="about">
        <p className="py-8 text-center text-sm text-muted-foreground">
          Supplier details are shown in the header above.
        </p>
      </TabsContent>
      <TabsContent value="brands">
        <p className="py-8 text-center text-sm text-muted-foreground">
          Brand and category management is not available yet.
        </p>
      </TabsContent>
      <TabsContent value="contact">
        <p className="py-8 text-center text-sm text-muted-foreground">See Contact Information in the sidebar.</p>
      </TabsContent>
    </Tabs>
  );
}

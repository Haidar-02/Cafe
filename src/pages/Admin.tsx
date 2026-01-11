"use client";

import React, { useState, useMemo } from 'react';
import LoginProtected from "@/components/LoginProtected";
import { useRTL } from "@/lib/rtl-context";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

import POS from "./POS";
import Kitchen from "./Kitchen";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabsList } from "@/components/admin/AdminTabsList";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ArchiveTab } from "@/components/admin/ArchiveTab";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { StockTab } from "@/components/admin/StockTab";
import { ExpensesTab } from "@/components/admin/ExpensesTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { StatsTab } from "@/components/admin/StatsTab";
import { PrefsTab } from "@/components/admin/PrefsTab";
import { AuditLogTab } from "@/components/admin/AuditLogTab";

import { ProductModal } from "@/components/admin/modals/ProductModal";
import { StockModal } from "@/components/admin/modals/StockModal";
import { UserModal } from "@/components/admin/modals/UserModal";
import { CategoryModal } from "@/components/admin/modals/CategoryModal";
import { OrderEditModal } from "@/components/admin/modals/OrderEditModal";
import { ExpenseModal } from "@/components/admin/modals/ExpenseModal";

const ORDERS_PER_PAGE = 8;

const AdminContent = ({ user }: { user: any }) => {
  const { isRTL } = useRTL();
  const queryClient = useQueryClient();
  const isAdmin = user.role === 'admin';

  const [activeTab, setActiveTab] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Products Filters
  const [productCatFilter, setProductCatFilter] = useState<string>("all");

  // Orders Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderDateFilter, setOrderDateFilter] = useState<boolean>(false);
  const [orderPage, setOrderPage] = useState(1);

  // Modal States
  const [modals, setModals] = useState({
    user: { open: false, item: null },
    product: { open: false, item: null },
    stock: { open: false, item: null },
    order: { open: false, item: null },
    cat: { open: false, item: null },
    expense: { open: false, item: null }
  });

  // Queries
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: api.getUsers, enabled: isAdmin });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: api.getOrders });
  const { data: archivedOrders = [] } = useQuery({ queryKey: ['archived-orders'], queryFn: api.getArchivedOrders });
  const { data: archivedExpenses = [] } = useQuery({ queryKey: ['archived-expenses'], queryFn: api.getArchivedExpenses });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: api.getProducts });
  const { data: stock = [] } = useQuery({ queryKey: ['stock'], queryFn: api.getStock });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });

  const refresh = () => queryClient.invalidateQueries();

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const statusMatch = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const dateMatch = !orderDateFilter || new Date(o.created_at).toDateString() === new Date().toDateString();
      const searchMatch = String(o.id).includes(searchQuery);
      return statusMatch && dateMatch && searchMatch;
    });
  }, [orders, orderStatusFilter, orderDateFilter, searchQuery]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);

  return (
    <div className="min-h-screen bg-stone-50 font-arabic flex flex-col">
      <AdminHeader userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSearchQuery(""); }} className="flex-1 flex flex-col">
          <AdminTabsList isAdmin={isAdmin} />

          <ScrollArea className="flex-1">
            <div className="p-4 max-w-7xl mx-auto w-full pb-24">
              <TabsContent value="pos" className="mt-0"><POS /></TabsContent>
              <TabsContent value="kitchen" className="mt-0"><Kitchen /></TabsContent>
              
              <TabsContent value="orders">
                <OrdersTab 
                  paginatedOrders={paginatedOrders}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  orderDateFilter={orderDateFilter}
                  setOrderDateFilter={setOrderDateFilter}
                  orderStatusFilter={orderStatusFilter}
                  setOrderStatusFilter={setOrderStatusFilter}
                  orderPage={orderPage}
                  totalOrderPages={totalOrderPages}
                  setOrderPage={setOrderPage}
                  onEdit={(item) => setModals(prev => ({ ...prev, order: { open: true, item } }))}
                  refresh={refresh}
                  isAdmin={isAdmin}
                />
              </TabsContent>

              <TabsContent value="archive">
                 <ArchiveTab archivedOrders={archivedOrders} archivedExpenses={archivedExpenses} refresh={refresh} />
              </TabsContent>

              {isAdmin && (
                <>
                  <TabsContent value="products">
                    <ProductsTab 
                      products={products}
                      categories={categories}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      catFilter={productCatFilter}
                      setCatFilter={setProductCatFilter}
                      onEdit={(item) => setModals(prev => ({ ...prev, product: { open: true, item } }))}
                      onNew={() => setModals(prev => ({ ...prev, product: { open: true, item: null } }))}
                      refresh={refresh}
                    />
                  </TabsContent>

                  <TabsContent value="stock">
                    <StockTab 
                      stock={stock}
                      onEdit={(item) => setModals(prev => ({ ...prev, stock: { open: true, item } }))}
                      onNew={() => setModals(prev => ({ ...prev, stock: { open: true, item: null } }))}
                      refresh={refresh}
                    />
                  </TabsContent>

                  <TabsContent value="expenses">
                    <ExpensesTab 
                      onEdit={(item) => setModals(prev => ({ ...prev, expense: { open: true, item } }))}
                      onNew={() => setModals(prev => ({ ...prev, expense: { open: true, item: null } }))}
                      refresh={refresh}
                    />
                  </TabsContent>

                  <TabsContent value="users">
                    <UsersTab 
                      users={users}
                      onEdit={(item) => setModals(prev => ({ ...prev, user: { open: true, item } }))}
                      onNew={() => setModals(prev => ({ ...prev, user: { open: true, item: null } }))}
                      refresh={refresh}
                    />
                  </TabsContent>

                  <TabsContent value="stats">
                    <StatsTab />
                  </TabsContent>

                  <TabsContent value="logs">
                    <AuditLogTab />
                  </TabsContent>

                  <TabsContent value="prefs">
                    <PrefsTab 
                      settings={settings}
                      categories={categories}
                      onEditCat={(item) => setModals(prev => ({ ...prev, cat: { open: true, item } }))}
                      onNewCat={() => setModals(prev => ({ ...prev, cat: { open: true, item: null } }))}
                      refresh={refresh}
                    />
                  </TabsContent>
                </>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      <ProductModal 
        open={modals.product.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, product: { ...prev.product, open: o } }))}
        item={modals.product.item}
        categories={categories}
        refresh={refresh}
      />

      <StockModal 
        open={modals.stock.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, stock: { ...prev.stock, open: o } }))}
        item={modals.stock.item}
        refresh={refresh}
      />

      <ExpenseModal 
        open={modals.expense.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, expense: { ...prev.expense, open: o } }))}
        item={modals.expense.item}
        refresh={refresh}
      />

      <UserModal 
        open={modals.user.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, user: { ...prev.user, open: o } }))}
        item={modals.user.item}
        refresh={refresh}
      />

      <CategoryModal 
        open={modals.cat.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, cat: { ...prev.cat, open: o } }))}
        item={modals.cat.item}
        refresh={refresh}
      />

      <OrderEditModal 
        open={modals.order.open} 
        onOpenChange={(o) => setModals(prev => ({ ...prev, order: { ...prev.order, open: o } }))}
        order={modals.order.item}
        setOrder={(item) => setModals(prev => ({ ...prev, order: { ...prev.order, item } }))}
        refresh={refresh}
      />
    </div>
  );
};

const Admin = () => (<LoginProtected>{(user) => <AdminContent user={user} />}</LoginProtected>);
export default Admin;
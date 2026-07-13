import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MasterSidebar } from "@/components/shell/MasterSidebar";
import { MASTER_SUITE_NAME } from "@/core/navigation";
import { Separator } from "@/components/ui/separator";

export default function MasterLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <MasterSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-3 backdrop-blur-md">
            <SidebarTrigger className="text-foreground" />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium text-muted-foreground">{MASTER_SUITE_NAME}</span>
          </header>
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

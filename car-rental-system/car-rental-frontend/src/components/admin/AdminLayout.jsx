
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <div className="admin-main">

                <div className="admin-mobile-topbar">
                    <button
                        className="admin-menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open admin menu"
                    >
                        ☰
                    </button>

                    <span>SCAN Admin</span>
                </div>

                <AdminHeader />

                <main className="admin-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;

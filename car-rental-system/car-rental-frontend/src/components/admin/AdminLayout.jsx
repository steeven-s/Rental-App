
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout() {

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            background: "#f8fafc"
        }}>

            <AdminSidebar />

            <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column"
            }}>

                <AdminHeader />

                <main style={{
                    padding: "28px",
                    flex: 1,
                    minWidth: 0,
                    boxSizing: "border-box",
                    background: "#f8fafc"
                }}>
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;

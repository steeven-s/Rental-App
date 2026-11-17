
function AdminHeader() {

    const user = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );

    return (
        <header style={{
            height: "70px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 25px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
        }}>

            <h3>Admin Panel</h3>

            <span>
                Welcome, {user.name || user.fullName || "Admin"}
            </span>

        </header>
    );
}

export default AdminHeader;

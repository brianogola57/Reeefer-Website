(() => {
    const storageKey = "rre-admin-demo-v1";
    const initialData = {
        products: [
            { id: "p1", name: "Patchwork Panel Jeans", category: "Donz & Dolls", price: 50, stock: 8 },
            { id: "p2", name: "Blue Logo Denim", category: "Donz & Dolls", price: 50, stock: 4 },
            { id: "p3", name: "Camo Pocket Trousers", category: "Donz & Dolls", price: 50, stock: 6 },
            { id: "p4", name: "Empire Hoodie", category: "Reefer Collection", price: 58, stock: 3 },
            { id: "p5", name: "Golden Hour Cake", category: "Reefer Bites", price: 12, stock: 12 }
        ],
        orders: [
            { id: "RRE-1042", customer: "Amani K.", date: "2026-10-28", method: "M-Pesa", total: 100, status: "Processing", paymentId: "pay1" },
            { id: "RRE-1041", customer: "Nia W.", date: "2026-10-28", method: "Bitcoin", total: 50, status: "Pending", paymentId: "pay2" },
            { id: "RRE-1040", customer: "Tariq M.", date: "2026-10-27", method: "Bank transfer", total: 108, status: "Shipped", paymentId: "pay3" },
            { id: "RRE-1039", customer: "Lena O.", date: "2026-10-26", method: "Pi Network", total: 62, status: "Delivered", paymentId: "pay4" }
        ],
        payments: [
            { id: "pay1", orderId: "RRE-1042", method: "M-Pesa", amount: 100, reference: "DEMO-MPESA-01", status: "Awaiting review" },
            { id: "pay2", orderId: "RRE-1041", method: "Bitcoin", amount: 50, reference: "DEMO-BTC-02", status: "Awaiting review" },
            { id: "pay3", orderId: "RRE-1040", method: "Bank transfer", amount: 108, reference: "DEMO-BANK-03", status: "Reviewed (demo)" },
            { id: "pay4", orderId: "RRE-1039", method: "Pi Network", amount: 62, reference: "DEMO-PI-04", status: "Reviewed (demo)" }
        ],
        coupons: [
            { code: "EMPIRE10", label: "Welcome offer", discount: 10, status: "Active" },
            { code: "ROUTE15", label: "Weekend drop", discount: 15, status: "Active" }
        ],
        accounts: [
            { id: "u1", name: "Amani K.", email: "amani@example.test", joined: "2026-09-10", orders: 3, status: "Active" },
            { id: "u2", name: "Nia W.", email: "nia@example.test", joined: "2026-09-18", orders: 1, status: "Active" },
            { id: "u3", name: "Tariq M.", email: "tariq@example.test", joined: "2026-10-02", orders: 2, status: "Active" }
        ]
    };

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const notice = document.getElementById("admin-notice");
    let data = clone(initialData);
    let storageAvailable = true;

    function showNotice(message, isError = false) {
        notice.textContent = message;
        notice.classList.toggle("admin-notice-error", isError);
        notice.hidden = false;
    }

    function loadData() {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === null) return;
            const parsed = JSON.parse(stored);
            const keys = ["products", "orders", "payments", "coupons", "accounts"];
            if (!parsed || keys.some((key) => !Array.isArray(parsed[key]))) {
                throw new Error("Saved demo data has an unexpected format.");
            }
            data = parsed;
        } catch (error) {
            storageAvailable = false;
            data = clone(initialData);
            showNotice(`Could not load browser demo data (${error.message}). Changes will remain in memory for this visit.`, true);
        }
    }

    function saveData() {
        if (!storageAvailable) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            storageAvailable = false;
            showNotice(`Could not save browser demo data (${error.message}). Changes will remain in memory for this visit.`, true);
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function formatMoney(value) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
    }

    function statusClass(status) {
        if (/active|delivered|reviewed/i.test(status)) return "status-green";
        if (/pending|awaiting|processing/i.test(status)) return "";
        return "status-grey";
    }

    function statusBadge(status) {
        return `<span class="admin-status ${statusClass(status)}">${escapeHtml(status)}</span>`;
    }

    function renderMetrics() {
        const totalSales = data.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const reviewCount = data.payments.filter((payment) => payment.status === "Awaiting review").length;
        const lowStockCount = data.products.filter((product) => Number(product.stock) <= 5).length;
        const totalUnits = data.products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
        const average = data.orders.length ? totalSales / data.orders.length : 0;
        document.getElementById("metric-sales").textContent = formatMoney(totalSales);
        document.getElementById("metric-orders").textContent = String(data.orders.length);
        document.getElementById("metric-review").textContent = String(reviewCount);
        document.getElementById("metric-stock").textContent = String(lowStockCount);
        document.getElementById("analytics-sales").textContent = formatMoney(totalSales);
        document.getElementById("analytics-average").textContent = formatMoney(average);
        document.getElementById("analytics-units").textContent = String(totalUnits);
        document.getElementById("analytics-coupons").textContent = String(data.coupons.filter((coupon) => coupon.status === "Active").length);
    }

    function renderRecentOrders() {
        document.getElementById("recent-orders").innerHTML = data.orders.slice(0, 4).map((order) => `
            <tr>
                <td class="table-primary">#${escapeHtml(order.id)}</td>
                <td>${escapeHtml(order.customer)}</td>
                <td>${formatMoney(Number(order.total))}</td>
                <td>${statusBadge(order.status)}</td>
            </tr>`).join("");
    }

    function renderInventory() {
        document.getElementById("inventory-rows").innerHTML = data.products.map((product) => `
            <tr>
                <td class="table-primary">${escapeHtml(product.name)}</td>
                <td>${escapeHtml(product.category)}</td>
                <td>${formatMoney(Number(product.price))}</td>
                <td>${Number(product.stock)}</td>
                <td>${statusBadge(Number(product.stock) <= 5 ? "Low stock" : "In stock")}</td>
                <td><button class="admin-button" type="button" data-stock-id="${escapeHtml(product.id)}">＋ Restock</button></td>
            </tr>`).join("");
    }

    function renderOrders() {
        const query = document.getElementById("order-search").value.trim().toLowerCase();
        const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
        const filtered = data.orders.filter((order) => `${order.id} ${order.customer}`.toLowerCase().includes(query));
        document.getElementById("order-rows").innerHTML = filtered.map((order) => `
            <tr>
                <td class="table-primary">#${escapeHtml(order.id)}</td>
                <td>${escapeHtml(order.customer)}</td>
                <td>${escapeHtml(order.date)}</td>
                <td>${escapeHtml(order.method)}</td>
                <td>${formatMoney(Number(order.total))}</td>
                <td><label class="sr-only" for="status-${escapeHtml(order.id)}">Fulfilment status for ${escapeHtml(order.id)}</label>
                    <select class="admin-select order-status" id="status-${escapeHtml(order.id)}" data-order-id="${escapeHtml(order.id)}">
                        ${statuses.map((status) => `<option${status === order.status ? " selected" : ""}>${status}</option>`).join("")}
                    </select>
                </td>
            </tr>`).join("");
        if (!filtered.length) {
            document.getElementById("order-rows").innerHTML = '<tr><td class="table-muted" colspan="6">No matching demo orders.</td></tr>';
        }
    }

    function renderPayments() {
        document.getElementById("payment-rows").innerHTML = data.payments.map((payment) => `
            <tr>
                <td class="table-primary">#${escapeHtml(payment.orderId)}</td>
                <td>${escapeHtml(payment.method)}</td>
                <td>${formatMoney(Number(payment.amount))}</td>
                <td>${escapeHtml(payment.reference)}</td>
                <td>${statusBadge(payment.status)}</td>
                <td>${payment.status === "Awaiting review"
                    ? `<button class="admin-button" type="button" data-payment-id="${escapeHtml(payment.id)}">Mark reviewed (demo)</button>`
                    : '<span class="table-muted">Demo only</span>'}</td>
            </tr>`).join("");
    }

    function renderCoupons() {
        document.getElementById("coupon-rows").innerHTML = data.coupons.map((coupon) => `
            <tr>
                <td class="table-primary">${escapeHtml(coupon.code)}</td>
                <td>${escapeHtml(coupon.label)}</td>
                <td>${Number(coupon.discount)}%</td>
                <td>${statusBadge(coupon.status)}</td>
            </tr>`).join("");
    }

    function renderAccounts() {
        document.getElementById("account-rows").innerHTML = data.accounts.map((account) => `
            <tr>
                <td class="table-primary">${escapeHtml(account.name)}</td>
                <td>${escapeHtml(account.email)}</td>
                <td>${escapeHtml(account.joined)}</td>
                <td>${Number(account.orders)}</td>
                <td>${statusBadge(account.status)}</td>
                <td><button class="admin-button" type="button" data-account-id="${escapeHtml(account.id)}">${account.status === "Active" ? "Suspend demo" : "Reactivate demo"}</button></td>
            </tr>`).join("");
    }

    function render() {
        renderMetrics();
        renderRecentOrders();
        renderInventory();
        renderOrders();
        renderPayments();
        renderCoupons();
        renderAccounts();
    }

    function openView(viewName) {
        const view = document.getElementById(`view-${viewName}`);
        if (!view) return;
        document.querySelectorAll(".admin-view").forEach((section) => {
            const visible = section === view;
            section.classList.toggle("is-visible", visible);
            section.hidden = !visible;
        });
        document.querySelectorAll(".admin-nav-link").forEach((button) => {
            const active = button.dataset.view === viewName;
            button.classList.toggle("is-active", active);
            if (active) button.setAttribute("aria-current", "page");
            else button.removeAttribute("aria-current");
        });
        document.getElementById("view-title").textContent = view.querySelector("h2")?.textContent || "Overview";
    }

    document.addEventListener("click", (event) => {
        const target = event.target.closest("button");
        if (!target) return;

        if (target.dataset.view || target.dataset.viewLink) {
            openView(target.dataset.view || target.dataset.viewLink);
            return;
        }
        if (target.dataset.stockId) {
            const product = data.products.find((item) => item.id === target.dataset.stockId);
            if (product) {
                product.stock = Number(product.stock) + 1;
                saveData();
                render();
                showNotice(`${product.name} stock increased by one in this browser demo.`);
            }
            return;
        }
        if (target.dataset.paymentId) {
            const payment = data.payments.find((item) => item.id === target.dataset.paymentId);
            if (payment && payment.status === "Awaiting review") {
                payment.status = "Reviewed (demo)";
                saveData();
                render();
                showNotice(`${payment.orderId} marked reviewed in demo data only. No payment was verified.`);
            }
            return;
        }
        if (target.dataset.accountId) {
            const account = data.accounts.find((item) => item.id === target.dataset.accountId);
            if (account) {
                account.status = account.status === "Active" ? "Suspended (demo)" : "Active";
                saveData();
                render();
                showNotice(`${account.name}'s sample account status changed in this browser demo.`);
            }
            return;
        }
        if (target.dataset.action === "add-product") {
            const name = window.prompt("Demo product name:");
            if (!name || !name.trim()) return;
            const price = Number(window.prompt("Demo price in USD:", "50"));
            const stock = Number(window.prompt("Starting demo stock:", "1"));
            if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
                showNotice("Enter a valid non-negative price and whole-number stock quantity.", true);
                return;
            }
            data.products.push({
                id: `p-${Date.now()}`,
                name: name.trim().slice(0, 60),
                category: "Demo product",
                price,
                stock
            });
            saveData();
            render();
            showNotice("Demo product added in this browser only.");
            return;
        }
        if (target.dataset.action === "reset") {
            if (!window.confirm("Reset all browser-only prototype changes to the sample data?")) return;
            data = clone(initialData);
            saveData();
            render();
            showNotice("Prototype data reset to the original sample records.");
        }
    });

    document.addEventListener("change", (event) => {
        const select = event.target.closest(".order-status");
        if (!select) return;
        const order = data.orders.find((item) => item.id === select.dataset.orderId);
        if (!order) return;
        order.status = select.value;
        saveData();
        render();
        showNotice(`${order.id} fulfilment updated in this browser demo.`);
    });

    document.getElementById("order-search").addEventListener("input", renderOrders);
    document.getElementById("coupon-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const discount = Number(form.elements.discount.value);
        const label = form.elements.label.value.trim();
        if (!label || !Number.isInteger(discount) || discount < 1 || discount > 90) {
            showNotice("Enter a campaign label and a whole-number discount between 1 and 90.", true);
            return;
        }
        const randomBytes = new Uint8Array(4);
        window.crypto.getRandomValues(randomBytes);
        const suffix = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
        const coupon = { code: `RRE-${suffix}`, label: label.slice(0, 40), discount, status: "Active" };
        data.coupons.unshift(coupon);
        saveData();
        render();
        form.reset();
        form.elements.discount.value = "10";
        showNotice(`${coupon.code} generated for ${coupon.discount}% off in this browser demo. It is not active at checkout.`);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
        button.setAttribute("aria-controls", `view-${button.dataset.view}`);
    });
    document.querySelectorAll(".admin-view").forEach((section) => {
        section.hidden = !section.classList.contains("is-visible");
    });
    loadData();
    render();
})();
